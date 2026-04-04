import { join, extname, basename, dirname, relative } from "node:path";
import { mkdir, readdir, rm } from "node:fs/promises";
import { renderToString } from "preact-render-to-string";
import { h } from "preact";
import type { BunPlugin } from "bun";
import { writeFile } from "node:fs/promises";
import { copyFile } from "node:fs/promises";

const DIST = join(process.cwd(), "dist");
const CACHE = join(process.cwd(), ".cache");
const SOURCE_PUBLIC = join(process.cwd(), "public");
const DIST_PUBLIC = join(DIST, "public");
const ISLANDS_OUTDIR = join(DIST, "public", "_islands");
const ENTRIES_OUTDIR = join(CACHE, "entries");
const ISLANDS_DIR = join(process.cwd(), "src", "islands");
const PAGES_DIR = join(process.cwd(), "src", "pages");

const JS_TS_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"];

async function ensureDir(path: string) {
  await mkdir(path, { recursive: true });
}

function getIslandData(file: string) {
  const extension = extname(file);
  if (!JS_TS_EXTENSIONS.includes(extension)) return null;
  return { name: file.slice(0, -extension.length), extension };
}

async function generateEntry(islandData: {
  name: string;
  extension: string;
}): Promise<string> {
  const entryFile = join(ENTRIES_OUTDIR, `${islandData.name}.client.js`);
  const islandFile = join(
    ISLANDS_DIR,
    `${islandData.name}${islandData.extension}`,
  );

  let rel = relative(ENTRIES_OUTDIR, islandFile).replace(/\\/g, "/");
  if (!rel.startsWith(".") && !rel.startsWith("/")) rel = "./" + rel;

  const content = `
        import { hydrate, h } from 'preact';
        import Island from '${rel}';
        export function hydrateAll(){
            for (const el of document.querySelectorAll('[data-island="${islandData.name}"]')){
                try{ 
                    const props = el.dataset;
                    hydrate(h(Island, props), el);
                } catch(e){
                    console.error('Failed to hydrate ${islandData.name}',e)
                }
            }
        }
        if (typeof window !== 'undefined') hydrateAll();
    `;
  await writeFile(entryFile, content, "utf8");
  return entryFile;
}

export async function buildIslands() {
  await ensureDir(ISLANDS_OUTDIR);
  await ensureDir(ENTRIES_OUTDIR);

  const islands = await discoverIslands();
  const entryPaths = [];

  for (let islandData of islands) {
    const entryFile = await generateEntry(islandData);
    entryPaths.push(entryFile);
  }

  const res = await Bun.build({
    entrypoints: entryPaths,
    outdir: ISLANDS_OUTDIR,
    format: "esm",
    minify: true,
  });
  console.log("Islands built");
}

async function discoverIslands() {
  try {
    const files = await readdir(ISLANDS_DIR);
    const islandInfos = files.map(getIslandData).filter((d) => d !== null);
    return islandInfos;
  } catch (e) {
    return [];
  }
}

async function writeOut(route: string, html: string) {
  const outDir = join(DIST, dirname(route));
  const filename = `${basename(route)}.html`;
  await ensureDir(outDir);
  await writeFile(join(outDir, filename), html, "utf8");
}

export async function prerenderPages() {
  await ensureDir(DIST);
  await ensureDir(CACHE);
  const files = await readdir(PAGES_DIR, { recursive: true });

  for (const file of files) {
    const extension = extname(file);
    if (!JS_TS_EXTENSIONS.includes(extension)) continue;
    const route = file.slice(0, -extension.length);
    const filePath = join(PAGES_DIR, file);

    const buildArtifacts = await Bun.build({
      entrypoints: [filePath],
      outdir: CACHE,
      plugins: [islandPrerenderPlugin],
      external: ["preact", "preact/hooks", "htm"],
    });
    if (!buildArtifacts.success) {
      console.error(`Error prerendering page ${file}`, buildArtifacts.logs);
      continue;
    }
    const mod = await import(buildArtifacts.outputs[0]!.path);

    if (!mod.default) {
      console.error(`Page ${file} does not have a default export !`);
      continue;
    }

    const html = renderToString(h(mod.default, {}));
    await writeOut(route, html);
    console.log(`Page ${file} correctly prerendered !`);
  }
}

const islandPrerenderPlugin: BunPlugin = {
  name: "Island Prerender Plugin",
  target: "bun",
  setup: (build) => {
    build.onLoad(
      { filter: /.*[\/\\]src[\/\\]islands[\/\\].*\.[jt]sx?/ },
      (args) => {
        const filename = basename(args.path);
        const islandData = getIslandData(filename);
        return {
          loader: "js",
          contents: `
                import { h } from "preact";
                import htm from "htm";
                const html = htm.bind(h);
                export default function (args) {
                    const props = {};
                    for (let key in args) {
                        props["data-" + key] = args[key];
                    }
                    return html\`
                        <div data-island="${islandData!.name}" ...\$\{args\}></div>
                        <script type="module" src="/_static/islands/${islandData!.name}.client.js"></script>
                    \`;
                }
            `,
        };
      },
    );
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
