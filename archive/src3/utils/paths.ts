import { dirname, join } from "node:path";

export const ROOT = join(__dirname, "..");
export const DIST = join(ROOT, "dist");
export const SOURCE_PUBLIC = join(ROOT, "src", "assets");
export const DIST_PUBLIC = join(DIST, "assets");
export const CACHE = join(ROOT, ".cache");
export const CACHE_PUBLIC = join(CACHE, "src", "assets");

export function importPath(base: string, ...segments: string[]) {
  const fullPath = join(dirname(base), ...segments);
  return fullPath.replaceAll("\\", "\\\\");
}
