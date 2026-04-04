// Minimal Bun dev server using a routes mapping and auto-building island clients for dev
import { render } from "./src/server/render.js";
import { join, extname, relative } from "path";
import { existsSync } from "fs";
import { buildIslands } from "./utils/build.js";
import { deduceMime } from "./utils/server.js";

// Define a small `routes` mapping used by the internal fetch handler
const routes = [
  {
    method: "GET",
    pattern: /^\/$/,
    handler: async (req, url) => await render(url),
  },
  {
    method: "GET",
    pattern: /^\/.*$/,
    handler: async (req, url) => await render(url),
  },
];

await buildIslands();

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Try static files from working dir, public or dist first
    const tryPaths = [
      join(process.cwd(), pathname.replace(/^\//, "")),
      join(process.cwd(), "public", pathname.replace(/^[\\/]/, "")),
      join(process.cwd(), "dist", pathname.replace(/^[\\/]/, "")),
    ];

    for (const p of tryPaths) {
      if (existsSync(p)) {
        const mime = deduceMime(p);
        return new Response(Bun.file(p), { headers: { "Content-Type": mime } });
      }
    }

    // Route dispatch
    for (const r of routes) {
      if (req.method === r.method && r.pattern.test(pathname)) {
        try {
          const result = await r.handler(req, url);
          if (result && typeof result === "object" && result.html) {
            return new Response(result.html, {
              status: result.status || 200,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            });
          }
          if (typeof result === "string")
            return new Response(result, {
              headers: { "Content-Type": "text/html; charset=utf-8" },
            });
          return new Response("Not Found", { status: 404 });
        } catch (err) {
          console.error(err);
          return new Response("Internal Server Error", { status: 500 });
        }
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("Dev server running on http://localhost:3000");
export default server;
