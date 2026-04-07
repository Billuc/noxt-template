import { join, basename, dirname } from "node:path";
import { mkdir, readdir, rm } from "node:fs/promises";
import type { BunPlugin } from "bun";
import { writeFile } from "node:fs/promises";
import { copyFile } from "node:fs/promises";
import { preparePage, rewritePage } from "./server";

const DIST = join(process.cwd(), "dist");
const SOURCE_PUBLIC = join(process.cwd(), "public");
const DIST_PUBLIC = join(DIST, "public");

async function ensureDir(path: string) {
  await mkdir(path, { recursive: true });
}

export const pagePrerenderPlugin: BunPlugin = {
  name: "Page Prerender Plugin",
  setup: (build) => {
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
  await ensureDir(DIST);
}

export async function copyPublicFolder() {
  const publicFiles = await readdir(SOURCE_PUBLIC);
  for (const file of publicFiles) {
    await copyFile(join(SOURCE_PUBLIC, file), join(DIST_PUBLIC, file));
  }
}
