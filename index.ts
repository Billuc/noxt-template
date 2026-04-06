import AboutPage from "./src/components/aboutpage";
import homepage from "./src/pages/prerender.html";
import islandPage from "./src/pages/island.html";
import { servePage, serveStatic, render } from "./utils/server";

const prerenderedHomepage = await servePage(homepage);
const prerenderedIslandPage = await servePage(islandPage);

const server = Bun.serve({
  port: 3000,
  routes: {
    "/prerender": prerenderedHomepage,
    "/ssr": (req) => {
      return render(AboutPage, { req });
    },
    "/island": prerenderedIslandPage,
    "/assets/:path": serveStatic("./src/assets", "/assets/"),
  },
  development: Bun.env.DEV === "true",
});

console.log("Dev server running on http://localhost:3000");
export default server;
