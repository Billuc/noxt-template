import { prepareManifest } from "./manifest";

/**
 * Prepares an import map of prerendered pages from the manifest.
 *
 * Loads the manifest file, iterates through all routes, dynamically imports
 * the prerendered page component for each route, and returns a map with
 * route names as keys and their corresponding prerendered components as values.
 *
 * @returns A promise resolving to a record mapping route names to their prerendered HTML bundles
 */
export async function prepareImportMap(): Promise<
  Record<string, Bun.HTMLBundle>
> {
  const manifest = await prepareManifest();
  const importMap: Record<string, Bun.HTMLBundle> = {};

  for (const route in manifest) {
    const prerenderPath = manifest[route]!;
    importMap[route] = (await import(prerenderPath)).default;
  }

  return importMap;
}
