// Minimal Bun dev server using a routes mapping and auto-building island clients for dev
import { buildIslands } from "./utils/build.js";
import { render, serveStatic } from "./utils/server.js";
import HomePage from "./src2/pages/index.js";
import TestPage from "./src2/pages/test.js";

await buildIslands();

const server = Bun.serve({
  port: 3000,
  routes: {
    "/index": render(HomePage, {}),
    "/test": render(TestPage, {}),
    "/public/*": serveStatic("./public"),
  },
});

console.log("Dev server running on http://localhost:3000");
export default server;
