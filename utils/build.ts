import { join, dirname } from "node:path";
import { mkdir, readdir, rm } from "node:fs/promises";
import type { BunPlugin } from "bun";
import { writeFile } from "node:fs/promises";
import { copyFile } from "node:fs/promises";
import { rewritePage } from "./pages";
import { CACHE, CACHE_PUBLIC, DIST, ROOT, SOURCE_PUBLIC } from "./paths";

async function ensureDir(path: string) {
  await mkdir(path, { recursive: true });
}

export const pagePrerenderPlugin: BunPlugin = {
  name: "Page Prerender Plugin",
  setup: (build) => {
    build.onResolve({ filter: /.*\.html/ }, async (args) => {
      const newPath = join(CACHE, args.path);
      return {
        path: newPath,
      };
    });
  },
};

export async function cleanDistFolder() {
  await rm(DIST, { force: true, recursive: true });
}

export async function copyPublicFolder() {
  await ensureDir(CACHE_PUBLIC);
  const publicFiles = await readdir(SOURCE_PUBLIC);
  for (const file of publicFiles) {
    await copyFile(join(SOURCE_PUBLIC, file), join(CACHE_PUBLIC, file));
  }
}

export async function prerenderPages() {
  await ensureDir(CACHE);

  const indexFile = Bun.file(join(ROOT, "index.ts"));
  const transpiler = new Bun.Transpiler({
    treeShaking: true,
    trimUnusedImports: true,
    allowBunRuntime: true,
  });
  const imports = transpiler.scanImports(await indexFile.arrayBuffer());

  for (const i of imports) {
    const ifullPath = join(ROOT, i.path);
    if (!ifullPath.startsWith(ROOT)) continue;
    if (!ifullPath.endsWith(".html")) continue;

    const file = Bun.file(ifullPath);
    if (!(await file.exists())) continue;

    console.log("Prerendering page ", i.path);

    const prerenderedHtml = await rewritePage(ifullPath);
    const outpath = join(CACHE, i.path);
    await ensureDir(dirname(outpath));
    await writeFile(outpath, prerenderedHtml);
  }
}
