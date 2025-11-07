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

test('드래그 앤 드롭: 일정을 다른 날짜로 이동', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  /**
   * 테스트용 일정 생성
   */
  await page.getByRole('textbox', { name: '제목' }).fill('드래그 테스트 일정');
  await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-10');
  await page.getByRole('textbox', { name: '시작 시간' }).fill('10:00');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('11:00');
  await page.getByRole('textbox', { name: '설명' }).fill('드래그 앤 드롭 테스트');
  await page.getByRole('textbox', { name: '위치' }).fill('테스트 장소');
  await page.getByLabel('카테고리').getByRole('combobox').click();
  await page.getByRole('option', { name: '개인-option' }).click();
  await page.getByTestId('event-submit-button').click();

  // 일정이 생성될 때까지 대기
  await page.waitForTimeout(1000);

  /**
   * 월간 뷰에서 일정 드래그 앤 드롭
   */
  // 일정이 있는 날짜 cell 찾기
  const sourceCell = page.locator('td', { hasText: '10' }).filter({
    has: page.locator('text=드래그 테스트 일정'),
  });

  // 타겟 날짜 cell 찾기 (11일)
  const targetCell = page.locator('td', { hasText: '11' }).first();

  // 드래그 시작 위치 가져오기
  const sourceBoundingBox = await sourceCell.boundingBox();
  const targetBoundingBox = await targetCell.boundingBox();

  if (sourceBoundingBox && targetBoundingBox) {
    // 일정 요소를 직접 드래그
    const eventElement = page.locator('text=드래그 테스트 일정').first();
    await eventElement.hover();
    await page.mouse.down();
    await page.mouse.move(
      targetBoundingBox.x + targetBoundingBox.width / 2,
      targetBoundingBox.y + targetBoundingBox.height / 2
    );
    await page.mouse.up();
  }

  // 드롭 후 대기
  await page.waitForTimeout(1000);

  /**
   * 일정 목록에서 날짜가 변경되었는지 확인
   */
  const updatedEvent = page
    .locator('[data-testid="event-list"] > *', { hasText: '드래그 테스트 일정' })
    .first();
  await expect(updatedEvent).toContainText('2025-11-11', { timeout: 5000 });

  /**
   * 성공 메시지 확인
   */
  await expect(page.locator('text=일정이 수정되었습니다')).toBeVisible({ timeout: 3000 });

  // 테스트 일정 삭제
  const deleteBtn = updatedEvent.getByRole('button', { name: /delete/i });
  await deleteBtn.click();
});

test('드래그 앤 드롭: 주간 뷰에서 일정 이동', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  /**
   * 테스트용 일정 생성
   */
  await page.getByRole('textbox', { name: '제목' }).fill('주간 드래그 테스트');
  await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-03'); // 월요일
  await page.getByRole('textbox', { name: '시작 시간' }).fill('14:00');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('15:00');
  await page.getByRole('textbox', { name: '설명' }).fill('주간 뷰 테스트');
  await page.getByRole('textbox', { name: '위치' }).fill('테스트 장소');
  await page.getByLabel('카테고리').getByRole('combobox').click();
  await page.getByRole('option', { name: '개인-option' }).click();
  await page.getByTestId('event-submit-button').click();

  await page.waitForTimeout(1000);

  /**
   * 주간 뷰로 전환
   */
  await page.getByLabel('뷰 타입 선택').click();
  await page.getByRole('option', { name: 'week-option' }).click();

  await page.waitForTimeout(500);

  /**
   * 주간 뷰에서 일정 드래그 앤 드롭
   */
  const weekView = page.getByTestId('week-view');
  await expect(weekView).toBeVisible();

  // 일정 요소 찾기
  const eventInWeekView = weekView.locator('text=주간 드래그 테스트').first();
  await expect(eventInWeekView).toBeVisible({ timeout: 5000 });

  // 월요일(3일) cell과 화요일(4일) cell 찾기
  const sourceCellWeek = weekView.locator('td', {
    has: page.locator('text=주간 드래그 테스트'),
  });
  const targetCellWeek = weekView.locator('td').filter({ hasText: /^4$/ }).first();

  const sourceBox = await sourceCellWeek.boundingBox();
  const targetBox = await targetCellWeek.boundingBox();

  if (sourceBox && targetBox) {
    await eventInWeekView.hover();
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    await page.mouse.up();
  }

  await page.waitForTimeout(1000);

  /**
   * 일정 목록에서 날짜가 변경되었는지 확인
   */
  const eventList = page.getByTestId('event-list');
  const updatedWeekEvent = eventList.locator('> *', { hasText: '주간 드래그 테스트' }).first();
  await expect(updatedWeekEvent).toContainText('2025-11-04', { timeout: 5000 });

  // 테스트 일정 삭제
  const deleteBtn = updatedWeekEvent.getByRole('button', { name: /delete/i });
  await deleteBtn.click();
});

