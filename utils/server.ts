import { existsSync } from "node:fs";
import { extname, join } from "node:path";

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

  if (!existsSync(fullPath)) return null;

  const mime = deduceMime(fullPath);
  return new Response(Bun.file(fullPath), {
    headers: { "Content-Type": mime },
  });
}

export function serveStatic<Rq extends Request, S>(
  folderpath: string,
): Bun.Serve.Handler<Rq, S, Response> {
  return (req: Rq, server: S): Response => {
    const response = tryServeStatic(req, folderpath);
    if (!response) return new Response("File not found", { status: 404 });
    return response;
  };
}
