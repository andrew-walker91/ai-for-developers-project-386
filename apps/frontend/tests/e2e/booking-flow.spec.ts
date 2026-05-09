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

      // 2. Click "Записаться" -> go to event types
      await page.getByRole('link', { name: 'Записаться', exact: true }).first().click();
      await expect(page).toHaveURL('/event-types');

      // 3. Select the meeting type
      const eventCard = page.locator('.mantine-Card-root').filter({ hasText: eventName! });
      await eventCard.getByRole('button', { name: 'Выбрать время' }).click();

      // 4. Wait for slots page
      await expect(page).toHaveURL(/\/event-types\/.+\/slots/);

      // 5. Select date (first available)
      await page.waitForSelector('.mantine-DatePicker-root', { state: 'visible', timeout: 15000 });
      await page.locator('.mantine-DatePicker-root button:not([disabled])').first().click();

      // 6. Wait for slots to load and select first available
      await page.waitForTimeout(3000);
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
});
