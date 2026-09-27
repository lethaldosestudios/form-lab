# FORM//LAB

**MODEL IM-01 — Inflation & Materialization Unit.**

FORM//LAB is a fictional industrial machine. You feed it a 2D silhouette; it inflates that
silhouette into a soft 3D form, shows the result on a curved CRT, and dispenses it from a
vending-style tray.

The governing idea: **the interface is the machine.** This is not a dashboard wearing a retro
skin. Every control is a manufactured part, every readout is instrumentation, and the generated
object is the only real colour on screen. The test for any new element is simple — *does this
make the user feel like they are operating a physical object?*

> **Status:** private, work in progress. Latest milestone: **v4 — Reference Pass**
> (reference film no longer crops; interior cutouts carry through to the object).

## Running it

Requires **Node 24.21.0** — `nvm use` picks it up from `.nvmrc` (see [Gotchas](#gotchas)).

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Vite dev server → <http://localhost:5173> |
| `npm run build` | `tsc -b && vite build` |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm test` | Vitest suite |
| `npm run lint` | ESLint |
| `npm run shots` | Playwright capture → `screenshots/` (needs `npm run dev` running) |

A change is only done when **`npm run build`, `npm run lint` and `npm test` all pass.**

## How it works

One-directional, no back-channels:

```
UI  →  state  →  engine  →  RenderDescriptor  →  renderer
```

| Layer | Directory | Responsibility |
| --- | --- | --- |
| Engine | `src/engine/` | Turns a silhouette into neutral geometry buffers. **Three-free by rule.** |
| State | `src/state/` | Machine state machine (single source of truth), store, controllers. |
| Components | `src/components/` | Presentation. |
| Styles | `src/styles/` | Design tokens + machine chrome. |

The procedural engine is only the *first* implementation of the engine contract: silhouette → SDF
→ extruded volume → soft inflation via marching tetrahedra. It emits a renderer-agnostic
`RenderDescriptor`, so an AI/image generation backend can slot in behind the same interface
without the machine layer noticing.

**Enforced boundaries** (ESLint, see `eslint.config.js`):

- `src/engine/**` must never import `three` / `@react-three/*`.
- `src/components/crt/CRTRenderer.tsx` is the **only** module allowed to import `three`.
- `src/components/controls/**` must never import from `src/engine/**`.

`src/state/machineState.ts` owns the machine status (`IDLE … RETRIEVED`, `ERROR`). Indicator
lights, CRT content and dispenser state all *derive* from it — illegal transitions are no-ops and
are unit-tested. Don't scatter booleans or add parallel state.

## Design rules

- **Aesthetic:** dark industrial instrumentation. Restraint. The generated object is the only real
  colour; the material colour is the only *functional* accent. Never neon.
- **Depth model:** `L0 chassis → L1 recess → L2 plate → L3 component`. Depth comes from shadow,
  bevel and chamfer — **not** from 1px bordered cards. If it reads as a UI card floating on the
  machine rather than a manufactured part, redesign it.
- **References are a vocabulary, not a checklist.** Take physical *construction* principles from
  reference machines; never bolt on features just because a reference has them.
- Accessibility is not optional: keyboard operability, ARIA semantics and
  `prefers-reduced-motion` must hold.

## Stack

React 19 · TypeScript 5.7 · Vite 8 (Rolldown) · Three.js (`@react-three/fiber` / `drei`) ·
Zustand · Motion · Vitest 5 · Playwright · ESLint 9 · Prettier.

## Working on it

- **Plan-first:** explore, then write a plan to `~/.commandcode/plans/`, get approval, implement.
  Don't implement a multi-file visual or feature change unplanned.
- **Trunk-based:** commit straight to `main` and tag each finished version (`v1`, `v2`, `v3`, …).
  No pull requests.
- **CI:** `.github/workflows/ci.yml` runs `lint` → `test` → `build` on every push to `main`, so the
  same gate is enforced remotely as well as locally.
- Commit messages are conventional-style (`feat:`, `fix:`, `chore:`) and end with:

  ```
  Co-authored-by: CommandCodeBot <noreply@commandcode.ai>
  ```

See **[AGENTS.md](./AGENTS.md)** for the full agent/design rules, and
**[FORM-LAB_AI_Build_Handoff.md](./FORM-LAB_AI_Build_Handoff.md)** for the product specification
(states, copy, controls, machine metaphor).

## Gotchas

- **Node is v24.21.0 via NVM.** Non-interactive shells don't source `~/.bashrc`, so anything that
  shells out must put NVM's bin on `PATH` itself:
  `export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"`.
- **Toolchain is current.** On major upgrades do a *clean* install
  (`rm -rf node_modules package-lock.json && npm i`) — an incremental `npm i` can fail with a bogus
  peer conflict.
- **Playwright launch args must stay** `--no-sandbox --disable-dev-shm-usage`. Adding
  `--disable-gpu` or forced SwiftShader GL flags wedges the compositor and hangs `page.screenshot`.
- `screenshots/` is **gitignored** — local artifacts only. `screenshots/baseline/` holds the v1
  captures for comparison.
- Vitest logs a harmless "Multiple instances of Three.js" warning (test-only; the production bundle
  has a single instance).