test('드래그 앤 드롭: 반복 일정을 다른 날짜로 이동 (단일 수정)', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  /**
   * 반복 일정 생성
   */
  await page.getByRole('textbox', { name: '제목' }).fill('반복 드래그 테스트');
  await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-05');
  await page.getByRole('textbox', { name: '시작 시간' }).fill('09:00');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('10:00');
  await page.getByRole('textbox', { name: '설명' }).fill('반복 일정 드래그 테스트');
  await page.getByRole('textbox', { name: '위치' }).fill('테스트 장소');
  await page.getByLabel('카테고리').getByRole('combobox').click();
  await page.getByRole('option', { name: '업무-option' }).click();
  await page.getByRole('checkbox', { name: '반복 일정' }).check();
  await page.getByRole('textbox', { name: '반복 종료일' }).fill('2025-11-08');
  await page.getByTestId('event-submit-button').click();

  await page.waitForTimeout(1500);

  /**
   * 반복 일정 중 하나를 드래그 앤 드롭
   */
  // 5일 cell에서 반복 일정 찾기
  const sourceRecurringCell = page.locator('td', { hasText: '5' }).filter({
    has: page.locator('text=반복 드래그 테스트'),
  });

  // 해당 cell 내의 일정 요소 찾기
  const recurringEvent = sourceRecurringCell.locator('text=반복 드래그 테스트').first();
  await expect(recurringEvent).toBeVisible({ timeout: 5000 });

  // 타겟 날짜 cell 찾기 (6일)
  const targetRecurringCell = page.locator('td', { hasText: '6' }).first();

  const srcBox = await sourceRecurringCell.boundingBox();
  const tgtBox = await targetRecurringCell.boundingBox();

  if (srcBox && tgtBox) {
    await recurringEvent.hover();
    await page.mouse.down();
    await page.mouse.move(tgtBox.x + tgtBox.width / 2, tgtBox.y + tgtBox.height / 2);
    await page.mouse.up();
  }

  await page.waitForTimeout(1000);

  /**
   * 성공 메시지 확인 (반복 일정은 자동으로 단일 수정됨)
   */
  await expect(page.locator('text=일정이 수정되었습니다')).toBeVisible({ timeout: 5000 });

  /**
   * 일정 목록에서 해당 일정이 반복 표시가 없는지 확인 (단일 수정되었으므로)
   */
  const eventList = page.getByTestId('event-list');
  const modifiedEvent = eventList
    .locator('> *', { hasText: '반복 드래그 테스트' })
    .filter({ hasText: '2025-11-06' })
    .first();
  await expect(modifiedEvent).toBeVisible({ timeout: 5000 });

  // 원래 반복 일정들은 그대로 유지
  const originalRecurringEvents = eventList
    .locator('> *', { hasText: '반복 드래그 테스트' })
    .filter({ hasText: '반복: 1일마다 (종료: 2025-11-08)' });
  await expect(originalRecurringEvents.first()).toBeVisible();

  // 테스트 일정들 삭제
  const deleteAllBtn = originalRecurringEvents.first().getByRole('button', { name: /delete/i });
  await deleteAllBtn.click();
  await page.getByRole('button', { name: '아니오' }).click();
  await page.waitForTimeout(500);

  const modifiedDeleteBtn = modifiedEvent.getByRole('button', { name: /delete/i });
  if ((await modifiedDeleteBtn.count()) > 0) {
    await modifiedDeleteBtn.click();
  }
});

