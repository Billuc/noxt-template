import type { Serve } from "bun";
import { type Attributes, type VNode } from "preact";
import renderToString from "preact-render-to-string";
import { renderToReadableStream } from "preact-render-to-string/stream";
import { mkdirSync, writeFileSync, cpSync } from "node:fs";
import path from "node:path";

export type Component = () => VNode<Attributes> | VNode<Attributes>[];

export type HandlerGenerator<Req extends Request, S> = (
  page: Component,
) => Serve.Handler<Req, S, Response> | Response;

export type ServerOptions = {
  development: boolean;
  outputDir?: string;
  publicDir?: string;
};

export type ServerFunctions<Req extends Request, S> = {
  prerender: HandlerGenerator<Req, S>;
  ssr: HandlerGenerator<Req, S>;
  staticFile: (path: string) => Response;
};

export function createServer<Req extends Request, S>(
  options: ServerOptions,
): ServerFunctions<Req, S> {
  if (options.development) {
    return createDevServer(options);
  } else {
    return createProdServer(options);
  }
}

function createProdServer<Req extends Request, S>(
  options: ServerOptions,
): ServerFunctions<Req, S> {
  const publicOutputDir = path.join(options.outputDir ?? "./dist", "public");
  if (options.publicDir) {
    cpSync(options.publicDir, publicOutputDir, { recursive: true });
  } else {
    mkdirSync(publicOutputDir, { recursive: true });
  }

  const prerender = (page: Component) => {
    const vnode = componentToVNode(page);
    const htmlContent = renderToString(vnode, {});
    const filepath = path.join(
      publicOutputDir,
      Bun.randomUUIDv7("base64url") + ".html",
    );
    writeFileSync(filepath, htmlContent);

    return new Response(Bun.file(filepath), {
      headers: { "Content-Type": "text/html" },
    });
  };

  const ssr = <Req extends Request, S>(page: Component) => {
    const handler: Serve.Handler<Req, S, Response> = (req, server) => {
      const stream = renderToReadableStream(componentToVNode(page), {
        req,
        server,
      });
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    };
    return handler;
  };

  const staticFile = (filepath: string): Response => {
    const fullFilepath = path.join(publicOutputDir, filepath);
    return new Response(Bun.file(fullFilepath));
  };

  return { prerender, ssr, staticFile };
}

function createDevServer<Req extends Request, S>(
  options: ServerOptions,
): ServerFunctions<Req, S> {
  const publicDir = options.publicDir ?? "./public";

  const prerender = (page: Component) => {
    const htmlContent = renderToString(componentToVNode(page), {});
    return new Response(htmlContent, {
      headers: { "Content-Type": "text/html" },
    });
  };

  const ssr = <Req extends Request, S>(page: Component) => {
    const handler: Serve.Handler<Req, S, Response> = (req, server) => {
      const stream = renderToReadableStream(componentToVNode(page), {
        req,
        server,
      });
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    };
    return handler;
  };

  const staticFile = (filepath: string): Response => {
    const fullFilepath = path.join(publicDir, filepath);
    return new Response(Bun.file(fullFilepath));
  };

  return { prerender, ssr, staticFile };
}

function componentToVNode(component: Component): VNode<Attributes> {
  const vnodes = component();
  const vnode = Array.isArray(vnodes) ? vnodes[0] : vnodes;
  if (!vnode) throw new Error("Component rendered to nothing");
  return vnode;
}
