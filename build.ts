import { join } from "node:path";
import {
  cleanDistFolder,
  copyPublicFolder,
  pagePrerenderPlugin,
  prerenderPages,
} from "./utils/build";
import { DIST } from "./utils/paths";

async function build() {
  await cleanDistFolder();
  await prerenderPages();
  await copyPublicFolder();

  await Bun.build({
    entrypoints: ["./index.ts"],
    plugins: [pagePrerenderPlugin],
    outdir: DIST,
    target: "bun",
  });
  console.log("Build complete.");
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
