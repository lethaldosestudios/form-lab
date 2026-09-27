# FORM//LAB — Agent Rules

**FORM//LAB** (MODEL: IM-01) is a fictional industrial "Inflation & Materialization Unit":
a 2D silhouette is inflated into a soft 3D form, shown on a curved CRT, then "dispensed"
from a vending-style tray. **The interface is the machine** — not a dashboard with a retro
skin. Judge every design decision by: *does this make the user feel like they are operating
a physical machine?*

Repo: `github.com/lethaldosestudios/form-lab` (private)

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server → http://localhost:5173 |
| `npm run build` | `tsc -b && vite build` — must pass |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm test` | Vitest (34 tests) — must pass |
| `npm run lint` | ESLint — must pass |
| `npm run shots` | Playwright capture → `screenshots/` (requires `npm run dev` running) |

**Before calling any change done: `npm run build`, `npm run lint` and `npm test` must all
pass.** Never leave the tree broken.

---

## Architecture — do not break these boundaries

```
src/engine/      generation engine — THREE-FREE. Emits neutral geometry buffers; must
                 never import `three` or `@react-three/*` (ESLint-enforced).
src/state/       machine state machine (single source of truth), zustand store, controllers.
src/components/  presentation.
src/styles/      design tokens + machine chrome.
```

- `src/components/crt/CRTRenderer.tsx` is the **only** module allowed to import `three`.
- `src/components/controls/**` must **never** import from `src/engine/**` (ESLint-enforced).
- Flow is one-directional: **UI → state → engine → RenderDescriptor → renderer**.
- `src/state/machineState.ts` owns machine status (`IDLE … RETRIEVED`, `ERROR`). Indicator
  lights, CRT content and dispenser state all *derive* from it. Illegal transitions are
  no-ops and are unit-tested — do not scatter booleans or add parallel state.
- The engine is procedural (silhouette → SDF → extruded volume → soft inflation via
  marching tetrahedra). Keep it replaceable: an AI generation backend may slot in behind
  the same interface without touching the machine layer.

---

## Design rules

- **Aesthetic:** dark industrial instrumentation. Restraint. The generated object is the
  only real colour; the material colour is the only *functional* accent. Never neon.
- **Depth model:** `L0 chassis → L1 recess → L2 plate → L3 component`. Depth must come
  from shadow / bevel / chamfer — **not** from 1px bordered "cards". If an element reads as
  a UI card floating on the machine rather than a manufactured part, redesign it.
- **References are a vocabulary, not a checklist.** Extract physical *construction*
  principles; never bolt on features merely because a reference machine has them.
- **No new controls or functionality** without an approved plan. Accessibility is not
  optional: keyboard operability, ARIA semantics, and `prefers-reduced-motion` must hold.

---

## Workflow

- Work is **plan-first**: explore → write a plan to `~/.commandcode/plans/` → get approval →
  implement. Do not implement a multi-file visual or feature change unplanned.
- **Git is trunk-based.** Commit straight to `main` and tag each finished version
  (`v1`, `v2`, `v3`, …). **No pull requests.**
- Commit messages end with this trailer:

  ```
  Co-authored-by: CommandCodeBot <noreply@commandcode.ai>
  ```

---

## Gotchas

- **Node is v24.21.0 via NVM** (`~/.nvm/versions/node/v24.21.0`). Non-interactive shells do
  not source `~/.bashrc`, so anything that shells out must put NVM's bin on PATH itself:
  `export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"`.
- **Toolchain is current:** Vite **8** (Rolldown-based), Vitest **5**, Playwright **1.63**,
  `@vitejs/plugin-react` **6**. When upgrading majors, do a **clean install**
  (`rm -rf node_modules package-lock.json && npm i`) — an incremental `npm i` fails with a
  bogus peer conflict because it tries to reconcile against the stale tree.
- **Type-augmentation gotcha:** `@testing-library/jest-dom` must be listed in
  `tsconfig.app.json` as **`@testing-library/jest-dom/vitest`**, not the bare package name —
  the root types augment Jest, not Vitest, so the matchers appear to vanish otherwise.
- **Playwright launch args must stay** `--no-sandbox --disable-dev-shm-usage`. Adding
  `--disable-gpu` or forced SwiftShader GL flags wedges the compositor and hangs
  `page.screenshot`.
- `screenshots/` is **gitignored** — local artifacts only. `screenshots/baseline/` holds the
  v1 captures for comparison.
- Vitest logs a harmless "Multiple instances of Three.js" warning (test-only; the production
  bundle has a single instance).
- The project root is this directory. Do not open the parent folder as the workspace —
  Command Code keys sessions off the folder path, so the parent is a different project.
