import { importPath } from "./path";
import { html } from "htm/preact";

export async function generateIslandScript(
  componentSrc: string,
  htmlPath: string,
) {
  const content = `
    import Island from '${importPath(htmlPath, componentSrc)}';
    window.hydrate("${componentSrc}", Island);
    `;

  if (BUILDING) return content;

  const island = await Bun.build({
    entrypoints: ["index.ts"],
    files: { "index.ts": content },
    target: "browser",
    external: ["preact", "preact/*", "htm/preact"],
  });
  const script = island.outputs[0]?.text();
  return script;
}

export async function asIsland(componentPath: string, importedFrom: string) {
  const scriptContent = await generateIslandScript(componentPath, importedFrom);
  return (props: any) => {
    return html`
      <div
        data-component="${componentPath}"
        data-props=${JSON.stringify(props)}
      ></div>
      <script
        type="module"
        dangerouslySetInnerHTML=${{ __html: scriptContent }}
      />
    `;
  };
}
