import { html } from "htm/preact";

interface DemoSectionProps {
  icon: string;
  title: string;
  description: string;
  children: any;
  code?: string;
}

export default function DemoSection({
  icon,
  title,
  description,
  children,
  code,
}: DemoSectionProps) {
  return html`
    <div class="island-demo">
      <div class="demo-title">
        <span>${icon}</span>
        <h3>${title}</h3>
      </div>
      <p>${description}</p>
      <div class="demo-content">${children}</div>
      ${code
        ? html`<details class="code-details">
            <summary class="code-summary">View Code</summary>
            <pre class="code-block">
              <code class="language-ts">${code}</code>
            </pre>
          </details>`
        : ""}
    </div>
  `;
}
