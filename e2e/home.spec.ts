import { mkdir } from 'node:fs/promises'
import { test, expect } from '@playwright/test'

test('renders the Home reference viewport', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear())
  await page.goto('/')
  await expect(page).toHaveTitle('Home — Nerve')
  await expect(page.getByRole('heading', { name: /Good (morning|afternoon|evening), Yuunyk/ })).toBeVisible()

  await mkdir('design/comparisons', { recursive: true })
  await page.screenshot({
    path: 'design/comparisons/home-actual.png',
    fullPage: false,
  })
})

test('completes the local-first goal, project, focus, timeline, and world flow', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear())
  await page.goto('/')

  await page.getByRole('button', { name: 'New goal' }).click()
  await page.getByRole('dialog').getByLabel('Name').fill('Ship the first slice')
  await page.getByRole('button', { name: 'Create goal' }).click()

  await page.getByRole('link', { name: 'Projects', exact: true }).click()
  await expect(page).toHaveTitle('Projects — Nerve')
  await page.getByRole('button', { name: 'New project' }).click()
  await page.getByRole('dialog').getByLabel('Name').fill('Nerve MVP')
  await page.getByRole('dialog').getByLabel(/Description/).fill('Functional local-first slice')
  await page.getByRole('dialog').getByRole('button', { name: 'Create project' }).click()

  const project = page.getByRole('listitem').filter({ hasText: 'Nerve MVP' })
  await project.getByRole('button', { name: 'Link goal' }).click()
  await page.getByRole('button', { name: 'Create relation' }).click()
  await expect(project).toContainText('Ship the first slice')

  await project.getByRole('button', { name: 'Start focus' }).click()
  await expect(project.getByRole('button', { name: 'End focus' })).toBeVisible()
  await project.getByRole('button', { name: 'End focus' }).click()

  await page.getByRole('link', { name: 'Timeline' }).click()
  await expect(page.getByRole('heading', { name: 'Unified event log' })).toBeVisible()
  await expect(page.getByText('Project connected to goal')).toBeVisible()
  await expect(page.getByText('Focus session stopped', { exact: false })).toBeVisible()

  await page.getByRole('link', { name: 'World' }).click()
  await expect(page.getByRole('heading', { name: 'The living system' })).toBeVisible()
  await expect(
    page.getByRole('listitem').filter({ hasText: 'Nerve MVP' }).filter({ hasText: 'Ship the first slice' }),
  ).toBeVisible()
})
