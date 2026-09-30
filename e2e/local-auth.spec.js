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
  await page.getByRole('button', { name: 'Data' }).click()
  await expect(page.getByRole('status')).toContainText('up to date')
  await page.getByRole('button', { name: 'Calendar' }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Calendar' }).click()
  await expect(page.getByLabel('Water (ml)')).toHaveValue('1200')
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

test('an expired session never exposes an account cache to a guest or a new account', async ({ page }, testInfo) => {
  const suffix = `${testInfo.project.name}-${Date.now()}`
  const firstEmail = `routine-tracker-expired-${suffix}@example.test`
  const secondEmail = `routine-tracker-new-${suffix}@example.test`
  await page.goto('/')
  await createAccount(page, firstEmail)
  await page.getByRole('button', { name: 'Calendar' }).click()
  await page.getByLabel('Water (ml)').fill('1350')
  await page.getByRole('button', { name: 'Save metrics' }).click()
  await page.getByRole('button', { name: 'Data' }).click()
  await expect(page.getByRole('status')).toContainText('up to date')

  await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('sb-')).forEach((key) => localStorage.removeItem(key)))
  await page.reload()
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  await page.getByRole('button', { name: 'Calendar' }).click()
  await expect(page.getByLabel('Water (ml)')).toHaveValue('0')

  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.getByRole('button', { name: 'Need an account? Create one' }).click()
  await page.getByLabel('Email').fill(secondEmail)
  await page.getByLabel('Password').fill('Demo-password-2026')
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByRole('heading', { name: 'Your wellness journal is private.' })).toBeVisible()
  await page.getByRole('button', { name: 'Calendar' }).click()
  await expect(page.getByLabel('Water (ml)')).toHaveValue('0')
})