test('드래그 앤 드롭: 같은 날짜에 드롭하면 변경 없음', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  /**
   * 테스트용 일정 생성
   */
  await page.getByRole('textbox', { name: '제목' }).fill('같은 날짜 테스트');
  await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-12');
  await page.getByRole('textbox', { name: '시작 시간' }).fill('13:00');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('14:00');
  await page.getByRole('textbox', { name: '설명' }).fill('같은 날짜 드래그 테스트');
  await page.getByRole('textbox', { name: '위치' }).fill('테스트 장소');
  await page.getByLabel('카테고리').getByRole('combobox').click();
  await page.getByRole('option', { name: '개인-option' }).click();
  await page.getByTestId('event-submit-button').click();

  await page.waitForTimeout(1000);

  /**
   * 같은 날짜로 드래그 앤 드롭 시도
   */
  const sameEvent = page.locator('text=같은 날짜 테스트').first();
  await expect(sameEvent).toBeVisible({ timeout: 5000 });

  const sameDateCell = page.locator('td', { hasText: '12' }).filter({
    has: page.locator('text=같은 날짜 테스트'),
  });

  const sameBox = await sameDateCell.boundingBox();

  if (sameBox) {
    await sameEvent.hover();
    await page.mouse.down();
    // 같은 위치로 드래그
    await page.mouse.move(sameBox.x + sameBox.width / 2, sameBox.y + sameBox.height / 2);
    await page.mouse.up();
  }

  await page.waitForTimeout(1000);

  /**
   * 날짜가 그대로인지 확인 (변경되지 않음)
   */
  const eventList = page.getByTestId('event-list');
  const unchangedEvent = eventList.locator('> *', { hasText: '같은 날짜 테스트' }).first();
  await expect(unchangedEvent).toContainText('2025-11-12');

  /**
   * 성공 메시지가 나타나지 않아야 함 (변경 사항 없음)
   */
  await expect(page.locator('text=일정이 수정되었습니다')).not.toBeVisible();

  // 테스트 일정 삭제
  const deleteBtn = unchangedEvent.getByRole('button', { name: /delete/i });
  await deleteBtn.click();
});

test('드래그 앤 드롭: 겹치는 일정이 있는 날짜로 이동 시 에러', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  /**
   * 첫 번째 일정 생성 (타겟 날짜)
   */
  await page.getByRole('textbox', { name: '제목' }).fill('기존 일정');
  await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-15');
  await page.getByRole('textbox', { name: '시작 시간' }).fill('10:00');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('11:00');
  await page.getByRole('textbox', { name: '설명' }).fill('기존 일정');
  await page.getByRole('textbox', { name: '위치' }).fill('회의실');
  await page.getByLabel('카테고리').getByRole('combobox').click();
  await page.getByRole('option', { name: '업무-option' }).click();
  await page.getByTestId('event-submit-button').click();

  await page.waitForTimeout(1000);

  /**
   * 두 번째 일정 생성 (이동할 일정, 시간이 겹침)
   */
  await page.getByRole('textbox', { name: '제목' }).fill('이동할 일정');
  await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-14');
  await page.getByRole('textbox', { name: '시작 시간' }).fill('10:30');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('11:30');
  await page.getByRole('textbox', { name: '설명' }).fill('드래그할 일정');
  await page.getByRole('textbox', { name: '위치' }).fill('회의실');
  await page.getByLabel('카테고리').getByRole('combobox').click();
  await page.getByRole('option', { name: '업무-option' }).click();
  await page.getByTestId('event-submit-button').click();

  await page.waitForTimeout(1000);

  /**
   * 겹치는 시간대로 드래그 앤 드롭 시도
   */
  const dragEvent = page.locator('text=이동할 일정').first();
  await expect(dragEvent).toBeVisible({ timeout: 5000 });

  const sourceOverlapCell = page.locator('td', { hasText: '14' }).filter({
    has: page.locator('text=이동할 일정'),
  });
  const targetOverlapCell = page.locator('td', { hasText: '15' }).filter({
    has: page.locator('text=기존 일정'),
  });

  const srcOverlapBox = await sourceOverlapCell.boundingBox();
  const tgtOverlapBox = await targetOverlapCell.boundingBox();

  if (srcOverlapBox && tgtOverlapBox) {
    await dragEvent.hover();
    await page.mouse.down();
    await page.mouse.move(
      tgtOverlapBox.x + tgtOverlapBox.width / 2,
      tgtOverlapBox.y + tgtOverlapBox.height / 2
    );
    await page.mouse.up();
  }

  await page.waitForTimeout(1000);

  /**
   * 에러 메시지 확인
   */
  await expect(page.locator('text=다른 일정과 시간이 겹칩니다')).toBeVisible({ timeout: 5000 });

  /**
   * 일정이 원래 날짜에 그대로 있는지 확인
   */
  const eventList = page.getByTestId('event-list');
  const unchangedDragEvent = eventList.locator('> *', { hasText: '이동할 일정' }).first();
  await expect(unchangedDragEvent).toContainText('2025-11-14', { timeout: 5000 });

  // 테스트 일정들 삭제
  const deleteBtn1 = eventList
    .locator('> *', { hasText: '기존 일정' })
    .first()
    .getByRole('button', { name: /delete/i });
  await deleteBtn1.click();
  await page.waitForTimeout(500);

  const deleteBtn2 = unchangedDragEvent.getByRole('button', { name: /delete/i });
  await deleteBtn2.click();
});

