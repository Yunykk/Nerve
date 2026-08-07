import { mkdir } from 'node:fs/promises'
import { test, expect } from '@playwright/test'

test('renders the Home reference viewport', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Home — Nerve')
  await expect(page.getByRole('heading', { name: 'Good morning, Yuunyk' })).toBeVisible()

  await mkdir('design/comparisons', { recursive: true })
  await page.screenshot({
    path: 'design/comparisons/home-actual.png',
    fullPage: false,
  })
})
