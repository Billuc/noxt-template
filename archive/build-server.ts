import { serverPlugin } from "./plugin";
import { rmSync } from "node:fs";

rmSync("./dist", { recursive: true, force: true });

Bun.build({
  entrypoints: ["test-server.ts"],
  outdir: "./dist",
  target: "bun",
  plugins: [serverPlugin],
});
