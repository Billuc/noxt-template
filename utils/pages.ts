import { h } from "preact";
import { renderToStringAsync } from "preact-render-to-string";
import { importPath } from "./paths";
import { generateIslandScript, getScriptAsText } from "./islands";

export const importMap = {
  imports: {
    preact: "https://esm.sh/preact@10.23.1",
    "preact/": "https://esm.sh/preact@10.23.1/",
    "htm/preact": "https://esm.sh/htm@3.1.1/preact?external=preact",
  },
};

export async function rewritePage(path: string): Promise<string> {
  const htmlContent = await Bun.file(path).text();
  const rewriter = new HTMLRewriter();
  rewriter.on("[data-component]", {
    element: async (el) => {
      const componentSrc = el.getAttribute("data-component")!;
      const isIsland = el.getAttribute("data-isisland") === "true";

      if (isIsland) {
        console.log("Preparing island at", componentSrc);

        const scriptData = await generateIslandScript(componentSrc, path);

        el.setAttribute("data-component", scriptData.identifier);
        el.after(getScriptAsText(scriptData), {
          html: true,
        });
      } else {
        console.log("Prerendering component at", componentSrc);

        el.removeAttribute("data-component");
        const dataProps = el.getAttribute("data-props") ?? "{}";
        const props = JSON.parse(dataProps);
        const component = await import(importPath(path, componentSrc));
        const componentHtml = await renderToStringAsync(
          h(component.default, props, []),
        );
        el.append(componentHtml, { html: true });
      }
    },
  });
  rewriter.on("head", {
    element: (el) => {
      el.append(
        `<script type="importmap">${JSON.stringify(importMap)}</script>`,
        { html: true },
      );
      el.append('<script type="module" src="/assets/render.js"></script>', {
        html: true,
      });
    },
  });
  const result = rewriter.transform(htmlContent);
  return result;
}
