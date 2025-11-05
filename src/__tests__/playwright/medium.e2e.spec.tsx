import { test, expect } from '@playwright/test';

test('일정 CRUD 및 기본 기능', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  const eventList = page.getByTestId('event-list').locator('> *');
  const count = await eventList.count();

  /**
   * CREATE
   */
  await page.getByRole('textbox', { name: '제목' }).click();
  await page.getByRole('textbox', { name: '제목' }).fill('새 회의');
  await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-05');
  await page.getByRole('textbox', { name: '시작 시간' }).fill('14:00');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('15:00');
  await page.getByRole('textbox', { name: '설명' }).fill('프로젝트 진행 상황 논의');
  await page.getByRole('textbox', { name: '위치' }).fill('회의실 A');
  await page.getByLabel('카테고리').getByRole('combobox').click();
  await page.getByRole('option', { name: '업무-option' }).click();
  await page.getByTestId('event-submit-button').click();

  /**
   * READ
   */
  // 달력에서 확인
  // 검색에서 확인
  const addedEventList = page.getByTestId('event-list').locator('> *');
  // await expect(addedEventList).toHaveCount(count + 1, { timeout: 10000 });

  await expect(addedEventList.nth(count).getByText('새 회의')).toBeVisible({ timeout: 30000 });
  await expect(addedEventList.nth(count).getByText('2025-11-05')).toBeVisible();
  await expect(addedEventList.nth(count).getByText('14:00 - 15:00')).toBeVisible();
  await expect(addedEventList.nth(count).getByText('프로젝트 진행 상황 논의')).toBeVisible();
  await expect(addedEventList.nth(count).getByText('회의실 A')).toBeVisible();
  await expect(addedEventList.nth(count).getByText('카테고리: 업무')).toBeVisible();

  /**
   * UPDATE
   */
  const addedCard = addedEventList.nth(count);
  const editBtn = addedCard.getByRole('button', { name: /edit/i });

  await expect(editBtn).toBeVisible({ timeout: 5000 });
  await editBtn.scrollIntoViewIfNeeded();
  await editBtn.click();

  await page.getByRole('textbox', { name: '제목' }).clear();
  await page.getByRole('textbox', { name: '제목' }).fill('수정된 회의');
  await page.getByTestId('event-submit-button').click();

  await expect(addedCard.getByText('수정된 회의')).toBeVisible({ timeout: 5000 });

  /**
   * DELETE
   */
  const deleteBtn = addedCard.getByRole('button', { name: /delete/i });
  await expect(deleteBtn).toBeVisible({ timeout: 5000 });
  await deleteBtn.scrollIntoViewIfNeeded();
  await deleteBtn.click();

  await expect(addedCard).not.toBeVisible({ timeout: 5000 });
});

test('반복 일정 CRUD 및 기본 기능', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  const eventList = page.getByTestId('event-list').locator('> *');
  const count = await eventList.count();

  /**
   * CREATE
   */
  await page.getByRole('textbox', { name: '제목' }).click();
  await page.getByRole('textbox', { name: '제목' }).fill('새 회의');
  await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-05');
  await page.getByRole('textbox', { name: '시작 시간' }).fill('14:00');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('15:00');
  await page.getByRole('textbox', { name: '설명' }).fill('프로젝트 진행 상황 논의');
  await page.getByRole('textbox', { name: '위치' }).fill('회의실 A');
  await page.getByLabel('카테고리').getByRole('combobox').click();
  await page.getByRole('option', { name: '업무-option' }).click();
  await page.getByRole('checkbox', { name: '반복 일정' }).check();
  await page.getByRole('textbox', { name: '반복 종료일' }).fill('2025-11-08');
  await page.getByTestId('event-submit-button').click();

  /**
   * READ
   */
  // 달력에서 확인
  // 검색에서 확인
  const addedEventList = page.locator('div').filter({ hasText: '새 회의2025-11-0514:00 - 15:00' });
  await expect(addedEventList.nth(4)).toBeVisible();

  /**
   * UPDATE
   */
  // 전체
  // 단일
  const targetCard = page.locator('[data-testid="event-list"] > *', { hasText: '새 회의' }).nth(2);
  await targetCard.getByRole('button', { name: 'Edit event' }).click();
  await page.getByRole('button', { name: '예' }).click();

  await expect(page.getByRole('textbox', { name: '제목' })).toHaveValue('새 회의');
  await expect(page.getByRole('textbox', { name: '날짜' })).toHaveValue('2025-11-07');
  await page.getByTestId('event-submit-button').click();

  await expect(targetCard).not.toContainText('반복: 1일마다 (종료: 2025-11-08)');

  /**
   * DELETE
   */
  // 전체
  // 단일
});
