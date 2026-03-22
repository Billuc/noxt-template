import { createServer } from "./server.js";
import AboutPage from "./src/pages/about.jsx";
import HomePage from "./src/pages/index.js";

const PORT = 3000;
const isDev = Bun.env.MODE !== "production";
const { prerender, ssr, staticFile } = createServer({
  development: isDev,
  publicDir: "./public",
});

const server = Bun.serve({
  port: PORT,
  routes: {
    "/": prerender(HomePage),
    "/about": ssr(AboutPage),
    "/public/:file": (req) => staticFile(req.params.file),
  },
  development: isDev,
});

console.log(`Server is running at http://localhost:${PORT}`);
