import { render, html } from "htm/preact";

window.hydrate = (componentSrc, Component) => {
  const componentEls = document.querySelectorAll(
    `[data-component="${componentSrc}"]`,
  );

  for (const el of componentEls) {
    try {
      const props = JSON.parse(el.dataset.props ?? "{}");
      render(html`<${Component} ...${props} />`, el);
    } catch (e) {
      console.error(`Failed to hydrate ${componentSrc}\n`, e);
    }
  }
};
