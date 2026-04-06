import AboutPage from "./src/components/aboutpage";
import homepage from "./src/pages/prerender.html";
import islandPage from "./src/pages/island.html";
import hybridPage from "./src/pages/hybrid.html";
import { preparePage, serveStatic, render } from "./utils/server";

const server = Bun.serve({
  port: 3000,
  routes: {
    "/prerender": await preparePage(homepage),
    "/ssr": (req) => {
      return render(AboutPage, { req });
    },
    "/island": await preparePage(islandPage),
    "/hybrid": await preparePage(hybridPage),
    "/assets/:path": serveStatic("./src/assets", "/assets/"),
  },
  development: Bun.env.DEV === "true",
});

console.log("Dev server running on http://localhost:3000");
export default server;
