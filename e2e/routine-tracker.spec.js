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

test('schedule is read-only and keyboard navigation reaches completion controls', async ({ page }) => {
  await page.goto('/')
  const checkbox = page.getByRole('checkbox', { name: 'Complete: Open a window' })
  await checkbox.press('Space')
  await expect(checkbox).toBeChecked()
  await page.getByRole('button', { name: 'Schedule' }).click()
  await expect(page.getByText(/Completion is available only in Today/)).toBeVisible()
  await expect(page.getByRole('checkbox')).toHaveCount(0)
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
