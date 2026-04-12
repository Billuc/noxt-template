import { prepareManifest } from "./manifest";
import { rm } from "node:fs/promises";
import { CACHE_DIR, DIST } from "./paths";

await rm(CACHE_DIR, { recursive: true, force: true });
await rm(DIST, { recursive: true, force: true });
const manifest = await prepareManifest();
console.log("Generated manifest:", manifest);

await Bun.build({
  entrypoints: Object.values(manifest),
  outdir: DIST,
  target: "browser",
  splitting: true,
  minify: true,
});
