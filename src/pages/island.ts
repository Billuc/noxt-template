import Counter from "../components/Counter";
import { html } from "htm/preact";
import { asIsland } from "@lib/server";

const CounterIsland = await asIsland(Counter);

export default function Island() {
  return html`
    <html>
      <head>
        <title>Dashboard</title>
        <link rel="stylesheet" href="../assets/styles.css" />
      </head>
      <body>
        <div>
          <h1>Welcome to Bun + Preact islands MVP</h1>
          <p>
            This page is server-rendered. The counter below is an interactive
            island.
          </p>
          <${CounterIsland} start=${3} />
        </div>
      </body>
    </html>
  `;
}
