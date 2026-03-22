// Build script using Bun.build with custom plugin
import { myPlugin } from "./plugin";

const result = await Bun.build({
  entrypoints: ["./index.ts"],
  outdir: "./dist",
  plugins: [myPlugin],
});

if (!result.success) {
  console.error("Build failed:", result.logs);
  process.exit(1);
}

console.log("Build succeeded!", result.outputs);

const output = require(result.outputs[0]!.path);
