import { h } from "preact";
import htm from "htm";

const html = htm.bind(h);

export default function HomePage() {
  return html`
    <div>
      <h1>Home Page (Prerendered)</h1>
      <p>This page is prerendered at build time.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
      <p>LA</p>
    </div>
  `;
}
