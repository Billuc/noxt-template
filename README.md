# Noxt Template

A template project using [Noxt](https://github.com/Billuc/noxt) — a Bun + Preact metaframework with server-side rendering and interactive islands.

## Features

- **Server-Side Rendering**: Pages are prerendered on the server for fast initial loads and SEO
- **Interactive Islands**: Self-contained interactive components that hydrate independently
- **Zero-config Setup**: Start quickly with minimal configuration
- **Bun Runtime**: Built on Bun's lightning-fast runtime and HTTP server

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your system

### Installation

```bash
bun install
```

### Development

```bash
bun dev
```

Starts the dev server with hot reload at `http://localhost:2101`.

### Production Build

```bash
bun run build
```

Bundles the project for production into the `dist/` directory. Then preview with:

```bash
bun preview
```

## Project Structure

```
pages/           # Page components (one file per route)
  index.ts       # Route: /
islands/         # Interactive island components
  Counter.ts
  Hello.ts
components/      # Reusable non-island components
  Button.tsx
  FeatureCard.tsx
  DemoSection.tsx
assets/          # Static assets (CSS, JS)
  styles.css
  prism.css
  prism.js
index.ts         # Server entry point
```

## Creating Pages

Create page files in the `pages/` directory. Each file becomes a route:

- `pages/index.ts` → `/`
- `pages/about.ts` → `/about`
- `pages/blog/post.ts` → `/blog/post`

Pages export a default Preact component:

```ts
import { html } from "htm/preact";

export default function Home() {
  return html`<h1>Hello, Noxt!</h1>`;
}
```

## Creating Islands

Islands are interactive components. Define them with `defineIsland` and use them in pages with `prepareIsland`:

```ts
import { useState } from "preact/hooks";
import { html } from "htm/preact";
import { defineIsland } from "noxt";

function Hello() {
  const [name, setName] = useState("World");

  return html`
    <div class="hello-demo">
      <span>This is an interactive island !</span>
      <h2>Hello, ${name}!</h2>
      <input
        type="text"
        value=${name}
        onInput=${(e: Event) => setName((e.target as HTMLInputElement).value)}
      />
    </div>
  `;
}

export default defineIsland(Hello, import.meta.path);
```

Import it in a page:

```ts
import { prepareIsland } from "noxt";
import Hello from "../islands/Hello";

const HelloIsland = await prepareIsland(Hello);
```

## Configuration

Environment variables:

- `PORT`: Server port (default: `2101`)
- `MODE`: `"development"` or `"production"`

## Commands

- `bun install` — Install dependencies.
- `bun dev` — Start the development server with hot reload.
- `bun run build` — Bundle the project for production.
- `bun preview` — Preview the bundled project in `dist/`.
