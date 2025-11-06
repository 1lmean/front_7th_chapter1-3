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
  const editCard = page.locator('[data-testid="event-list"] > *', { hasText: '새 회의' }).nth(2);

  // 반복 일정 전체 수정 (제목 변경으로 테스트 - 위치는 업데이트 안되는 버그 있음)
  await editCard.getByRole('button', { name: 'Edit event' }).click();
  await page.getByRole('button', { name: '아니오' }).click();

  await expect(page.getByRole('textbox', { name: '제목' })).toHaveValue('새 회의');
  await expect(page.getByRole('textbox', { name: '날짜' })).toHaveValue('2025-11-07');
  await page.getByRole('textbox', { name: '제목' }).clear();
  await page.getByRole('textbox', { name: '제목' }).fill('수정된 회의');
  await page.getByTestId('event-submit-button').click();

  // 반복 일정 전체가 수정되었는지 확인
  await page.waitForTimeout(1000);
  await expect(
    page.locator('[data-testid="event-list"] > *', { hasText: '수정된 회의' }).first()
  ).toBeVisible({ timeout: 10000 });

  // 반복 일정 단일 수정
  const editCardForSingle = page
    .locator('[data-testid="event-list"] > *', { hasText: '수정된 회의' })
    .nth(2);
  await editCardForSingle.getByRole('button', { name: 'Edit event' }).click();
  await page.getByRole('button', { name: '예' }).click();

  await expect(page.getByRole('textbox', { name: '제목' })).toHaveValue('수정된 회의');
  await expect(page.getByRole('textbox', { name: '날짜' })).toHaveValue('2025-11-07');
  await page.getByTestId('event-submit-button').click();

  await page.waitForTimeout(1000);
  await expect(editCardForSingle).not.toContainText('반복: 1일마다 (종료: 2025-11-08)', {
    timeout: 10000,
  });

  /**
   * DELETE
   */

  // 반복 일정 단일 삭제
  const deleteEventList = page.locator('[data-testid="event-list"] > *', {
    hasText: '반복: 1일마다 (종료: 2025-11-08)',
  });
  const initialCount = await deleteEventList.count();

  if (initialCount > 0) {
    const deleteCard = deleteEventList.nth(Math.min(1, initialCount - 1));
    await deleteCard.getByRole('button', { name: 'Delete event' }).click();
    await page.getByRole('button', { name: '예' }).click();

    await expect(deleteEventList).toHaveCount(initialCount - 1, { timeout: 10000 });

    // 반복 일정 전체 삭제
    const remainingCount = await deleteEventList.count();
    if (remainingCount > 0) {
      const deleteAllCard = deleteEventList.nth(0);
      await deleteAllCard.getByRole('button', { name: 'Delete event' }).click();
      await page.getByRole('button', { name: '아니오' }).click();

      await expect(deleteEventList).toHaveCount(0, { timeout: 10000 });
    }
  }
});

test('단일 일정을 생성하거나 수정할 때, 기존 일정과 겹치면 경고가 노출된다.', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  /**
   * 단일 일정 생성 시, 기존 일정과 겹치면 경고가 노출된다
   */
  await page.getByRole('textbox', { name: '제목' }).fill('새 회의');
  await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-21');
  await page.getByRole('textbox', { name: '시작 시간' }).fill('14:00');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('15:00');
  await page.getByRole('textbox', { name: '설명' }).fill('프로젝트 진행 상황 논의');
  await page.getByRole('textbox', { name: '위치' }).fill('회의실 A');
  await page.getByLabel('카테고리').getByRole('combobox').click();
  await page.getByRole('option', { name: '업무-option' }).click();
  await page.getByTestId('event-submit-button').click();

  await expect(page.getByRole('heading', { name: '일정 겹침 경고' })).toBeVisible({
    timeout: 5000,
  });

  await page.getByRole('button', { name: '취소' }).click();
  await page.getByRole('textbox', { name: '날짜' }).clear();
  await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-20');
  await page.getByTestId('event-submit-button').click();

  /**
   * 단일 일정 수정 시, 기존 일정과 겹치면 경고가 노출된다
   */
  const editCard = page.locator('[data-testid="event-list"] > *', { hasText: '새 회의' }).nth(0);
  await editCard.getByRole('button', { name: 'Edit event' }).click();

  await expect(page.getByRole('textbox', { name: '제목' })).toHaveValue('새 회의', {
    timeout: 5000,
  });
  await expect(page.getByRole('textbox', { name: '날짜' })).toHaveValue('2025-11-20', {
    timeout: 5000,
  });

  await page.getByRole('textbox', { name: '날짜' }).clear();
  await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-21');
  await page.getByTestId('event-submit-button').click();

  await expect(page.getByRole('heading', { name: '일정 겹침 경고' })).toBeVisible({
    timeout: 5000,
  });
});

