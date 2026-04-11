import { prepareImportMap, serverRender } from "@lib/server";
import SSR from "./src/components/SSR";
import { MODE, PORT } from "@lib/env";

const importMap = await prepareImportMap();

Bun.serve({
  port: PORT,
  routes: {
    ...importMap,
    "/ssr": (req) => serverRender(SSR, { req }),
  },
  development: MODE === "development",
});

console.log("Server running on http://localhost:" + PORT);
