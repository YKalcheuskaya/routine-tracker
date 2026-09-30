import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('a visitor manually logs daily metrics and sees the same progress on Today', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Calendar' }).click()
  await page.getByLabel('Steps').fill('8000')
  await page.getByLabel('Water (ml)').fill('1500')
  await page.getByRole('button', { name: 'Save metrics' }).click()
  await page.getByRole('button', { name: 'Today' }).click()
  await expect(page.getByText('8,000 / 10,000 steps')).toBeVisible()
  await expect(page.getByText('1.5 / 2.0 L')).toBeVisible()
  await page.reload()
  await expect(page.getByText('8,000 / 10,000 steps')).toBeVisible()
})

test('a visitor logs sleep, activity, a meal, and a mood check-in', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Calendar' }).click()
  await page.getByLabel('Bedtime').fill('22:30')
  await page.getByLabel('Wake time').fill('06:30')
  await page.getByRole('button', { name: 'Save sleep' }).click()
  await page.getByRole('button', { name: 'Add activity' }).click()
  await page.getByLabel('Meal').selectOption('Lunch')
  await page.getByLabel('What did you eat?').fill('Grain bowl')
  await page.getByRole('button', { name: 'Add meal' }).click()
  await page.getByLabel('Mood').selectOption('Good')
  await expect(page.getByText('Walking · 30 min · Moderate')).toBeVisible()
  await expect(page.getByText('Lunch: Grain bowl')).toBeVisible()
  await page.getByRole('button', { name: 'Insights' }).click()
  await expect(page.getByRole('heading', { name: 'Weekly insights' })).toBeVisible()
  await expect(page.getByText('Sleep regularity')).toBeVisible()
})

test('a visitor owns a reminder label and confirms a local import', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Plans' }).click()
  await page.getByRole('button', { name: 'Add reminder' }).click()
  await page.getByLabel('Label').fill('Morning routine')
  await page.getByRole('button', { name: 'Save reminders' }).click()
  await page.getByRole('button', { name: 'Today' }).click()
  await page.getByRole('button', { name: '＋ Quick add' }).click()
  await expect(page.getByText('Morning routine')).toBeVisible()
  await page.getByRole('button', { name: 'Record Morning routine' }).click()
  await expect(page.getByText('1 recorded')).toBeVisible()
  await page.getByRole('button', { name: 'Data' }).click()
  const input = page.locator('#import-file')
  const replacement = { version: 3, goals: { steps: 9000, waterMl: 2000, sleepMinutes: 480, bedtime: '22:30', bedtimeWindowMinutes: 30, meals: 3, activityMinutes: 30 }, medications: [], routines: [], days: {} }
  await input.setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(replacement)) })
  await expect(page.getByRole('heading', { name: 'Ready to replace local data' })).toBeVisible()
  await page.getByRole('button', { name: 'Import reviewed data' }).click()
  await expect(page.getByRole('status')).toContainText('Import complete')
})

test('a malformed import is rejected and leaves the active journal visible', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Calendar' }).click()
  await page.getByLabel('Water (ml)').fill('700')
  await page.getByRole('button', { name: 'Save metrics' }).click()
  await page.getByRole('button', { name: 'Data' }).click()
  await page.locator('#import-file').setInputFiles({
    name: 'malformed.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ version: 3, goals: {}, medications: [null], routines: [], days: {} })),
  })
  await expect(page.getByRole('alert')).toContainText('not a valid version 3 wellness export')
  await page.getByRole('button', { name: 'Calendar' }).click()
  await expect(page.getByLabel('Water (ml)')).toHaveValue('700')
})

test('reminders, bounded self-reports, and date clearing preserve the guest journal', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Calendar', exact: true }).click()
  await page.getByLabel('Water (ml)', { exact: true }).fill('1250')
  await page.getByRole('button', { name: 'Save metrics' }).click()

  await page.getByRole('button', { name: 'Plans', exact: true }).click()
  await page.getByRole('button', { name: 'Add reminder' }).click()
  await page.getByLabel('Label', { exact: true }).fill('Fictional reminder')
  await page.getByRole('button', { name: 'Save reminders' }).click()

  await page.getByRole('button', { name: 'Calendar', exact: true }).click()
  await page.getByLabel('Choose date').fill('')
  await expect(page.getByRole('heading', { name: 'Calendar', exact: true })).toBeVisible()
  await expect(page.getByLabel('Choose date')).not.toHaveValue('')
  await page.getByLabel('Stress (0–10)').fill('11')
  await expect(page.getByLabel('Stress (0–10)')).toHaveValue('')
  await page.reload()
  await page.getByRole('button', { name: 'Calendar', exact: true }).click()
  await expect(page.getByLabel('Water (ml)', { exact: true })).toHaveValue('1250')
  await expect(page.getByLabel('Stress (0–10)')).toHaveValue('')
  await page.getByRole('button', { name: 'Plans', exact: true }).click()
  await expect(page.getByLabel('Label', { exact: true })).toHaveValue('Fictional reminder')
})

test('has no serious automated accessibility violations in every current view', async ({ page }) => {
  await page.goto('/')
  for (const view of ['Today', 'Calendar', 'Insights', 'Plans', 'Data', 'Sign in']) {
    await page.getByRole('button', { name: view, exact: true }).click()
    await expect(page.locator('main')).toBeVisible()
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact))).toEqual([])
  }
})
