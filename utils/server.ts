import type { BunRequest } from "bun";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
import type { Attributes, ComponentType } from "preact";
import { h } from "preact";
import { renderToStringAsync } from "preact-render-to-string";
import { importPath } from "./path";
import { html } from "htm/preact";

const htmlHeaders = new Headers();
htmlHeaders.append("Content-Type", "text/html; charset=utf-8");

const imports = {
  imports: {
    preact: "https://esm.sh/preact@10.23.1",
    "preact/": "https://esm.sh/preact@10.23.1/",
    "htm/preact": "https://esm.sh/htm@3.1.1/preact?external=preact",
  },
};

export function deduceMime(path: string) {
  const ext = extname(path).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".mjs":
      return "application/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".ico":
      return "image/x-icon";
    case ".ts":
    case ".tsx":
      return "application/typescript; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

export function tryServeStatic<Rq extends Request>(
  req: Rq,
  folderpath: string,
  prefix: string,
): Response | null {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (!pathname.startsWith(prefix)) return null;

  const sanitizedPathname = pathname.slice(prefix.length);
  const fullPath = join(folderpath, sanitizedPathname);

  if (!existsSync(fullPath)) return null;

  const mime = deduceMime(fullPath);
  return new Response(Bun.file(fullPath), {
    headers: { "Content-Type": mime },
  });
}

export function serveStatic<P extends string, S>(
  folderpath: string,
  prefix: string,
): Bun.Serve.Handler<BunRequest<P>, S, Response> {
  return (req: BunRequest<P>, server: S): Response => {
    const response = tryServeStatic(req, folderpath, prefix);
    if (!response) return new Response("File not found", { status: 404 });
    return response;
  };
}

export async function render<Props>(
  page: ComponentType<Props>,
  props: Attributes & Props,
) {
  const vnode = h(page, props, []);
  const body = await renderToStringAsync(vnode);
  const result = new Response(body, {
    status: 200,
    headers: htmlHeaders,
  });
  return result;
}

export async function preparePage(htmlPage: Bun.HTMLBundle) {
  const htmlContent = await Bun.file(htmlPage.index).text();
  const rewriter = new HTMLRewriter();
  rewriter.on("[data-component]", {
    element: async (el) => {
      const componentSrc = el.getAttribute("data-component")!;
      const isIsland = el.getAttribute("data-isisland") === "true";

      if (isIsland) {
        const scriptContent = await generateIslandScript(
          componentSrc,
          htmlPage.index,
        );
        el.after(`<script type="module">${scriptContent}</script>`, {
          html: true,
        });
      } else {
        const dataProps = el.getAttribute("data-props") ?? "{}";
        const props = JSON.parse(dataProps);
        const component = await import(
          importPath(htmlPage.index, componentSrc)
        );
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
        `<script type="importmap">${JSON.stringify(imports)}</script>`,
        { html: true },
      );
      el.append('<script type="module" src="/assets/render.js"></script>', {
        html: true,
      });
    },
  });
  const result = rewriter.transform(htmlContent);
  return new Response(result);
}

async function generateIslandScript(componentSrc: string, htmlPath: string) {
  const content = `
    import Island from '${importPath(htmlPath, componentSrc)}';
    window.hydrate("${componentSrc}", Island);
    `;
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
