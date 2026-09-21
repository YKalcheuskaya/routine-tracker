import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('a visitor completes and keeps a Today step after reload', async ({ page }) => {
  await page.goto('/')
  const checkbox = page.getByRole('checkbox', { name: 'Complete: Open a window' })
  await checkbox.check()
  await expect(page.getByText('1 of 3 steps complete')).toBeVisible()
  await page.reload()
  await expect(checkbox).toBeChecked()
})

test('progress labels stay inside cards in a compact desktop layout', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 })
  await page.goto('/')
  const labelLocator = page.locator('.routine-card .progress-pill')
  await expect(labelLocator).toHaveCount(6)
  const labels = await labelLocator.all()
  for (const label of labels) {
    const isContained = await label.evaluate((element) => {
      const pill = element.getBoundingClientRect()
      const card = element.closest('.routine-card').getBoundingClientRect()
      return pill.left >= card.left && pill.right <= card.right
    })
    expect(isContained).toBe(true)
  }
})

test('schedule is read-only and keyboard navigation reaches completion controls', async ({ page }) => {
  await page.goto('/')
  const checkbox = page.getByRole('checkbox', { name: 'Complete: Open a window' })
  await checkbox.press('Space')
  await expect(checkbox).toBeChecked()
  await page.getByRole('button', { name: 'Schedule' }).click()
  await expect(page.getByText(/Completion is available only in Today/)).toBeVisible()
  await expect(page.getByRole('checkbox')).toHaveCount(0)
})

test('a visitor creates, edits, uses, and deletes a routine', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Routines' }).click()
  await page.getByRole('button', { name: 'Add routine' }).click()
  await page.getByLabel('Title').fill('Interview reset')
  await page.getByLabel('Description').fill('Prepare one calm interview step.')
  await page.getByRole('textbox', { name: 'Step 1', exact: true }).fill('Review one project decision')
  await page.getByRole('button', { name: 'Create routine' }).click()

  let card = page.locator('.manager-card').filter({ hasText: 'Interview reset' })
  await expect(card).toBeVisible()
  await card.getByRole('button', { name: 'Edit' }).click()
  await page.getByLabel('Title').fill('Interview preparation')
  await page.getByRole('button', { name: 'Save changes' }).click()

  await page.getByRole('button', { name: 'Today' }).click()
  await expect(page.getByRole('heading', { name: 'Interview preparation' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Interview preparation' })).toBeVisible()

  await page.getByRole('button', { name: 'Routines' }).click()
  card = page.locator('.manager-card').filter({ hasText: 'Interview preparation' })
  await card.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete routine' }).click()
  await expect(card).toHaveCount(0)
})

test('a visitor reviews an import before replacing local data', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Data' }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download JSON backup' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('routine-tracker-data.json')
  const input = page.locator('#import-file')
  await input.setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{broken') })
  await expect(page.getByRole('alert')).toContainText('current data was not changed')

  const replacement = { version: 2, routines: [], days: {} }
  await input.setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(replacement)) })
  await expect(page.getByRole('heading', { name: 'Ready to replace local data' })).toBeVisible()
  await expect(page.getByText('Routines').locator('..').getByText('0')).toBeVisible()
  await page.getByRole('button', { name: 'Import reviewed data' }).click()
  await expect(page.getByRole('status')).toContainText('Import complete')
  await page.getByRole('button', { name: 'Routines' }).click()
  await expect(page.getByText('No routines yet. Add one to build your week.')).toBeVisible()
})

test('insights summarize today with category-level evidence', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('checkbox', { name: 'Complete: Open a window' }).check()
  await page.getByRole('button', { name: 'Insights' }).click()
  await expect(page.getByRole('heading', { name: 'A gentle look back.' })).toBeVisible()
  await expect(page.getByRole('img', { name: '1 of 15 steps complete' })).toBeVisible()
  await expect(page.getByRole('img', { name: '1 of 5 steps complete' })).toBeVisible()
})

test('a date-scoped progress record resets on a controlled new day', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('routine-tracker:daily-progress', JSON.stringify({ version: 1, localDate: '2026-09-12', completedStepIds: ['am-care:open-window'] }))
  })
  await page.goto('/')
  await expect(page.getByRole('checkbox', { name: 'Complete: Open a window' })).not.toBeChecked()
})

test('has no serious automated accessibility violations', async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact))).toEqual([])
})
