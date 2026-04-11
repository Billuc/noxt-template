import path from "node:path";
import * as env from "./env";

export const ROOT = path.resolve(__dirname, "..");
export const INDEX = path.join(ROOT, "index.ts");
export const PAGES_DIR = path.join(ROOT, env.PAGES_DIR);
export const ASSETS_DIR = path.join(ROOT, env.ASSETS_DIR);
export const CACHE_DIR = path.join(ROOT, ".cache");
export const CACHE_PAGES_DIR = path.join(CACHE_DIR, env.PAGES_DIR);
export const CACHE_ASSETS_DIR = path.join(CACHE_DIR, env.ASSETS_DIR);
export const DIST = path.join(ROOT, "dist");

export function relativeFromRoot(fullPath: string): string {
  return path.relative(ROOT, fullPath);
}
