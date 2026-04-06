import { join, basename } from "node:path";
import { mkdir, readdir, rm } from "node:fs/promises";
import type { BunPlugin } from "bun";
import { writeFile } from "node:fs/promises";
import { copyFile } from "node:fs/promises";
import { preparePage } from "./server";

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
      const htmlBundle: Bun.HTMLBundle = {
        index: args.path,
      };
      const htmlResponse = await preparePage(htmlBundle);
      const newHtml = await htmlResponse.text();
      console.log(newHtml);
      const newPath = join(DIST, basename(args.path));
      await writeFile(newPath, newHtml);
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
  const publicFiles = await readdir(SOURCE_PUBLIC);
  for (const file of publicFiles) {
    await copyFile(join(SOURCE_PUBLIC, file), join(DIST_PUBLIC, file));
  }
}