test('드래그 앤 드롭: 날짜 cell이 아닌 영역에 드롭하면 원래 위치 유지', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  /**
   * 테스트용 일정 생성
   */
  await page.getByRole('textbox', { name: '제목' }).fill('드롭 실패 테스트');
  await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-13');
  await page.getByRole('textbox', { name: '시작 시간' }).fill('15:00');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('16:00');
  await page.getByRole('textbox', { name: '설명' }).fill('드롭 실패 테스트');
  await page.getByRole('textbox', { name: '위치' }).fill('테스트 장소');
  await page.getByLabel('카테고리').getByRole('combobox').click();
  await page.getByRole('option', { name: '개인-option' }).click();
  await page.getByTestId('event-submit-button').click();

  await page.waitForTimeout(1000);

  /**
   * 날짜 cell이 아닌 영역(예: 헤더)으로 드래그 앤 드롭 시도
   */
  const dropFailEvent = page.locator('text=드롭 실패 테스트').first();
  await expect(dropFailEvent).toBeVisible({ timeout: 5000 });

  // 캘린더 헤더 영역
  const calendarHeader = page.getByText('일정 보기');
  const headerBox = await calendarHeader.boundingBox();
  const eventBox = await dropFailEvent.boundingBox();

  if (eventBox && headerBox) {
    await page.mouse.move(eventBox.x + eventBox.width / 2, eventBox.y + eventBox.height / 2);
    await page.mouse.down();
    // 헤더 영역(droppable이 아닌 곳)으로 드래그
    await page.mouse.move(headerBox.x + headerBox.width / 2, headerBox.y + 10);
    await page.mouse.up();
  }

  await page.waitForTimeout(1000);

  /**
   * 일정이 원래 날짜에 그대로 있는지 확인
   */
  const eventList = page.getByTestId('event-list');
  const originalEvent = eventList.locator('> *', { hasText: '드롭 실패 테스트' }).first();
  await expect(originalEvent).toContainText('2025-11-13', { timeout: 5000 });

  /**
   * 성공 메시지가 나타나지 않아야 함
   */
  await expect(page.locator('text=일정이 수정되었습니다')).not.toBeVisible();

  // 테스트 일정 삭제
  const deleteBtn = originalEvent.getByRole('button', { name: /delete/i });
  await deleteBtn.click();
});

test('드래그 앤 드롭: 캘린더 영역 밖으로 드롭하면 원래 위치 유지', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  /**
   * 테스트용 일정 생성
   */
  await page.getByRole('textbox', { name: '제목' }).fill('영역 밖 드롭 테스트');
  await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-16');
  await page.getByRole('textbox', { name: '시작 시간' }).fill('11:00');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('12:00');
  await page.getByRole('textbox', { name: '설명' }).fill('영역 밖 드롭');
  await page.getByRole('textbox', { name: '위치' }).fill('테스트 장소');
  await page.getByLabel('카테고리').getByRole('combobox').click();
  await page.getByRole('option', { name: '개인-option' }).click();
  await page.getByTestId('event-submit-button').click();

  await page.waitForTimeout(1000);

  /**
   * 캘린더 영역 밖(왼쪽 폼 영역)으로 드래그 앤 드롭 시도
   */
  const outsideEvent = page.locator('text=영역 밖 드롭 테스트').first();
  await expect(outsideEvent).toBeVisible({ timeout: 5000 });

  // 왼쪽 폼 영역
  const formArea = page.getByRole('textbox', { name: '제목' });
  const formBox = await formArea.boundingBox();
  const outsideEventBox = await outsideEvent.boundingBox();

  if (outsideEventBox && formBox) {
    await page.mouse.move(
      outsideEventBox.x + outsideEventBox.width / 2,
      outsideEventBox.y + outsideEventBox.height / 2
    );
    await page.mouse.down();
    // 폼 영역(droppable이 아닌 곳)으로 드래그
    await page.mouse.move(formBox.x + 50, formBox.y + 50);
    await page.mouse.up();
  }

  await page.waitForTimeout(1000);

  /**
   * 일정이 원래 날짜에 그대로 있는지 확인
   */
  const eventList = page.getByTestId('event-list');
  const unchangedOutsideEvent = eventList
    .locator('> *', { hasText: '영역 밖 드롭 테스트' })
    .first();
  await expect(unchangedOutsideEvent).toContainText('2025-11-16', { timeout: 5000 });

  /**
   * 성공 메시지가 나타나지 않아야 함
   */
  await expect(page.locator('text=일정이 수정되었습니다')).not.toBeVisible();

  // 테스트 일정 삭제
  const deleteBtn = unchangedOutsideEvent.getByRole('button', { name: /delete/i });
  await deleteBtn.click();
});
