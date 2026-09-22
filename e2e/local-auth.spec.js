import { expect, test } from '@playwright/test'

async function createAccount(page, email) {
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Sign in' }).click()
  await page.getByRole('button', { name: 'Need an account? Create one' }).click()
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('Demo-password-2026')
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByRole('heading', { name: 'Your wellness journal is private.' })).toBeVisible()
}

test('disposable local accounts register and keep their journals isolated', async ({ page }, testInfo) => {
  const suffix = `${testInfo.project.name}-${Date.now()}`
  const firstEmail = `routine-tracker-first-${suffix}@example.test`
  const secondEmail = `routine-tracker-second-${suffix}@example.test`
  await page.goto('/')
  await createAccount(page, firstEmail)
  await page.getByRole('button', { name: 'Today' }).click()
  await page.getByRole('button', { name: 'Calendar' }).click()
  await page.getByLabel('Water (ml)').fill('1200')
  await page.getByRole('button', { name: 'Save metrics' }).click()
  await page.getByRole('button', { name: 'Account' }).click()
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible()
  await page.getByRole('button', { name: 'Need an account? Create one' }).click()
  await page.getByLabel('Email').fill(secondEmail)
  await page.getByLabel('Password').fill('Demo-password-2026')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.getByRole('button', { name: 'Today' }).click()
  await page.getByRole('button', { name: 'Calendar' }).click()
  await expect(page.getByLabel('Water (ml)')).toHaveValue('0')
})
