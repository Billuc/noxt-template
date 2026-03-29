import { prerender, ssr, staticFile } from "./server.ts";
import AboutPage from "./src/pages/about.jsx";
import HomePage from "./src/pages/index.js";

const PORT = 3000;
const isDev = Bun.env.MODE !== "production";

const server = Bun.serve({
  port: PORT,
  routes: {
    "/": prerender(HomePage),
    "/about": ssr(AboutPage),
    "/public/:file": (req) => staticFile(req.params.file, "./public"),
  },
  development: isDev,
});

console.log(`Server is running at http://localhost:${PORT}`);
