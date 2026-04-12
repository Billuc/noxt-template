import { prepareManifest } from "./manifest";
import { rm } from "node:fs/promises";
import { CACHE_DIR, DIST, INDEX } from "./paths";

const importMapPlugin: Bun.BunPlugin = {
  name: "import-map-plugin",
  setup: (build) => {
    build.onLoad({ filter: /lib[\/\\]import_map\.ts$/ }, async (args) => {
      const manifest = await prepareManifest();
      console.log("Generated manifest:", manifest);

      const imports = [];
      const mapCode = [];

      for (const route in manifest) {
        const sanitizedRouteName = route.replace(/\W/g, "_");
        imports.push(
          `import ${sanitizedRouteName} from ${JSON.stringify(manifest[route])};`,
        );
        mapCode.push(`"${route}": ${sanitizedRouteName}`);
      }

      const serverFile = `
        ${imports.join("\n")}

        export async function prepareImportMap() {
          return {${mapCode.join(",\n")}};
        }
      `;

      return {
        contents: serverFile,
        loader: "js",
      };
    });
  },
};

await rm(CACHE_DIR, { recursive: true, force: true });
await rm(DIST, { recursive: true, force: true });
await Bun.build({
  entrypoints: [INDEX],
  outdir: DIST,
  target: "bun",
  plugins: [importMapPlugin],
  splitting: true,
  minify: true,
});
