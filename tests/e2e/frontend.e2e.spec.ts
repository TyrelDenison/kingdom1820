import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('homepage has correct title and heading', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Kingdom1820/)

    const heading = page.locator('h1').first()
    await expect(heading).toHaveText('Connect with Faith-Based Professional Networks')
  })
})
