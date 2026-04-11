import { prepareImportMap, serverRender } from "@lib/server";
import { MODE, PORT } from "@lib/env";

const importMap = await prepareImportMap();

Bun.serve({
  port: PORT,
  routes: {
    ...importMap,
  },
  development: MODE === "development",
});

console.log("Server running on http://localhost:" + PORT);
