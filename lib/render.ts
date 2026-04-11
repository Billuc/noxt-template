import { html, render } from "htm/preact";
import type { ComponentType } from "preact";

export function renderComponent(Component: ComponentType<any>, hash: string) {
  const elements = document.querySelectorAll<HTMLElement>(
    `[data-island="${hash}"]`,
  );

  for (const element of elements) {
    const props = JSON.parse(element.getAttribute("data-props") || "{}");
    render(html`<${Component} ...${props} />`, element);
  }
}
