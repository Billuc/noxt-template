import { h } from "preact";
import htm from "htm";

const html = htm.bind(h);

export const prerender = false;

export default function AboutPage() {
  return html`
    <div>
      <h1>About Page (Server-Side Rendered)</h1>
      <p>This page is rendered on-demand on the server.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
    </div>
  `;
}
