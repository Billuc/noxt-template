import type { BunRequest } from "bun";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
import type { Attributes, ComponentType } from "preact";
import { h } from "preact";
import { renderToStringAsync } from "preact-render-to-string";
import { importPath } from "./path";
import { generateIslandScript } from "./islands";

const htmlHeaders = new Headers();
htmlHeaders.append("Content-Type", "text/html; charset=utf-8");

const imports = {
  imports: {
    preact: "https://esm.sh/preact@10.23.1",
    "preact/": "https://esm.sh/preact@10.23.1/",
    "htm/preact": "https://esm.sh/htm@3.1.1/preact?external=preact",
  },
};

export function deduceMime(path: string) {
  const ext = extname(path).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".mjs":
      return "application/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".ico":
      return "image/x-icon";
    case ".ts":
    case ".tsx":
      return "application/typescript; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

export function tryServeStatic<Rq extends Request>(
  req: Rq,
  folderpath: string,
  prefix: string,
): Response | null {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (!pathname.startsWith(prefix)) return null;

  const sanitizedPathname = pathname.slice(prefix.length);
  const fullPath = join(folderpath, sanitizedPathname);

  if (!existsSync(fullPath)) return null;

  const mime = deduceMime(fullPath);
  return new Response(Bun.file(fullPath), {
    headers: { "Content-Type": mime },
  });
}

export function serveStatic<P extends string, S>(
  folderpath: string,
  prefix: string,
): Bun.Serve.Handler<BunRequest<P>, S, Response> {
  return (req: BunRequest<P>, server: S): Response => {
    const response = tryServeStatic(req, folderpath, prefix);
    if (!response) return new Response("File not found", { status: 404 });
    return response;
  };
}

export async function render<Props>(
  page: ComponentType<Props>,
  props: Attributes & Props,
) {
  const vnode = h(page, props, []);
  const body = await renderToStringAsync(vnode);
  const result = new Response(body, {
    status: 200,
    headers: htmlHeaders,
  });
  return result;
}

export async function rewritePage(path: string): Promise<string> {
  const htmlContent = await Bun.file(path).text();
  const rewriter = new HTMLRewriter();
  rewriter.on("[data-component]", {
    element: async (el) => {
      const componentSrc = el.getAttribute("data-component")!;
      const isIsland = el.getAttribute("data-isisland") === "true";

      if (isIsland) {
        console.log("Preparing island at", componentSrc);

        const scriptContent = await generateIslandScript(componentSrc, path);
        el.after(`<script type="module">${scriptContent}</script>`, {
          html: true,
        });
      } else {
        console.log("Prerendering component at", componentSrc);

        const dataProps = el.getAttribute("data-props") ?? "{}";
        const props = JSON.parse(dataProps);
        console.log("before import ", importPath(path, componentSrc));
        const component = await import(importPath(path, componentSrc));
        console.log("after import");
        const componentHtml = await renderToStringAsync(
          h(component.default, props, []),
        );
        el.append(componentHtml, { html: true });
      }
    },
  });
  rewriter.on("head", {
    element: (el) => {
      el.append(
        `<script type="importmap">${JSON.stringify(imports)}</script>`,
        { html: true },
      );
      el.append('<script type="module" src="/assets/render.js"></script>', {
        html: true,
      });
    },
  });
  const result = rewriter.transform(htmlContent);
  return result;
}

export async function preparePage(htmlPage: Bun.HTMLBundle) {
  const result = await rewritePage(htmlPage.index);
  return new Response(result);
}
