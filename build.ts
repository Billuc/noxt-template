import {
  cleanDistFolder,
  copyPublicFolder,
  pagePrerenderPlugin,
  prerenderPages,
} from "./utils/build";
import { DIST } from "./utils/paths";

async function build() {
  await cleanDistFolder();
  await copyPublicFolder();
  await prerenderPages();

  await Bun.build({
    entrypoints: ["./index.ts"],
    plugins: [pagePrerenderPlugin],
    outdir: DIST,
    target: "bun",
    external: ["preact", "preact/*", "htm/preact"],
  });
  console.log("Build complete.");
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
