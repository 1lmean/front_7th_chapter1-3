import { test, expect } from '@playwright/test';

test('일정 알림 시간이 되면 토스트바가 표시된다', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // 현재 시간으로부터 1분 후에 시작하는 일정 생성
  const now = new Date();
  const eventStartTime = new Date(now.getTime() + 60 * 1000); // 1분 후
  const eventDate = eventStartTime.toISOString().split('T')[0]; // YYYY-MM-DD
  const eventTime = eventStartTime.toTimeString().slice(0, 5); // HH:MM

  await page.getByRole('textbox', { name: '제목' }).fill('토스트바 테스트 회의');
  await page.getByRole('textbox', { name: '날짜' }).fill(eventDate);
  await page.getByRole('textbox', { name: '시작 시간' }).fill(eventTime);
  await page
    .getByRole('textbox', { name: '종료 시간' })
    .fill(new Date(eventStartTime.getTime() + 60 * 60 * 1000).toTimeString().slice(0, 5));
  await page.getByRole('textbox', { name: '설명' }).fill('토스트바 테스트');
  await page.getByRole('textbox', { name: '위치' }).fill('회의실 A');
  await page.getByLabel('카테고리').getByRole('combobox').click();
  await page.getByRole('option', { name: '업무-option' }).click();

  // 알림 시간을 1분 전으로 설정
  await page.locator('#notification').click();
  await page.getByRole('option', { name: '1분 전' }).click();

  await page.getByTestId('event-submit-button').click();

  // 일정이 생성될 때까지 대기
  await expect(
    page.locator('[data-testid="event-list"] > *', { hasText: '토스트바 테스트 회의' }).first()
  ).toBeVisible({ timeout: 10000 });

  // 토스트바(Alert)가 표시될 때까지 대기 (최대 3초, 1초마다 체크하므로)
  await expect(page.locator('text=/1분 후 토스트바 테스트 회의 일정이 시작됩니다/')).toBeVisible({
    timeout: 3000,
  });
});
