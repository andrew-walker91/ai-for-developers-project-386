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

      // 5. Select a date with available slots
      await page.locator('table').first().waitFor({ state: 'visible', timeout: 15000 });
      const dateButtons = page.locator('table button:not([disabled])');
      const dateCount = await dateButtons.count();

      for (let d = 0; d < dateCount; d++) {
        await dateButtons.nth(d).click();
        await page.waitForTimeout(2000);

        const noSlots = page.getByText('Нет свободных слотов на эту дату');
        if (!(await noSlots.isVisible().catch(() => false))) break;
      }

      // 6. Select first available slot
      await page.locator('button:not([disabled]):has-text(":")').first().click();

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
