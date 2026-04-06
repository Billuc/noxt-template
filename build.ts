import { join } from "node:path";
import { cleanDistFolder, pagePrerenderPlugin } from "./utils/build";

async function build() {
  await cleanDistFolder();
  await Bun.build({
    entrypoints: ["./index.ts"],
    plugins: [pagePrerenderPlugin],
    outdir: join(__dirname, "dist"),
    target: "bun",
  });
  console.log("Build complete.");
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
