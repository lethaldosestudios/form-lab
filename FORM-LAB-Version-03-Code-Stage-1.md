# Version 03 — code stage 1 (v6)

Implemented from the approved October 6 plan and subsequent Material/Colors revisions. Paper version 02 remains preserved; version 03 is a partial design snapshot because its MCP allowance was exhausted. This code stage preserves working controls that the snapshot has not yet redesigned.

## Operating contract

Physical controls have fixed legends. Their motion, position and illumination provide mechanical feedback; changing names, values and messages belong on the CRT. The rewritten Material, Colors and Reference assemblies follow this rule. Existing secondary control readouts remain temporarily until their Paper redesign is complete.

- MATERIAL PRESETS: vertical Up/Down keys browse the ten built-in recipes. Up selects previous, Down next; endpoints clamp. Selection applies the existing recipe, including inflation defaults and material color. The CRT shows name and index.
- COLORS: an independent vertical Up/Down pair browses the existing six-color palette. It never reapplies the material recipe. For custom colors outside that palette, Down starts at the first entry and Up at the last. RECENT and separate PRESETS buttons are removed.
- EDIT: the CRT accepts a custom #RRGGBB color, validates it and supports Enter/APPLY and Escape/CANCEL. Focus returns to EDIT. Full transparency names appear on the display; frosted selectors support radio arrow-key navigation.
- INSERT/RESET: a fixed reference input assembly under the CRT. The selected silhouette appears in the CRT, including when preview is off. Extraction preserves interior cutouts; replaced or reset file operations cannot install obsolete results.
- AIR PRESSURE: the approved chrome inflation knob, static scale and fixed legend. Its 0–1 parameter, 270-degree sweep, vertical drag and keyboard/ARIA behavior remain intact. Its changing percentage is routed to the CRT.
- Processing, scene and secondary inflation controls remain functional. Their latest parameter/toggle feedback also routes to the CRT. Preview off still updates feedback and permits materialization.

## Display and lifecycle

Desktop columns are Material+Inflation / CRT+Reference+Materialize / existing instrumentation+Processing+Scene. The desktop CRT module is approximately 571px wide at 1366px and 1440px viewports (screen approximately 471×353px), enlarged from the 513px Paper starting proportion. Screen aspect ratio remains 4:3.

The center assembly stays pinned within the operating deck. At narrower widths the same CRT moves above the controls and remains compact and sticky; no second WebGL canvas is created. Pinning ends at the lower fabrication/dispenser phase. Preview/reference and feedback have separate space inside the screen.

Machine status remains owned by the existing reducer. Completed and retrieved screens keep processing feedback and the custom editor available; editing parameters still invalidates the completed object through the reducer. Busy and fault states take display priority and reject conflicting parameter changes at both UI and store boundaries. A canonical generation revision invalidates previews immediately on edits, reset and preview-off, including the debounce interval; fabrication completion after reset is also rejected.

## Deferred design work

Global screw placement audit, chassis-mounted gauge, boolean lever/rocker treatment, crease control redesign and final status-light construction await completion of Paper version 03. The fabrication section directly above the dispenser remains a deferred redesign/removal discussion. These are not presented as finished.

Mirror the latest approved Material/Colors revisions into Paper version 03 when access returns. Paper exports provide design markup/styles, not automatic changes to the application state, engine routing, accessible interactions or tests; those are implemented and verified here.

## Verification

Behavior tests cover routing, recipe/color boundaries, custom editing, radio keyboard operation, retained parameters, input/reset supersession, busy locks and stale preview/fabrication results. Required completion gates are build, lint and Vitest.

`node tools/verify-console.mjs` (with the dev server running) verifies actual file upload, cutout extraction, preview on/off, material/color/editor operation, pressure drag/keyboard behavior, materialization/retrieval and every operating control's visibility alongside the CRT. Viewports: 1440×900, 1366×768, 1024×768, 390×844 and 1093×614 (reduced CSS viewport equivalent to 125% zoom from 1366×768). Reduced motion is enabled during this check. Screenshots are local, ignored artifacts in `screenshots/v6/`.

Set FORMLAB_BROWSER to override the browser executable; the harness uses bundled Chromium when available, otherwise installed Chrome. Launch arguments preserve --no-sandbox and --disable-dev-shm-usage.

Build and lint passed; all 66 Vitest tests passed. Browser verification uses fresh browsers for viewport captures and the final fabrication journey because repeated WebGL resizing made installed headless Chrome unstable in this environment. FORMLAB_JOURNEY_ONLY=1 runs the fabrication/retrieval portion independently. The harness does not use the development bridge to force machine states; its snapshot is read-only.

Completed browser evidence: material/color/editor and pressure drag/keyboard interaction; actual reference upload, extracted cutouts and live 3D preview; every enabled deck control alongside the CRT at all five listed sizes; mobile invalid-color editing; full-resolution WebGL object, observed busy lock, post-completion EDIT and retrieval. Checks passed in separate runs; no browser JavaScript exceptions were reported. Viewport assertions use DOM geometry after real focus/scroll, while all parameter changes and fabrication/retrieval are driven through controls.
