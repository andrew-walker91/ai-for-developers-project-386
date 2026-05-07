import { test, expect } from '@playwright/test';

const TEST_GUEST_NAME = 'Тестовый Пользователь';
const TEST_GUEST_EMAIL = 'test@example.com';

test.describe('Booking Flow', () => {
  test('should complete full booking flow for each meeting type', async ({ page }) => {
    // 1. Visit landing page
    await page.goto('/');
    await expect(page.getByText('Запишитесь на встречу')).toBeVisible();

    // Get all meeting type cards from landing page
    const cards = page.locator('.mantine-SimpleGrid-root .mantine-Card-root');
    const cardCount = await cards.count();
    
    // Iterate through each meeting type
    for (let i = 0; i < cardCount; i++) {
      // Reload page for each iteration to start fresh
      await page.goto('/');
      
      const card = cards.nth(i);
      const eventName = await card.locator('.mantine-Text-root').first().textContent();
      const duration = await card.locator('.mantine-Badge-root').textContent();
      
      // 2. Click "Записаться" -> go to event types
      await page.getByRole('link', { name: 'Записаться' }).click();
      await expect(page).toHaveURL('/event-types');
      
      // 3. Select the meeting type
      const eventCard = page.locator('.mantine-Card-root').filter({ hasText: eventName! });
      await eventCard.getByRole('button', { name: 'Выбрать время' }).click();
      
      // 4. Wait for slots page
      await expect(page).toHaveURL(/\/event-types\/.+\/slots/);
      
      // 5. Select date (first available)
      await page.locator('.mantine-DatePicker-root button:not([disabled])').first().click();
      
      // 6. Wait for slots to load and select first available
      await page.waitForTimeout(1000);
      const slotButton = page.locator('button:has-text(":")').first();
      await slotButton.click();
      
      // 7. Fill booking form
      await page.getByLabel('Имя и фамилия').fill(TEST_GUEST_NAME);
      await page.getByLabel('Email').fill(TEST_GUEST_EMAIL);
      
      // 8. Submit booking
      await page.getByRole('button', { name: 'Подтвердить запись' }).click();
      
      // 9. Verify success notification
      await expect(page.getByText('Встреча забронирована!')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/');
    
    // Go to event types page - use first button in hero section
    await page.locator('.mantine-Paper-root a[href="/event-types"]').first().click();
    await expect(page).toHaveURL('/event-types');
    
    // Click first event type
    await page.locator('.mantine-Card-root').first().getByRole('button', { name: 'Выбрать время' }).click();
    
    // Wait for slots page and select date
    await page.waitForSelector('.mantine-DatePicker-root');
    await page.locator('.mantine-DatePicker-root button:not([disabled])').first().click();
    
    // Wait for slots and select first
    await page.waitForTimeout(1000);
    const slotButton = page.locator('button:has-text(":")').first();
    await slotButton.click();
    
    // Submit empty form
    await page.getByRole('button', { name: 'Подтвердить запись' }).click();
    
    // Verify validation errors are shown
    await expect(page.getByText('Укажите имя и фамилию')).toBeVisible();
    await expect(page.getByText('Укажите email')).toBeVisible();
  });
});