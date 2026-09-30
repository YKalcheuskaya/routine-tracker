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

test('a failed snapshot read never overwrites the server journal with fallback data', async ({ page }, testInfo) => {
  const email = `routine-tracker-read-failure-${testInfo.project.name}-${Date.now()}@example.test`
  await page.goto('/')
  await createAccount(page, email)
  await page.getByRole('button', { name: 'Calendar', exact: true }).click()
  await page.getByLabel('Water (ml)', { exact: true }).fill('1250')
  await page.getByRole('button', { name: 'Save metrics' }).click()
  await page.getByRole('button', { name: 'Data', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('up to date')

  await page.reload()
  await page.getByRole('button', { name: 'Calendar', exact: true }).click()
  await expect(page.getByLabel('Water (ml)', { exact: true })).toHaveValue('1250')
  await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('routine-tracker:account:')).forEach((key) => localStorage.removeItem(key)))

  let fallbackWrites = 0
  page.on('request', (request) => {
    if (request.url().includes('/rest/v1/wellness_snapshots') && request.method() === 'POST') fallbackWrites += 1
  })
  await page.route('**/rest/v1/wellness_snapshots*', (route) => route.request().method() === 'GET'
    ? route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ code: 'PGRST000', details: null, hint: null, message: 'Fictional temporary read failure' }) })
    : route.continue())
  await page.reload()
  await page.getByRole('button', { name: 'Data', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('needs attention')
  expect(fallbackWrites).toBe(0)

  await page.unroute('**/rest/v1/wellness_snapshots*')
  await page.reload()
  await page.getByRole('button', { name: 'Calendar', exact: true }).click()
  await expect(page.getByLabel('Water (ml)', { exact: true })).toHaveValue('1250')
})
