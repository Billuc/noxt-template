import type { BunRequest } from "bun";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
import type { Attributes, ComponentType } from "preact";
import { h } from "preact";
import { renderToStringAsync } from "preact-render-to-string";

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
): Response | null {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const sanitizedPathname = pathname.startsWith("/")
    ? pathname.slice(1)
    : pathname;
  const fullPath = join(folderpath, sanitizedPathname);
  console.log(fullPath);

  if (!existsSync(fullPath)) return null;

  const mime = deduceMime(fullPath);
  return new Response(Bun.file(fullPath), {
    headers: { "Content-Type": mime },
  });
}

export function serveStatic<P extends string, S>(
  folderpath: string,
): Bun.Serve.Handler<BunRequest<P>, S, Response> {
  return (req: BunRequest<P>, server: S): Response => {
    const response = tryServeStatic(req, folderpath);
    if (!response) return new Response("File not found", { status: 404 });
    return response;
  };
}

export async function render<Props extends Attributes>(
  page: ComponentType<Props>,
  props: Props,
) {
  const vnode = h(page, props, []);
  const body = await renderToStringAsync(vnode);
  const result = new Response(body, {
    status: 200,
    headers: htmlHeaders,
  });
  return result;
}
