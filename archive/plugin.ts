// Custom plugin to modify imports
import {
  Transpiler,
  type BunPlugin,
  type JavaScriptLoader,
  type Loader,
} from "bun";
import { h } from "preact";
import { renderToStringAsync } from "preact-render-to-string";
import fs from "fs";
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { mkdir, exists } from "node:fs/promises";

const DIST_PUBLIC_DIR = "./dist/public";
const SERVER_SCRIPT_REGEX = /^.*[\/\\]src[\/\\]server[\/\\].*\.(js|jsx|ts|tsx)/;
const CLIENT_SCRIPT_REGEX = /^.*[\/\\]src[\/\\]client[\/\\].*\.(js|jsx|ts|tsx)/;

async function preactRenderFromPath(path: string) {
  const exports = await import(path);
  const vnode = h(exports.default, {});
  const htmlContent = await renderToStringAsync(vnode);
  return htmlContent;
}

async function rewriteHTML(htmlPath: string) {
  const rewriter = new HTMLRewriter().on("script", {
    element: async (element) => {
      const src = element.getAttribute("src");
      if (!src) return;
      const scriptPath = path.join(path.dirname(htmlPath), src);
      if (
        scriptPath.match(SERVER_SCRIPT_REGEX) ||
        scriptPath.match(CLIENT_SCRIPT_REGEX)
      ) {
        const html = await preactRenderFromPath(scriptPath);
        const id = getTmpComponentPath(scriptPath);
        element.replace(html, { html: true });
        element.setAttribute("id", id);
      }
      if (scriptPath.match(CLIENT_SCRIPT_REGEX)) {
        element.append(
          `
          <script src="${getTmpMountPath(scriptPath)}"></script>
          `,
          { html: true },
        );
      }
    },
  });

  const page = await Bun.file(htmlPath).text();
  return rewriter.transform(page);
}

function getTmpComponentPath(componentPath: string) {
  const fileName = `${Bun.hash(componentPath).toString()}-${path.basename(componentPath)}`;
  return fileName;
}

function getTmpMountPath(componentPath: string) {
  const originalName = path.basename(componentPath);
  const lastDotIndex = originalName.lastIndexOf(".");
  const mountName =
    originalName.slice(0, lastDotIndex) +
    ".mount" +
    originalName.slice(lastDotIndex);
  const fileName = `${Bun.hash(componentPath).toString()}-${mountName}`;

  return fileName;
}

async function writeHydrateCode(
  componentPath: string,
  loader: JavaScriptLoader,
): Promise<string> {
  const originalCode = await Bun.file(componentPath).text();

  if (!exists("./tmp")) {
    await mkdir("./tmp");
  }

  const fileName = getTmpComponentPath(componentPath);
  await writeFile(`./tmp/${fileName}`, originalCode);

  const mountCode = `
  import { h, hydrate } from "preact";
    
  const Component = (await import("./${fileName}")).default;
  const element = document.getElementById("${fileName}");
  hydrate(h(Component, {}), element);
  `;
  const mountFileName = getTmpMountPath(componentPath);
  await writeFile(`./tmp/${mountFileName}`, mountCode);

  return mountFileName;
}

export const serverPlugin: BunPlugin = {
  name: "Server Component Builder",
  setup(build) {
    build.onLoad({ filter: /.*\.html/ }, async (args) => {
      const rewrittenPage = await rewriteHTML(args.path);
      return {
        contents: rewrittenPage,
        loader: "html",
      };
    });

    build.onLoad({ filter: CLIENT_SCRIPT_REGEX }, async (args) => {
      await writeHydrateCode(args.path, args.loader as JavaScriptLoader);
      const code = await Bun.file(args.path).text();

      return {
        contents: code,
        loader: args.loader,
      };
    });
  },
};

export const pagesPlugin: BunPlugin = {
  name: "Pages Prerenderer",
  setup(build) {
    build.onLoad({ filter: /src[\/\\]pages/ }, async (args) => {
      const exports = await import(args.path);
      const pageName = path.basename(args.path, path.extname(args.path));

      if (exports.prerender) {
        // For prerendered pages, render to HTML and write to file
        // Create a Preact element from the component
        const vnode = h(exports.default, {});
        const htmlContent = await renderToStringAsync(vnode);
        console.log(`[Pages Plugin] Rendered HTML for ${pageName}:`);

        const htmlFilename = `${pageName}.html`;
        const htmlPath = path.join(DIST_PUBLIC_DIR, htmlFilename);

        // Create directory if it doesn't exist
        const dir = path.dirname(htmlPath);
        fs.mkdirSync(dir, { recursive: true });

        // Write HTML file
        fs.writeFileSync(htmlPath, htmlContent);
        console.log(`✓ Prerendered: ${pageName} → ${htmlPath}`);

        // Return a handler that serves the file using Bun.file
        const handlerCode = `
          const page = new Response(
            await Bun.file(${JSON.stringify(htmlPath)}).bytes(), 
            { headers: { "Content-Type": "text/html" } }
          );
          export default page;
        `;
        return {
          contents: handlerCode,
          loader: "js",
        };
      } else {
        // For SSR pages, wrap in makeHandler
        console.log(`✓ SSR handler: ${pageName}`);

        const handlerCode = `
          import { h } from "preact";
          import { renderToReadableStream } from "preact-render-to-string/stream";
          import Node from ${JSON.stringify(args.path)};
          
          export default function ${pageName}_page(req) {
            const node = h(Node, { req });

            const stream = renderToReadableStream(node);

            return new Response(stream, {
              headers: { "Content-Type": "text/html" },
            });
          }
        `;
        return {
          contents: handlerCode,
          loader: "js",
        };
      }
    });
  },
};
