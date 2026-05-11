import { test, expect } from '@playwright/test';

const TEST_GUEST_NAME = 'Тестовый Пользователь';
const TEST_GUEST_EMAIL = 'test@example.com';

test.describe('Booking Flow', () => {
  test('should complete full booking flow for each meeting type', async ({ page }) => {
    // 1. Открыть лендинг
    await page.goto('/');
    await expect(page.getByText('Запишитесь на встречу')).toBeVisible();

    // Получить все карточки типов встреч
    const cards = page.locator('.mantine-SimpleGrid-root .mantine-Card-root');
    const cardCount = await cards.count();

    // Пройти по каждому типу встречи
    for (let i = 0; i < cardCount; i++) {
      // Перезагрузить страницу для чистой итерации
      await page.goto('/');

      const card = cards.nth(i);
      const eventName = await card.locator('.mantine-Text-root').first().textContent();

      // 2. Клик "Записаться" → переход к event-types
      await page.getByRole('link', { name: 'Записаться', exact: true }).first().click();
      await expect(page).toHaveURL('/event-types');

      // 3. Выбрать тип встречи
      const eventCard = page.locator('.mantine-Card-root').filter({ hasText: eventName! });
      await eventCard.getByRole('button', { name: 'Выбрать время' }).click();

      // 4. Дождаться страницы слотов
      await expect(page).toHaveURL(/\/event-types\/.+\/slots/);

      // 5. Выбрать дату со свободными слотами
      await page.locator('table').first().waitFor({ state: 'visible', timeout: 15000 });
      const dateButtons = page.locator('table button:not([disabled])');
      const dateCount = await dateButtons.count();

      for (let d = 0; d < dateCount; d++) {
        await dateButtons.nth(d).click();
        await page.waitForTimeout(2000);

        const noSlots = page.getByText('Нет свободных слотов на эту дату');
        if (!(await noSlots.isVisible().catch(() => false))) break;
      }

      // 6. Выбрать первый свободный слот
      await page.locator('button:not([disabled]):has-text(":")').first().click();

      // 7. Заполнить форму бронирования
      await page.getByLabel('Имя и фамилия').fill(TEST_GUEST_NAME);
      await page.getByLabel('Email').fill(TEST_GUEST_EMAIL);

      // 8. Отправить бронирование
      await page.getByRole('button', { name: 'Подтвердить запись' }).click();

      // 9. Проверить уведомление об успехе
      await expect(page.getByText('Встреча забронирована!')).toBeVisible({ timeout: 10000 });
    }
  });
});
