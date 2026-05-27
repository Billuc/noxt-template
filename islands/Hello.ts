import { useState } from "preact/hooks";
import { html } from "htm/preact";
import { defineIsland } from "noxt";

function Hello() {
  const [name, setName] = useState("World");

  return html`
    <div class="hello-demo">
      <span>This is an interactive island !</span>
      <h2>Hello, ${name}!</h2>
      <input
        type="text"
        value=${name}
        onInput=${(e: Event) => setName((e.target as HTMLInputElement).value)}
      />
    </div>
  `;
}

export default defineIsland(Hello, import.meta.path);
