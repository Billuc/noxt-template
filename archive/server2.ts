import type { BunRequest } from "bun";
import type { ComponentType } from "preact";
import { h } from "preact";
import { renderToString } from "preact-render-to-string";
import { join } from "node:path";

type PrerenderComponent = ComponentType<{}>;
type SSRComponent = ComponentType<{ req: BunRequest }>;

export function prerender(component: PrerenderComponent) {
  const vnode = h(component, {});
  const htmlContent = renderToString(vnode);

  const page = new Response(htmlContent, {
    headers: { "Content-Type": "text/html" },
  });
  return page;
}

export function ssr(component: SSRComponent) {
  return (req: BunRequest) => {
    const vnode = h(component, { req });
    const htmlContent = renderToString(vnode);

    const result = new Response(htmlContent, {
      headers: { "Content-Type": "text/html" },
    });
    return result;
  };
}

export function staticFile(filepath: string, publicDir: string): Response {
  const fullFilepath = join(publicDir, filepath);
  return new Response(Bun.file(fullFilepath));
}