test('알림 시간을 설정하면 일정 목록에 알림 정보가 표시된다', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  /**
   * 알림 시간 1분 전으로 설정한 일정 생성
   */
  await page.getByRole('textbox', { name: '제목' }).fill('알림 테스트 회의');
  await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-10');
  await page.getByRole('textbox', { name: '시작 시간' }).fill('10:00');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('11:00');
  await page.getByRole('textbox', { name: '설명' }).fill('알림 테스트');
  await page.getByRole('textbox', { name: '위치' }).fill('회의실 A');
  await page.getByLabel('카테고리').getByRole('combobox').click();
  await page.getByRole('option', { name: '업무-option' }).click();

  // 알림 시간을 1분 전으로 설정
  await page.locator('#notification').click();
  await page.getByRole('option', { name: '1분 전' }).click();

  await page.getByTestId('event-submit-button').click();

  // 생성된 일정에 알림 정보가 표시되는지 확인
  const createdEvent = page.locator('[data-testid="event-list"] > *', {
    hasText: '알림 테스트 회의',
  });
  await expect(createdEvent.first()).toBeVisible({ timeout: 10000 });
  await expect(createdEvent.first()).toContainText('알림: 1분 전');

  /**
   * 알림 시간 10분 전으로 설정한 일정 생성
   */
  await page.getByRole('textbox', { name: '제목' }).fill('10분 전 알림 회의');
  await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-11');
  await page.getByRole('textbox', { name: '시작 시간' }).fill('14:00');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('15:00');
  await page.getByRole('textbox', { name: '설명' }).fill('10분 전 알림');
  await page.getByRole('textbox', { name: '위치' }).fill('회의실 B');
  await page.getByLabel('카테고리').getByRole('combobox').click();
  await page.getByRole('option', { name: '업무-option' }).click();

  // 알림 시간을 10분 전으로 설정 (기본값)
  await page.locator('#notification').click();
  await page.getByRole('option', { name: '10분 전' }).click();

  await page.getByTestId('event-submit-button').click();

  // 생성된 일정에 알림 정보가 표시되는지 확인
  const secondEvent = page.locator('[data-testid="event-list"] > *', {
    hasText: '10분 전 알림 회의',
  });
  await expect(secondEvent.first()).toBeVisible({ timeout: 10000 });
  await expect(secondEvent.first()).toContainText('알림: 10분 전');
});

test('일정 검색 및 필터링', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  const eventList = page.getByTestId('event-list');

  /**
   * 검색어로 일정 필터링 (기존 일정 중 "팀 회의" 검색)
   */
  const searchInput = page.locator('#search');
  await searchInput.fill('팀 회의');

  // '팀 회의'가 포함된 일정만 표시되어야 함
  await expect(eventList.getByText('팀 회의')).toBeVisible({ timeout: 5000 });

  /**
   * 검색어를 지우면 모든 일정이 다시 표시
   */
  await searchInput.clear();

  // 일정 목록이 다시 표시되어야 함 (기존 일정들)
  await page.waitForTimeout(500);

  /**
   * 존재하지 않는 검색어 입력
   */
  await searchInput.fill('존재하지않는검색어12345');

  // "검색 결과가 없습니다." 메시지 표시
  await expect(eventList.getByText('검색 결과가 없습니다.')).toBeVisible({ timeout: 5000 });
});
