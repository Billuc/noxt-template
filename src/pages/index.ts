import { html } from "htm/preact";
import { asIsland } from "@lib/server";
import Counter from "../components/Counter";
import Hello from "../components/Hello";
import FeatureCard from "../components/FeatureCard";
import DemoSection from "../components/DemoSection";
import Button from "../components/Button";

const CounterIsland = await asIsland(Counter);
const HelloIsland = await asIsland(Hello);

export default function Exhibition() {
  return html`
    <html>
      <head>
        <title>🌃 Noxt: Bun + Preact Metaframework</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="../assets/styles.css" />
        <link rel="stylesheet" href="../assets/prism.css" />
        <script src="../assets/prism.js"></script>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>🌃 Noxt: Bun + Preact Metaframework</h1>
            <p class="subtitle">
              A modern metaframework that combines server-side rendering with
              interactive islands for optimal performance and small bundle size
            </p>
            <div class="hero-buttons">
              <${Button} href="#demos" variant="primary" icon="🎯">View Demos</${Button}>
              <${Button} href="#features" variant="secondary" icon="⚡">Learn More</${Button}>
              <${Button} href="#getting-started" variant="secondary" icon="🚀">Get Started</${Button}>
            </div>
          </header>

          <main>
            <section id="features">
              <h2>⚡ Key Features</h2>

              <div class="features-grid">
                <${FeatureCard} icon="🖥️" title="Server-Side Rendering">
                  Pages are rendered on the server for fast initial load,
                  better SEO, and improved performance on slow connections.
                </${FeatureCard}>

                <${FeatureCard} icon="🏝️" title="Interactive Islands">
                  Self-contained interactive components that hydrate
                  independently, reducing JavaScript bundle size and improving
                  performance.
                </${FeatureCard}>

                <${FeatureCard} icon="⚡" title="Bun Runtime">
                  Built on Bun's lightning-fast JavaScript runtime and server,
                  delivering exceptional performance for both development and
                  production.
                </${FeatureCard}>

                <${FeatureCard} icon="📦" title="Preact Ecosystem">
                  Uses Preact, the 3KB React alternative with a compatible
                  API, for a smaller footprint and faster execution.
                </${FeatureCard}>

                <${FeatureCard} icon="🔄" title="Partial Hydration">
                  Only interactive components are hydrated, significantly
                  reducing client-side JavaScript execution time.
                </${FeatureCard}>

                <${FeatureCard} icon="⬇️" title="Small bundle size">
                  Combining server-side prerendering and interactive islands gives
                  much smaller client payloads by bundling only the interactive parts.
                </${FeatureCard}>
              </div>
            </section>

            <div class="divider"></div>

            <section id="demos">
              <h2>🎯 Interactive Demos</h2>

              <${DemoSection}
                icon="🔢"
                title="Counter Island"
                description="A simple counter demonstrating client-side interactivity with server-rendered initial state:"
                code=${`import { defineIsland } from "@lib/island";
import { html } from "htm/preact";
import { useState } from "preact/hooks";

function Counter({ start = 0 }) {
  let [value, setValue] = useState(start);

  return html\`
    <div>
      <button class="dec" onClick=\${() => setValue(value - 1)}>-</button>
      <span class="value">\${value}</span>
      <button class="inc" onClick=\${() => setValue(value + 1)}>+</button>
    </div>
  \`;
}

export default defineIsland(Counter, import.meta.path);`}
              >
                <div class="counter-container">
                  <${CounterIsland} start=${10} />
                </div>
              </${DemoSection}>

              <${DemoSection}
                icon="👋"
                title="Hello Island"
                description="An interactive greeting component with two-way data binding:"
                code=${`import { useState } from "preact/hooks";
import { html } from "htm/preact";
import { defineIsland } from "@lib/island";

function Hello() {
  const [name, setName] = useState("World");

  return html\`
    <div>
      <span>This is an interactive island !</span>
      <h2>Hello, \${name}!</h2>
      <input
        type="text"
        value=\${name}
        onInput=\${(e: Event) => setName((e.target as HTMLInputElement).value)}
      />
    </div>
  \`;
}

export default defineIsland(Hello, import.meta.path);`}
              >
                <${HelloIsland} />
              </${DemoSection}>
            </section>

            <div class="divider"></div>

            <section>
              <h2>📚 How It Works</h2>

              <div class="features-grid">
                <${FeatureCard} icon="🖥️" title="Server Rendering">
                  Pages are rendered to HTML on the server using Preact's
                  render-to-string functionality, providing fast initial page
                  loads and excellent SEO performance.
                </${FeatureCard}>

                <${FeatureCard} icon="🔌" title="Island Hydration">
                  Interactive components are marked as "islands" and only
                  these specific components are hydrated on the client side,
                  reducing JavaScript bundle size.
                </${FeatureCard}>

                <${FeatureCard} icon="⚡" title="Bun Server">
                  The Bun runtime provides a fast HTTP server and JavaScript
                  runtime that's compatible with both server and browser
                  environments.
                </${FeatureCard}>
              </div>
            </section>

            <div class="divider"></div>

            <section id="getting-started">
              <h2>🔧 Technical Details</h2>

              <div class="features-grid">
                <${FeatureCard} icon="🚀" title="Getting Started">
                  <p>
                    To start using Noxt, you can delete everything in the <code>src</code> folder.
                    Then create page components in 
                    <code>src/pages</code> and use <code>defineIsland</code> and
                    <code>asIsland</code> to convert interactive
                    components.
                  </p>
                </${FeatureCard}>

                <${FeatureCard} icon="🛠️" title="Commands">
                  <ul>
                    <li><code>bun install</code> — Install dependencies.</li>
                    <li><code>bun dev</code> — Start the development server with hot reload.</li>
                    <li><code>bun run build</code> — Bundle the project for production.</li>
                    <li><code>bun preview</code> — Preview the bundled project.</li>
                    <li><code>bun prerender</code> — Prerender a static project (no SSR or routes).</li>
                  </ul>
                </${FeatureCard}>

                <${FeatureCard} icon="📁" title="Project Structure">
                    <pre class="code-block">
src/
├── pages/          # Page components
├── components/     # Reusable components
└── assets/         # Static assets

lib/
├── server.ts       # Server rendering logic
├── island.ts       # Island hydration
└── manifest.ts     # Build manifest</pre>
                </${FeatureCard}> 

                <${FeatureCard} icon="📦" title="Key Dependencies">
                  <ul>
                    <li>
                      <strong>Bun</strong> - Fast JavaScript runtime and server
                    </li>
                    <li>
                      <strong>Preact</strong> - Lightweight React alternative
                    </li>
                    <li><strong>HTM</strong> - Hyperscript Tagged Markup</li>
                    <li><strong>Preact Render to String</strong> - SSR</li>
                  </ul>
                </${FeatureCard}>
              </div>
            </section>
          </main>

          <footer>
            <p style="margin-bottom: 1rem;">
              <strong>🌃 Noxt: Bun + Preact Metaframework</strong> | Built with ❤️ by
              <a style="color: inherit; margin-left: 0.3rem;" href="https://billuc.github.io">Luc Billaud</a>.
            </p>
            <p style="font-size: 0.9rem; color: #999;">
              © 2026 | Inspired by Next.js, Astro, and other modern frameworks
            </p>
          </footer>
        </div>
      </body>
    </html>
  `;
}
