import Counter from "../islands/Counter";
import { h } from "preact";
import htm from "htm";

const html = htm.bind(h);

export const prerender = true;

export default function TestPage() {
  return html`
    <div>
      <h1>Welcome to Bun + Preact islands MVP</h1>
      <p>
        This page is server-rendered. The counter below is an interactive
        island.
      </p>
      <${Counter} start="3" />
    </div>
  `;
}
