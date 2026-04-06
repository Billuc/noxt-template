import { dirname, join } from "node:path";

export function importPath(base: string, ...segments: string[]) {
  const fullPath = join(dirname(base), ...segments);
  return fullPath.replaceAll("\\", "\\\\");
}
