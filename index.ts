import { prepareRoutes } from "noxt" with { type: "macro" };

const PORT = process.env.PORT ?? "2101";
// @ts-ignore - prepareRoutes is a Bun macro, its return type is resolved at build time
const routes = (await import(prepareRoutes())).default;

Bun.serve({
  port: PORT,
  routes,
  development: process.env.MODE === "development",
});

console.log("Server running on http://localhost:" + PORT);
