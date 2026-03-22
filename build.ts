import { pagesPlugin } from "./plugin";

const result = await Bun.build({
  entrypoints: ["./index.ts"],
  outdir: "./dist",
  plugins: [pagesPlugin],
});

if (!result.success) {
  console.error("Build failed:", result.logs);
  process.exit(1);
}
