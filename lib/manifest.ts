import path, { join } from "path";
import { symlink } from "fs/promises";
import { h } from "preact";
import { renderToString } from "preact-render-to-string";
import {
  ASSETS_DIR,
  CACHE_ASSETS_DIR,
  CACHE_PAGES_DIR,
  PAGES_DIR,
} from "./paths";

async function prerenderPage(
  pathFromPages: string,
): Promise<{ routeName: string; prerenderPath: string } | null> {
  const filePath = path.join(PAGES_DIR, pathFromPages);
  const basename = pathFromPages.replace(/\.(tsx|ts|jsx|js)$/, "");
  console.log(`Prerendering page [${basename}]`);

  const prerenderPath = path.resolve(CACHE_PAGES_DIR, `${basename}.html`);

  const { default: Page } = await import(filePath);
  if (!Page) {
    console.log(
      `Skipping ${pathFromPages} because it does not have a default export.`,
    );
    return null;
  }

  const prerenderedContent = renderToString(h(Page, {}, []));
  await Bun.write(prerenderPath, prerenderedContent);

  const routeName =
    "/" + (basename.endsWith("index") ? basename.slice(0, -5) : basename);

  return { routeName, prerenderPath };
}

async function copyAssets() {
  const glob = new Bun.Glob("**/*");

  for await (const file of glob.scan(ASSETS_DIR)) {
    const srcPath = join(ASSETS_DIR, file);
    const destPath = join(CACHE_ASSETS_DIR, file);

    try {
      await symlink(srcPath, destPath);
    } catch (e: any) {
      if (e.code !== "EEXIST") {
        throw e;
      }
    }
  }
}

export async function prepareManifest(): Promise<Record<string, string>> {
  await copyAssets();
  const manifest: Record<string, string> = {};
  const glob = new Bun.Glob("**/*.{tsx,ts,jsx,js}");

  for await (const file of glob.scan(PAGES_DIR)) {
    const prerenderResult = await prerenderPage(file);
    if (!prerenderResult) continue;

    const { routeName, prerenderPath } = prerenderResult;
    manifest[routeName] = prerenderPath;
  }

  return manifest;
}
