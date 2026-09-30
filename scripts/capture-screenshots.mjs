/**
 * Reproducible portfolio screenshot utility. Each capture starts with a fresh
 * browser context so local progress cannot leak between images.
 */
import { chromium } from '@playwright/test'

const baseURL = process.env.ROUTINE_TRACKER_URL ?? 'http://127.0.0.1:4173'
const browser = await chromium.launch()

async function capture(path, viewport, view = 'Today') {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  await page.goto(baseURL)
  if (view !== 'Today') await page.getByRole('button', { name: view }).click()
  await page.screenshot({ path })
  await context.close()
}

try {
  await capture('docs/screenshots/desktop-today.png', { width: 1280, height: 720 })
  await capture('docs/screenshots/mobile-today.png', { width: 390, height: 844 })
  await capture('docs/screenshots/desktop-plans.png', { width: 1280, height: 720 }, 'Plans')
  await capture('docs/screenshots/desktop-insights.png', { width: 1280, height: 720 }, 'Insights')
} finally {
  await browser.close()
}
