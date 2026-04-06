import Profile from "../components/Profile";
import { type BunRequest } from "bun";
import htm from "htm";
import { h } from "preact";

const html = htm.bind(h);

interface Props {
  req: BunRequest;
}

export default function AboutPage({ req }: Props) {
  return html`
    <div>
      <h1>About Page (Server-Side Rendered)</h1>
      <p>This page is rendered on-demand on the server.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
      <p>Request from: ${req.headers.get("User-Agent")}</p>
      <${Profile} />
    </div>
  `;
}
