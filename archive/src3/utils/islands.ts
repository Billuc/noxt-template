import { dirname, join, relative } from "node:path";
import { CACHE, CACHE_PUBLIC, importPath, ROOT } from "./paths";
import { h, type VNode } from "preact";

const hasher = new Bun.CryptoHasher("sha256");

export type ScriptData = InlineScript | SrcScript;

export interface InlineScript {
  type: "inline";
  content: string;
  identifier: string;
}

export interface SrcScript {
  type: "src";
  src: string;
  identifier: string;
}

export async function generateIslandScript(
  componentSrc: string,
  htmlPath: string,
): Promise<ScriptData> {
  if (Bun.env.DEV !== "true")
    return await prepareIslandAsset(componentSrc, htmlPath);

  const fullPath = importPath(htmlPath, componentSrc);
  let identifier = componentSrc;

  const content = `
    import Island from '${fullPath}';
    window.hydrate("${identifier}", Island);
    `;

  const island = await Bun.build({
    entrypoints: ["index.ts"],
    files: { "index.ts": content },
    target: "browser",
    external: ["preact", "preact/*", "htm/preact"],
  });
  const script = await island.outputs[0]!.text();
  return {
    type: "inline",
    content: script,
    identifier,
  };
}

async function prepareIslandAsset(
  componentSrc: string,
  htmlPath: string,
): Promise<ScriptData> {
  const fullPath = importPath(htmlPath, componentSrc);

  const hash = hasher.update(fullPath).digest("base64url");
  const identifier = hash + ".js";
  const outpath = join(CACHE_PUBLIC, identifier);
  const file = Bun.file(outpath);

  if (!(await file.exists())) {
    const content = `
    import Island from '${fullPath}';
    window.hydrate("${identifier}", Island);
    `;

    await Bun.build({
      entrypoints: ["index.ts"],
      files: { "index.ts": content },
      target: "browser",
      external: ["preact", "preact/*", "htm/preact"],
      outdir: CACHE_PUBLIC,
      naming: identifier,
    });
  }

  return {
    type: "src",
    src: relativeSrc(htmlPath, identifier),
    identifier,
  };
}

function relativeSrc(pagePath: string, fileName: string) {
  return join(
    relative(dirname(pagePath), ROOT),
    relative(CACHE, CACHE_PUBLIC),
    fileName,
  );
}

export function getScriptVNode(data: ScriptData): VNode<any> {
  if (data.type === "inline") {
    return h("script", { type: "module" }, data.content);
  } else {
    return h("script", { type: "module", src: data.src });
  }
}

export function getScriptAsText(data: ScriptData): string {
  if (data.type === "inline") {
    return `<script type="module">${data.content}</script>`;
  } else {
    return `<script type="module" src="${data.src}"></script>`;
  }
}
