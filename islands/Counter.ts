import { defineIsland } from "noxt";
import { html } from "htm/preact";
import { useState } from "preact/hooks";

function Counter({ start = 0 }) {
  let [value, setValue] = useState(start);

  return html`
    <div>
      <button class="dec" onClick=${() => setValue(value - 1)}>-</button>
      <span class="value">${value}</span>
      <button class="inc" onClick=${() => setValue(value + 1)}>+</button>
    </div>
  `;
}

export default defineIsland(Counter, import.meta.path);
