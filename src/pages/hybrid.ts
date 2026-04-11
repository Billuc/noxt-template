import Hello from "../components/Hello";
import { html } from "htm/preact";
import { asIsland } from "@lib/server";

const HelloIsland = await asIsland(Hello);

export default function Hybrid() {
  return html`
    <html>
      <head>
        <link rel="stylesheet" href="../assets/styles.css" />
      </head>
      <body>
        <h1>This is my test app !</h1>
        <p>This was prerendered !</p>
        <${HelloIsland} />
      </body>
    </html>
  `;
}
