import { test, expect } from '@playwright/test'

test.describe('E2E Application Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('should login and navigate to dashboard', async ({ page }) => {
    // Fill login form
    await page.fill('input[placeholder="Username"]', 'admin')
    await page.fill('input[placeholder="Password"]', 'password')
    
    // Submit form
    await page.click('button:has-text("Sign in")')
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard')
    
    // Verify dashboard loaded
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should apply patch in pull request detail', async ({ page }) => {
    // Login first
    await page.fill('input[placeholder="Username"]', 'admin')
    await page.fill('input[placeholder="Password"]', 'password')
    await page.click('button:has-text("Sign in")')
    await page.waitForURL('**/dashboard')
    
    // Navigate to a pull request (assuming PR with id 1 exists)
    await page.goto('http://localhost:3000/pullrequests/1')
    
    // Wait for PR detail page to load
    await expect(page.locator('h1')).toContainText('#')
    
    // Click apply patch button if available
    const applyButton = page.locator('button:has-text("Apply Patch")').first()
    if (await applyButton.isVisible()) {
      await applyButton.click()
      
      // Verify success message appears
      await expect(page.locator('text=Patch applied successfully')).toBeVisible()
    }
  })

  test('should create new repository', async ({ page }) => {
    // Login
    await page.fill('input[placeholder="Username"]', 'admin')
    await page.fill('input[placeholder="Password"]', 'password')
    await page.click('button:has-text("Sign in")')
    await page.waitForURL('**/dashboard')
    
    // Navigate to new repo page
    await page.click('text=Register New Repository')
    await page.waitForURL('**/repos/new')
    
    // Fill form
    await page.fill('input[placeholder="owner/repository"]', 'test/repo')
    await page.fill('input[placeholder="https://github.com/owner/repository.git"]', 'https://github.com/test/repo.git')
    
    // Submit
    await page.click('button:has-text("Register Repository")')
    
    // Should redirect back to dashboard
    await page.waitForURL('**/dashboard')
  })
})
