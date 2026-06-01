# Vigil Web App

Vite + React + TypeScript frontend for Vigil. The app provides the marketing landing page and the operations workbench served by the Rust Axum daemon.

## Stack

- Vite
- React 19
- TypeScript
- Tailwind CSS v3
- React Router
- Chart.js
- GSAP
- Geist fonts
- `lucide-react` icons

Do not swap the styling, routing, animation, or icon stack without an explicit task. The root `AGENTS.md` has the broader product and agent guidance.

## Commands

Run from `apps/web/`:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

`npm run build` runs `tsc -b` and `vite build`, then writes production assets to `dist/`.

## Local Development

Use Vite for frontend-only work:

```bash
npm run dev
```

For integrated backend/API work, run the Rust daemon from the repo root:

```bash
cargo run -p vigil-cli -- daemon --port 8080
```

Then open `http://localhost:8080`.

The API client in `src/lib/api.ts` uses same-origin requests and contains mock fallbacks when the backend is unreachable. Keep those fallbacks realistic and clearly bounded.

## Source Map

- `src/pages/Landing.tsx` - landing page and marketing surface.
- `src/pages/Dashboard.tsx` - operations workbench, incident views, health, sensor trends, and mesh topology.
- `src/lib/api.ts` - frontend API client, types, auth token handling, and fallback data.
- `src/index.css` - Tailwind layers, Geist imports, and Vigil CSS tokens.
- `src/assets/` - checked-in frontend assets.

## Build Output

Do not hand-edit:

- `dist/`
- `node_modules/`
- TypeScript build info under `node_modules/.tmp/`

When preparing static assets for the Rust server, regenerate from source and copy the built output intentionally.

## UI Quality Bar

For landing page or redesign tasks, use the `design-taste-frontend` skill. In this repo that means:

- Design read: operational devtool for industrial supervisors and technical reviewers.
- Current direction: dark industrial interface, amber accent, Geist typography, compact operations density.
- Preserve the serious product language. Avoid generic marketing filler, decorative version labels, fake precision, duplicate CTA intent, and visual effects that do not support comprehension.
- Use real screenshots, generated images, or actual live component previews for product visuals.
- Keep motion purposeful, respect reduced motion, and clean up GSAP effects.
- Test desktop and mobile layouts. Navigation must stay usable and controls must remain readable in light and dark themes.

## Verification

Before handing off frontend changes, run:

```bash
npm run lint
npm run build
```

For visual changes, also run the integrated daemon and capture or inspect the relevant page in a browser.
