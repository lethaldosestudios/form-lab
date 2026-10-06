// Actual operating-console interactions and viewport checks. Dev server required.
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'
const executablePath =
  process.env.FORMLAB_BROWSER ??
  (existsSync(chromium.executablePath()) ? chromium.executablePath() : '/usr/bin/google-chrome')
let browser = await chromium.launch({
  executablePath,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
let page = await browser.newPage({
  viewport: { width: 1366, height: 768 },
  reducedMotion: 'reduce',
})
page.setDefaultTimeout(45000)
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
const out = 'screenshots/v6'
await mkdir(out, { recursive: true })
const button = (name) => page.getByRole('button', { name, exact: true })
const screenText = async (text) =>
  assert.ok((await page.locator('.crt-feedback').innerText()).includes(text), text)
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><path fill="black" fill-rule="evenodd" d="M64 12 A52 52 0 1 1 63.99 12 Z M64 44 A20 20 0 1 0 64.01 44 Z"/></svg>'
try {
  if (!process.env.FORMLAB_JOURNEY_ONLY) {
    await page.goto(process.env.FORMLAB_URL ?? 'http://127.0.0.1:5173', {
      waitUntil: 'networkidle',
    })
    await button('Previous material presets').click()
    await screenText('TOY')
    await button('Next colors').click()
    await screenText('FLAME')
    const radio = page.getByRole('radio', { name: 'OPAQUE', exact: true })
    await radio.focus()
    await radio.press('ArrowRight')
    await screenText('TRANSLUCENT')
    await button('EDIT').click()
    await page.getByLabel('EDIT COLOR', { exact: true }).fill('#123456')
    await page.getByLabel('EDIT COLOR', { exact: true }).press('Enter')
    await screenText('CUSTOM · #123456')
    const dial = page.getByRole('slider', { name: 'AIR PRESSURE', exact: true })
    await dial.scrollIntoViewIfNeeded()
    const d = await dial.boundingBox()
    await page.mouse.move(d.x + d.width / 2, d.y + d.height / 2)
    await page.mouse.down()
    await page.mouse.move(d.x + d.width / 2, d.y + d.height / 2 - 16)
    await page.mouse.up()
    assert.equal(await dial.getAttribute('aria-valuenow'), '90')
    await dial.press('Home')
    await dial.press('ArrowUp')
    assert.equal(await dial.getAttribute('aria-valuenow'), '5')
    await screenText('5%')
    await page
      .locator('input[type=file]')
      .setInputFiles({ name: 'cutout.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) })
    await page.getByText('READY TO MATERIALIZE', { exact: true }).waitFor({ timeout: 30000 })
    await page.locator('.crt canvas').waitFor({ state: 'attached', timeout: 30000 })
    assert.ok(await page.locator('.crt canvas').count(), 'actual WebGL preview')
    const holes = await page.evaluate(() => window.__FORMLAB__.snapshot().holeCount)
    assert.ok(holes > 0, 'interior cutout extraction')
    console.log('PASS: file, preview and cutouts')
    await page.getByRole('switch', { name: 'LIVE PREVIEW', exact: true }).click()
    await dial.press('End')
    await screenText('100%')
    await page.waitForFunction(() => window.__FORMLAB__.snapshot().status === 'READY')
    await page.getByRole('switch', { name: 'LIVE PREVIEW', exact: true }).click()
    await page.waitForFunction(() => window.__FORMLAB__.snapshot().previewStatus === 'current')
    for (const size of [
      { width: 1440, height: 900 },
      { width: 1366, height: 768 },
      { width: 1024, height: 768 },
      { width: 390, height: 844 },
      { width: 1093, height: 614 },
    ]) {
      console.log('Viewport', size)
      await browser.close()
      browser = await chromium.launch({
        executablePath,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      })
      page = await browser.newPage({ viewport: size, reducedMotion: 'reduce' })
      page.setDefaultTimeout(45000)
      page.on('pageerror', (e) => errors.push(e.message))
      await page.goto(process.env.FORMLAB_URL ?? 'http://127.0.0.1:5173', {
        waitUntil: 'networkidle',
      })
      await page.getByRole('switch', { name: 'LIVE PREVIEW', exact: true }).click()
      await page
        .locator('input[type=file]')
        .setInputFiles({ name: 'cutout.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) })
      await page.getByText('READY TO MATERIALIZE', { exact: true }).waitFor({ timeout: 30000 })
      const results = await page.evaluate(() => {
        const results = []
        for (const target of document.querySelectorAll(
          '.machine__deck button, .machine__deck [role=slider], .machine__deck [role=switch]',
        )) {
          if (target.disabled || target.getAttribute('aria-disabled') === 'true') continue
          target.focus()
          target.scrollIntoView({ block: 'end', behavior: 'instant' })
          const key = target.getBoundingClientRect().toJSON()
          const crt = document.querySelector('.crt__screen').getBoundingClientRect().toJSON()
          results.push({ name: target.getAttribute('aria-label') ?? target.textContent, key, crt })
        }
        return results
      })
      for (const { name, key, crt } of results) {
        assert.ok(
          crt.y >= -1 && crt.y + crt.height <= size.height + 1,
          `CRT visible ${name} ${JSON.stringify(size)}`,
        )
        assert.ok(key.y >= 0 && key.y + key.height <= size.height + 1, `control visible ${name}`)
        assert.ok(
          key.x + key.width <= crt.x ||
            key.x >= crt.x + crt.width ||
            key.y >= crt.y + crt.height ||
            key.y + key.height <= crt.y,
          `no screen overlap ${name}`,
        )
      }
      console.log('PASS:', results.length, 'controls and CRT visible')
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        'no horizontal overflow',
      )
      await page.screenshot({
        path: `${out}/console-${size.width}x${size.height}.png`,
        timeout: 10000,
      })
    }
    await page.setViewportSize({ width: 390, height: 844 })
    await button('EDIT').click()
    await page.getByLabel('EDIT COLOR', { exact: true }).fill('#XYZ123')
    await page.getByLabel('EDIT COLOR', { exact: true }).press('Enter')
    assert.ok(await page.getByRole('alert').isVisible())
    await page.screenshot({ path: `${out}/mobile-color-editor.png` })
    await page.getByRole('button', { name: 'CANCEL', exact: true }).click()
  }
  // Start the full-resolution journey in a fresh browser after repeated WebGL resizing.
  await browser.close()
  browser = await chromium.launch({
    executablePath,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })
  page = await browser.newPage({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' })
  page.setDefaultTimeout(45000)
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(process.env.FORMLAB_URL ?? 'http://127.0.0.1:5173', { waitUntil: 'networkidle' })
  await page.getByRole('switch', { name: 'LIVE PREVIEW', exact: true }).click()
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'cutout.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) })
  await page.getByText('READY TO MATERIALIZE', { exact: true }).waitFor({ timeout: 30000 })
  console.log('Fabrication journey')
  await page.evaluate(() => {
    window.__consoleBusyLocked = false
    const key = document.querySelector('[aria-label="Next material presets"]')
    new MutationObserver(() => {
      if (key.disabled) window.__consoleBusyLocked = true
    }).observe(key, { attributes: true, attributeFilter: ['disabled'] })
  })
  await button('MATERIALIZE').click()
  await page.getByText('OBJECT COMPLETE', { exact: true }).waitFor({ timeout: 30000 })
  assert.ok(
    await page.evaluate(() => window.__consoleBusyLocked),
    'observed busy lock during fabrication',
  )
  await page.locator('.crt canvas').waitFor({ timeout: 30000 })
  await page.screenshot({ path: `${out}/object-complete.png` })
  await button('EDIT').click()
  assert.ok(await page.getByLabel('EDIT COLOR', { exact: true }).isVisible())
  await page.getByLabel('EDIT COLOR', { exact: true }).press('Escape')
  await button('RETRIEVE OBJECT').scrollIntoViewIfNeeded()
  await button('RETRIEVE OBJECT').click()
  await page.waitForFunction(() => window.__FORMLAB__.snapshot().status === 'RETRIEVED', null, {
    timeout: 30000,
  })
  await page.screenshot({ path: `${out}/retrieved.png` })
  assert.deepEqual(errors, [], 'no browser exceptions')
  console.log(
    process.env.FORMLAB_JOURNEY_ONLY
      ? 'PASS: actual input, fabrication, busy locks and retrieval.'
      : 'PASS: actual input, material/color/editor, knob drag/keyboard, cutouts, preview on/off, fabrication/retrieval; all deck controls and CRT visible at five viewports.',
  )
} catch (error) {
  console.log(error)
  console.log(
    'Browser diagnostics',
    errors,
    await page
      .locator('.crt')
      .innerText()
      .catch(() => 'browser closed'),
    await page
      .locator('.crt-workspace__view')
      .evaluate((e) => ({
        html: e.innerHTML.slice(0, 1200),
        height: e.getBoundingClientRect().height,
      }))
      .catch(() => null),
  )
  throw error
} finally {
  await browser.close()
}
