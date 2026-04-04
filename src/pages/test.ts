import Counter from "../islands/Counter";
import { h } from "preact";
import htm from "htm";

const html = htm.bind(h);

export default function Page() {
  return html`
    <div>
      <h1>Welcome to Bun + Preact islands MVP</h1>
      <p>
        This page is server-rendered. The counter below is an interactive
        island.
      </p>
      <div data-island="Counter" data-props=${JSON.stringify({ start: 3 })}>
        <${Counter} start="3" />
      </div>
    </div>
  `;
}
