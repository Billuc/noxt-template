import { join, basename, dirname } from "node:path";
import { mkdir, readdir, rm } from "node:fs/promises";
import type { BunPlugin } from "bun";
import { writeFile } from "node:fs/promises";
import { copyFile } from "node:fs/promises";
import { rewritePage } from "./pages";
import { CACHE, DIST, DIST_PUBLIC, ROOT, SOURCE_PUBLIC } from "./paths";

async function ensureDir(path: string) {
  await mkdir(path, { recursive: true });
}

export const pagePrerenderPlugin: BunPlugin = {
  name: "Page Prerender Plugin",
  setup: (build) => {
    ensureDir(CACHE);

    build.onResolve({ filter: /.*\.html/ }, async (args) => {
      const fullPath = join(dirname(args.importer), args.path);
      try {
        console.log("Preparing page at ", fullPath);
        const htmlContent = await rewritePage(fullPath);
        console.log("Got new content for ", fullPath);
        const newPath = join(DIST, basename(args.path));
        await writeFile(newPath, htmlContent);
        console.log("New file written for ", fullPath);
        return {
          path: newPath,
        };
      } catch (err) {
        console.error(err);
        return { path: fullPath };
      }
    });
  },
};

export async function cleanDistFolder() {
  await rm(DIST, { force: true, recursive: true });
}

export async function copyPublicFolder() {
  const publicFiles = await readdir(SOURCE_PUBLIC);
  for (const file of publicFiles) {
    await copyFile(join(SOURCE_PUBLIC, file), join(DIST_PUBLIC, file));
  }
}

export async function prerenderPages() {
  await ensureDir(DIST);

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
    await writeFile(join(DIST, basename(ifullPath)), prerenderedHtml);
  }
}
