// FORM//LAB — visual capture harness (Physicality Pass, plan §2).
//
// Loads the dev server, forces the machine into each state via the dev bridge
// (src/dev/devBridge.ts), and writes PNGs to screenshots/ for review.
//
//   npm run dev        # in one terminal
//   npm run shots      # in another
//
// Env: FORMLAB_URL (default http://localhost:5173)

import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from 'playwright'

const URL = process.env.FORMLAB_URL ?? 'http://localhost:5173'
const OUT = resolve('screenshots')

const DESKTOP = { width: 1440, height: 1200 }

/** Force the machine into a state, then capture. Runs inside the page. */
const STATES = [
  {
    name: '1-idle',
    run: async () => {
      const api = window.__FORMLAB__
      api.clear()
      api.setStatus('IDLE')
    },
  },
  {
    name: '2-reference-loaded',
    run: async () => {
      const api = window.__FORMLAB__
      api.clear()
      api.setStatus('REFERENCE_LOADED')
    },
  },
  {
    name: '3-configuring-preview',
    run: async () => {
      const api = window.__FORMLAB__
      api.clear()
      api.setStatus('CONFIGURING')
      await api.makeObject('preview')
      api.setStatus('CONFIGURING')
    },
  },
  {
    name: '4-materializing',
    run: async () => {
      const api = window.__FORMLAB__
      api.clear()
      await api.makeObject('preview')
      api.setStatus('MATERIALIZING')
    },
  },
  {
    name: '5-object-ready',
    run: async () => {
      const api = window.__FORMLAB__
      api.clear()
      await api.makeObject('full')
      api.setStatus('OBJECT_READY')
    },
  },
  {
    name: '6-dispenser-ready',
    run: async () => {
      const api = window.__FORMLAB__
      api.clear()
      await api.makeObject('full')
      api.setStatus('DISPENSER_READY')
    },
  },
  {
    name: '7-retrieved',
    run: async () => {
      const api = window.__FORMLAB__
      api.clear()
      await api.makeObject('full')
      api.setStatus('RETRIEVED', { retrievalCount: 1 })
    },
  },
]

const RESPONSIVE = [
  {
    name: '8-mobile-idle',
    width: 390,
    height: 900,
    run: async () => {
      const api = window.__FORMLAB__
      api.clear()
      api.setStatus('IDLE')
    },
  },
  {
    name: '9-tablet-idle',
    width: 1024,
    height: 1100,
    run: async () => {
      const api = window.__FORMLAB__
      api.clear()
      api.setStatus('IDLE')
    },
  },
]

async function capture(page, name, viewport, { fullPage = true } = {}) {
  await page.setViewportSize(viewport)
  // Let transitions settle and the R3F canvas paint its first frames.
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage })
  console.log(`  ✓ ${name}.png (${viewport.width}×${viewport.height})`)
}

async function main() {
  await mkdir(OUT, { recursive: true })

  const browser = await chromium.launch({
    // Container-safe flags. Do NOT add --disable-gpu or forced swiftshader GL
    // args: those wedge the compositor on this machine and hang screenshots.
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })
  const page = await browser.newPage({ viewport: DESKTOP })

  console.log(`FORM//LAB capture → ${URL}`)
  try {
    await page.goto(URL, { waitUntil: 'load', timeout: 20000 })
    await page.waitForFunction(() => Boolean(window.__FORMLAB__), null, { timeout: 15000 })
  } catch (error) {
    console.error(
      `\nCould not reach the dev server or the dev bridge at ${URL}.\n` +
        `Start it first:  npm run dev\n\n${error}\n`,
    )
    await browser.close()
    process.exitCode = 1
    return
  }

  for (const state of STATES) {
    await page.evaluate(state.run)
    await capture(page, state.name, DESKTOP)
  }

  for (const view of RESPONSIVE) {
    await page.evaluate(view.run)
    await capture(page, view.name, { width: view.width, height: view.height }, { fullPage: true })
  }

  await browser.close()
  console.log(`\nDone. ${STATES.length + RESPONSIVE.length} captures in screenshots/`)
}

await main()
