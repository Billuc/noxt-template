import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import renderToString from "preact-render-to-string";
import { h } from "preact";

const PAGES = path.join(process.cwd(), "src", "pages");

function findIslands(html) {
  const set = new Set();
  const re = /data-island="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) set.add(m[1]);
  return Array.from(set);
}

export async function render(url) {
  // map URL -> page module
  let pathname =
    url.pathname === "/" ? "/index" : url.pathname.replace(/\/$/, "");
  const file = path.join(PAGES, pathname + ".tsx");
  if (!fs.existsSync(file)) {
    return {
      status: 404,
      html: "<!doctype html><html><body><h1>Not Found</h1></body></html>",
    };
  }
  const mod = await import(pathToFileURL(file).href);
  let bodyHtml = "";

  if (mod.default) {
    bodyHtml = renderToString(h(mod.default, { url }));
  } else if (mod.render) {
    const rendered = await mod.render({ url });
    if (
      typeof rendered === "string" &&
      rendered.trim().toLowerCase().startsWith("<!doctype")
    ) {
      return { status: 200, html: rendered };
    }
    bodyHtml = rendered;
  } else {
    return {
      status: 500,
      html: "<!doctype html><html><body><h1>Module has no default export or render()</h1></body></html>",
    };
  }

  const islands = findIslands(bodyHtml);
  const scripts = islands
    .map(
      (name) =>
        `<script type="module" src="/_static/islands/${name}.client.js"></script>`,
    )
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/public/styles.css"></head><body>${bodyHtml}${scripts}</body></html>`;
  return { status: 200, html };
}
