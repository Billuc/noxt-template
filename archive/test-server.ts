import page from "./src/index.html";

Bun.serve({
  port: 3456,
  routes: {
    "/": page,
  },
});
