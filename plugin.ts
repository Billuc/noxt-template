// Custom plugin to modify imports
import { type BunPlugin } from "bun";
import { h } from "preact";
import { renderToStringAsync } from "preact-render-to-string";
import fs from "fs";
import path from "path";

const DIST_PUBLIC_DIR = "./dist/public";

export const myPlugin: BunPlugin = {
  name: "Custom Import Modifier",
  setup(build) {
    build.onLoad({ filter: /message/ }, async (args) => {
      let exports = { ...require(args.path) };
      exports["message"] = "Modified by plugin!";
      return {
        exports,
        loader: "object",
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
