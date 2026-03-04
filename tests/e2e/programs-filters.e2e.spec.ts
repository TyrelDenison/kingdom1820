import { test, expect } from '@playwright/test'

test.describe('Programs filter page', () => {
  test('page structure loads correctly', async ({ page }) => {
    await page.goto('/programs')

    await expect(page.locator('h1')).toHaveText('Find Faith-Based Programs')
    await expect(page.locator('.filters-sidebar')).toBeVisible()
    await expect(page.locator('.programs-count')).toBeVisible()
  })

  test('URL param sets filter UI state', async ({ page }) => {
    await page.goto('/programs?format=online')

    await expect(page.locator('#format')).toHaveValue('online')
  })

  test('multiple URL params set multiple filter UI states', async ({ page }) => {
    await page.goto('/programs?format=in-person&freq=weekly')

    await expect(page.locator('#format')).toHaveValue('in-person')
    await expect(page.locator('#frequency')).toHaveValue('weekly')
  })

  test('selecting a filter updates the URL', async ({ page }) => {
    await page.goto('/programs')

    await page.locator('#format').selectOption('in-person')

    await expect(page).toHaveURL(/format=in-person/)
  })

  test('typing in search box updates the URL', async ({ page }) => {
    await page.goto('/programs')

    await page.locator('#search').fill('test')

    await expect(page).toHaveURL(/search=test/)
  })

  test('Clear button appears when filters are active and clears URL params', async ({ page }) => {
    await page.goto('/programs?format=online')

    const clearButton = page.locator('.filters-clear')
    await expect(clearButton).toBeVisible()

    await clearButton.click()

    await expect(page).not.toHaveURL(/format=/)
    await expect(clearButton).not.toBeVisible()
  })

  test('multiple filters appear in URL', async ({ page }) => {
    await page.goto('/programs')

    await page.locator('#format').selectOption('in-person')
    // Wait for the first URL update before selecting the second filter, so
    // searchParams is current when updateFilters reads it for the second change.
    await expect(page).toHaveURL(/format=in-person/)

    await page.locator('#frequency').selectOption('weekly')
    await expect(page).toHaveURL(/freq=weekly/)
    await expect(page).toHaveURL(/format=in-person/)
  })

  test('help modal opens and closes with X button', async ({ page }) => {
    await page.goto('/programs')

    // Click the ? button next to Meeting Format
    await page.locator('label[for="format"] .filter-help-button-inline').click()

    const modal = page.locator('.modal-content')
    await expect(modal).toBeVisible()
    await expect(page.locator('.modal-title')).toHaveText('Meeting Format')

    await page.locator('.modal-close').click()
    await expect(modal).not.toBeVisible()
  })

  test('help modal closes when clicking outside overlay', async ({ page }) => {
    await page.goto('/programs')

    await page.locator('label[for="format"] .filter-help-button-inline').click()
    await expect(page.locator('.modal-content')).toBeVisible()

    // Click the overlay (outside the modal content)
    await page.locator('.modal-overlay').click({ position: { x: 10, y: 10 } })
    await expect(page.locator('.modal-content')).not.toBeVisible()
  })

  test('no results state shown with impossible search query', async ({ page }) => {
    // Use a non-search filter alongside the search term so activeFiltersCount > 0,
    // which is required for the "Clear Filters" button to render in the empty state.
    await page.goto('/programs?format=online&search=zzz_no_match_xyz_impossible_q')

    await expect(page.locator('.empty-state h3')).toHaveText('No programs found')
    await expect(page.locator('.empty-state .btn-primary')).toHaveText('Clear Filters')
  })

  test('Clear Filters button in empty state resets filters', async ({ page }) => {
    await page.goto('/programs?format=online&search=zzz_no_match_xyz_impossible_q')

    await page.locator('.empty-state .btn-primary').click()

    await expect(page).not.toHaveURL(/search=/)
    await expect(page).not.toHaveURL(/format=/)
    await expect(page.locator('.programs-count')).toBeVisible()
  })
})
