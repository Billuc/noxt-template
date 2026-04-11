import { type BunRequest } from "bun";
import { html } from "htm/preact";
import Counter from "./Counter";
import { asIsland } from "@lib/server";

const CounterIsland = await asIsland(Counter);

interface Props {
  req: BunRequest;
}

export default function SSR({ req }: Props) {
  return html`
    <div>
      <h1>Server-Side Rendered</h1>
      <p>This page is rendered on-demand on the server.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
      <p>Request from: ${req.headers.get("User-Agent")}</p>
      <${CounterIsland} />
    </div>
  `;
}
