import { html } from "htm/preact";
import { prepareIsland } from "noxt";
import Counter from "../islands/Counter";
import Hello from "../islands/Hello";
import FeatureCard from "../components/FeatureCard";
import DemoSection from "../components/DemoSection";
import Button from "../components/Button";
import stylesUrl from "../assets/styles.css" with { type: "file" };
import prismCssUrl from "../assets/prism.css" with { type: "file" };
import prismJsUrl from "../assets/prism.js" with { type: "file" };

const CounterIsland = await prepareIsland(Counter);
const HelloIsland = await prepareIsland(Hello);

export default function Exhibition() {
  return html`
    <html>
      <head>
        <title>🌃 Noxt: Bun + Preact Metaframework</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="${stylesUrl}" />
        <link rel="stylesheet" href="${prismCssUrl}" />
        <script src="${prismJsUrl}"></script>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>Noxt: Bun + Preact Metaframework</h1>
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
                code=${`import { defineIsland } from "noxt";
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
import { defineIsland } from "noxt";

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
                <${FeatureCard} icon="🖥️" title="Prerendering">
                  <code>prepareRoutes()</code> scans <code>pages/</code> at
                  build time, prerenders each page to static HTML via Preact's
                  SSR, and generates a route map for <code>Bun.serve()</code>.
                </${FeatureCard}>

                <${FeatureCard} icon="🔌" title="Island Hydration">
                  <code>defineIsland</code> marks a component for client-side
                  hydration. <code>prepareIsland</code> generates a script that
                  ships only the interactive parts — the rest stays static HTML.
                </${FeatureCard}>

                <${FeatureCard} icon="⚡" title="Bun Macros">
                  <code>prepareRoutes</code> is a Bun macro (<code>with { type: "macro" }</code>)
                  that runs at build time. No runtime overhead, no framework CLI — just
                  standard Bun commands.
                </${FeatureCard}>
              </div>
            </section>

            <div class="divider"></div>

            <section id="getting-started">
              <h2>🔧 Technical Details</h2>

              <div class="features-grid">
                <${FeatureCard} icon="🚀" title="Getting Started">
                  <p>
                    Create page components in <code>pages/</code> and island
                    components in <code>islands/</code>. Use <code>defineIsland</code>${" "}
                    to mark interactive components and <code>prepareIsland</code>${" "}
                    to use them in pages.
                  </p>
                </${FeatureCard}>

                <${FeatureCard} icon="🛠️" title="Commands">
                  <ul>
                    <li><code>bun install</code> — Install dependencies.</li>
                    <li><code>bun dev / bun run index.ts</code> — Start the development server.</li>
                    <li><code>bun run build / bun build --target=bun --outdir=dist index.ts</code> — Build for production.</li>
                    <li><code>bun preview / cd dist && bun run index.js</code> — Preview the bundled project.</li>
                  </ul>
                </${FeatureCard}>

                <${FeatureCard} icon="📁" title="Project Structure">
                    <pre class="code-block">
pages/           # Page components (one per route)
├── index.ts     # Route: /
islands/         # Interactive island components
├── Counter.ts
├── Hello.ts
components/      # Reusable non-island components
assets/          # Static assets
index.ts         # Server entry point</pre>
                </${FeatureCard}> 

                <${FeatureCard} icon="📦" title="Key Dependencies">
                  <ul>
                    <li>
                      <strong>Bun</strong> — JavaScript runtime and HTTP server
                    </li>
                    <li><strong>Preact</strong> — Lightweight React alternative</li>
                    <li><strong>HTM</strong> — Hyperscript Tagged Markup</li>
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
