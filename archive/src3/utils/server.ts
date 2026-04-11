import type { BunRequest } from "bun";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
import type { Attributes, ComponentType } from "preact";
import { h } from "preact";
import { renderToStringAsync } from "preact-render-to-string";
import { rewritePage } from "./pages";
import { generateIslandScript, getScriptVNode } from "./islands";
import { html } from "htm/preact";

const htmlHeaders = new Headers();
htmlHeaders.append("Content-Type", "text/html; charset=utf-8");

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

export async function preparePage(htmlPage: Bun.HTMLBundle) {
  const result = await rewritePage(htmlPage.index);
  return new Response(result, { headers: htmlHeaders });
}

export async function asIsland(componentPath: string, importedFrom: string) {
  const scriptData = await generateIslandScript(componentPath, importedFrom);
  const scriptVNode = getScriptVNode(scriptData);

  return (props: any) => {
    return [
      html`
        <div
          data-component="${scriptData.identifier}"
          data-props=${JSON.stringify(props)}
        ></div>
      `,
      scriptVNode,
    ];
  };
}
