import { html } from "htm/preact";
import Profile from "../components/Profile";

export default function Prerendered() {
  return html`
    <html>
      <head>
        <link rel="stylesheet" href="../assets/styles.css" />
      </head>
      <body>
        <h1>This is a prerendered page !</h1>
        <p>
          This page was generated during build at ${new Date().toISOString()}.
        </p>
        <${Profile} />
      </body>
    </html>
  `;
}
