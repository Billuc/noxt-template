import { useState } from "preact/hooks";
import { h } from "preact";
import htm from "htm";

const html = htm.bind(h);

export default function Counter({ start = 0 }) {
  let [value, setValue] = useState(start);

  return html`
    <div>
      <button class="dec" onClick=${() => setValue(value - 1)}>-</button>
      <span class="value">${value}</span>
      <button class="inc" onClick=${() => setValue(value + 1)}>+</button>
    </div>
  `;
}
