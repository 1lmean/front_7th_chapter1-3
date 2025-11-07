import { test, expect } from '@playwright/test';

test.describe('EventView 드래그 앤 드롭 기능', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    // 페이지 로딩 대기
    await page.waitForTimeout(1500);
  });

  test('월간 뷰에서 일정을 다른 날짜로 드래그 앤 드롭하여 날짜 변경', async ({ page }) => {
    /**
     * 테스트용 일정 생성
     */
    await page.getByRole('textbox', { name: '제목' }).fill('월간 뷰 DnD 테스트');
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-10');
    await page.getByRole('textbox', { name: '시작 시간' }).fill('10:00');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('11:00');
    await page.getByRole('textbox', { name: '설명' }).fill('드래그 앤 드롭으로 날짜 변경 테스트');
    await page.getByRole('textbox', { name: '위치' }).fill('테스트 장소');
    await page.getByLabel('카테고리').getByRole('combobox').click();
    await page.getByRole('option', { name: '개인-option' }).click();
    await page.getByTestId('event-submit-button').click();

    // 일정 목록에 추가될 때까지 대기
    const eventList = page
      .getByTestId('event-list')
      .locator('> *', { hasText: '월간 뷰 DnD 테스트' });
    console.log(eventList);
    await expect(eventList.first()).toBeVisible({
      timeout: 15000,
    });

    // 캘린더에 렌더링될 시간 추가 대기
    await page.waitForTimeout(2000);

    /**
     * 월간 뷰에서 일정 드래그 앤 드롭
     */
    const monthView = page.getByTestId('month-view');
    await expect(monthView).toBeVisible();

    // 캘린더에서 일정이 보일 때까지 대기
    await expect(monthView.locator('text=월간 뷰 DnD 테스트').first()).toBeVisible({
      timeout: 15000,
    });

    // 일정이 있는 날짜 cell 찾기 (10일)
    const sourceCell = monthView.locator('td').filter({
      has: page.locator('text=월간 뷰 DnD 테스트'),
    });
    await expect(sourceCell).toBeVisible({ timeout: 10000 });

    // 타겟 날짜 cell 찾기 (11일)
    const targetCell = monthView.locator('td').filter({ hasText: /^11$/ }).first();
    await expect(targetCell).toBeVisible();

    // 드래그 시작 위치와 타겟 위치 가져오기
    const sourceBoundingBox = await sourceCell.boundingBox();
    const targetBoundingBox = await targetCell.boundingBox();

    if (sourceBoundingBox && targetBoundingBox) {
      // 일정 요소를 직접 드래그
      const eventElement = monthView.locator('text=월간 뷰 DnD 테스트').first();
      await eventElement.hover();
      await page.mouse.down();
      await page.mouse.move(
        targetBoundingBox.x + targetBoundingBox.width / 2,
        targetBoundingBox.y + targetBoundingBox.height / 2
      );
      await page.mouse.up();
    }

    // 드롭 후 대기
    await page.waitForTimeout(2000);

    /**
     * 일정 목록에서 날짜가 변경되었는지 확인
     */
    const updatedEvent = eventList.locator('> *', { hasText: '월간 뷰 DnD 테스트' }).first();
    await expect(updatedEvent).toContainText('2025-11-11', { timeout: 10000 });

    /**
     * 성공 메시지 확인
     */
    await expect(page.locator('text=일정이 수정되었습니다')).toBeVisible({ timeout: 5000 });

    /**
     * 캘린더 뷰에서도 이동되었는지 확인
     */
    await page.waitForTimeout(1000);
    const targetCellAfterDrop = monthView.locator('td').filter({
      has: page.locator('text=월간 뷰 DnD 테스트'),
    });
    await expect(targetCellAfterDrop).toBeVisible({ timeout: 10000 });

    // 테스트 일정 삭제
    const deleteBtn = updatedEvent.getByRole('button', { name: /delete/i });
    await expect(deleteBtn).toBeVisible({ timeout: 5000 });
    await deleteBtn.click();
    await page.waitForTimeout(1000);
  });

  test('주간 뷰에서 일정을 다른 날짜로 드래그 앤 드롭하여 날짜 변경', async ({ page }) => {
    /**
     * 테스트용 일정 생성
     */
    await page.getByRole('textbox', { name: '제목' }).fill('주간 뷰 DnD 테스트');
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-03'); // 월요일
    await page.getByRole('textbox', { name: '시작 시간' }).fill('14:00');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('15:00');
    await page.getByRole('textbox', { name: '설명' }).fill('주간 뷰 DnD 테스트');
    await page.getByRole('textbox', { name: '위치' }).fill('테스트 장소');
    await page.getByLabel('카테고리').getByRole('combobox').click();
    await page.getByRole('option', { name: '개인-option' }).click();
    await page.getByTestId('event-submit-button').click();

    // 일정 목록에 추가될 때까지 대기
    const eventList = page.getByTestId('event-list');
    await expect(eventList.locator('> *', { hasText: '주간 뷰 DnD 테스트' }).first()).toBeVisible({
      timeout: 15000,
    });

    await page.waitForTimeout(2000);

    /**
     * 주간 뷰로 전환
     */
    // Dialog가 있다면 닫힐 때까지 대기
    await page.waitForTimeout(500);

    await page.getByLabel('뷰 타입 선택').click({ timeout: 10000 });
    await page.getByRole('option', { name: 'week-option' }).click();

    await page.waitForTimeout(1500);

    /**
     * 주간 뷰에서 일정 드래그 앤 드롭
     */
    const weekView = page.getByTestId('week-view');
    await expect(weekView).toBeVisible({ timeout: 10000 });

    // 일정 요소 찾기
    const eventInWeekView = weekView.locator('text=주간 뷰 DnD 테스트').first();
    await expect(eventInWeekView).toBeVisible({ timeout: 15000 });

    // 월요일(3일) cell과 화요일(4일) cell 찾기
    const sourceCellWeek = weekView.locator('td').filter({
      has: page.locator('text=주간 뷰 DnD 테스트'),
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

    await page.waitForTimeout(2000);

    /**
     * 일정 목록에서 날짜가 변경되었는지 확인
     */
    const updatedWeekEvent = eventList.locator('> *', { hasText: '주간 뷰 DnD 테스트' }).first();
    await expect(updatedWeekEvent).toContainText('2025-11-04', { timeout: 10000 });

    /**
     * 성공 메시지 확인
     */
    await expect(page.locator('text=일정이 수정되었습니다')).toBeVisible({ timeout: 5000 });

    /**
     * 주간 뷰 캘린더에서도 이동되었는지 확인
     */
    await page.waitForTimeout(1000);
    const targetCellAfterDrop = weekView.locator('td').filter({
      has: page.locator('text=주간 뷰 DnD 테스트'),
    });
    await expect(targetCellAfterDrop).toBeVisible({ timeout: 10000 });

    // 테스트 일정 삭제
    const deleteBtn = updatedWeekEvent.getByRole('button', { name: /delete/i });
    await expect(deleteBtn).toBeVisible({ timeout: 5000 });
    await deleteBtn.click();
    await page.waitForTimeout(1000);
  });

  test('반복 일정을 드래그 앤 드롭하면 단일 일정으로 분리되어 날짜 변경', async ({ page }) => {
    /**
     * 반복 일정 생성
     */
    await page.getByRole('textbox', { name: '제목' }).fill('반복 일정 DnD 테스트');
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

    // 일정 목록에 추가될 때까지 대기
    const eventList = page.getByTestId('event-list');
    await expect(eventList.locator('> *', { hasText: '반복 일정 DnD 테스트' }).first()).toBeVisible(
      { timeout: 15000 }
    );

    await page.waitForTimeout(2500);

    /**
     * 반복 일정 중 하나를 드래그 앤 드롭
     */
    const monthView = page.getByTestId('month-view');

    // 캘린더에서 일정이 보일 때까지 대기
    await expect(monthView.locator('text=반복 일정 DnD 테스트').first()).toBeVisible({
      timeout: 15000,
    });

    // 5일 cell에서 반복 일정 찾기
    const sourceRecurringCell = monthView
      .locator('td')
      .filter({ hasText: /^5$/ })
      .filter({
        has: page.locator('text=반복 일정 DnD 테스트'),
      });

    // 해당 cell 내의 일정 요소 찾기
    const recurringEvent = sourceRecurringCell.locator('text=반복 일정 DnD 테스트').first();
    await expect(recurringEvent).toBeVisible({ timeout: 15000 });

    // 타겟 날짜 cell 찾기 (9일)
    const targetRecurringCell = monthView.locator('td').filter({ hasText: /^9$/ }).first();

    const srcBox = await sourceRecurringCell.boundingBox();
    const tgtBox = await targetRecurringCell.boundingBox();

    if (srcBox && tgtBox) {
      await recurringEvent.hover();
      await page.mouse.down();
      await page.mouse.move(tgtBox.x + tgtBox.width / 2, tgtBox.y + tgtBox.height / 2);
      await page.mouse.up();
    }

    await page.waitForTimeout(2000);

    /**
     * 성공 메시지 확인
     */
    await expect(page.locator('text=일정이 수정되었습니다')).toBeVisible({ timeout: 5000 });

    /**
     * 일정 목록에서 해당 일정이 단일 일정으로 분리되었는지 확인
     */
    const modifiedEvent = eventList
      .locator('> *', { hasText: '반복 일정 DnD 테스트' })
      .filter({ hasText: '2025-11-09' })
      .first();
    await expect(modifiedEvent).toBeVisible({ timeout: 10000 });

    // 분리된 일정은 반복 표시가 없어야 함
    await expect(modifiedEvent).not.toContainText('반복: 1일마다');

    // 원래 반복 일정들은 그대로 유지
    const originalRecurringEvents = eventList
      .locator('> *', { hasText: '반복 일정 DnD 테스트' })
      .filter({ hasText: '반복: 1일마다 (종료: 2025-11-08)' });
    await expect(originalRecurringEvents.first()).toBeVisible({ timeout: 10000 });

    // 테스트 일정들 삭제
    await page.waitForTimeout(500);
    const deleteAllBtn = originalRecurringEvents.first().getByRole('button', { name: /delete/i });
    await expect(deleteAllBtn).toBeVisible({ timeout: 5000 });
    await deleteAllBtn.click();
    await page.waitForTimeout(500);

    const noButton = page.getByRole('button', { name: '아니오' });
    await expect(noButton).toBeVisible({ timeout: 5000 });
    await noButton.click(); // 전체 삭제
    await page.waitForTimeout(1000);

    const modifiedDeleteBtn = modifiedEvent.getByRole('button', { name: /delete/i });
    if ((await modifiedDeleteBtn.count()) > 0) {
      await modifiedDeleteBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('같은 날짜에 드롭하면 일정이 변경되지 않음', async ({ page }) => {
    /**
     * 테스트용 일정 생성
     */
    await page.getByRole('textbox', { name: '제목' }).fill('같은 날짜 DnD 테스트');
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-12');
    await page.getByRole('textbox', { name: '시작 시간' }).fill('13:00');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('14:00');
    await page.getByRole('textbox', { name: '설명' }).fill('같은 날짜 드래그 테스트');
    await page.getByRole('textbox', { name: '위치' }).fill('테스트 장소');
    await page.getByLabel('카테고리').getByRole('combobox').click();
    await page.getByRole('option', { name: '개인-option' }).click();
    await page.getByTestId('event-submit-button').click();

    // 일정 목록에 추가될 때까지 대기
    const eventList = page.getByTestId('event-list');
    await expect(eventList.locator('> *', { hasText: '같은 날짜 DnD 테스트' }).first()).toBeVisible(
      {
        timeout: 15000,
      }
    );

    await page.waitForTimeout(2000);

    /**
     * 같은 날짜로 드래그 앤 드롭 시도
     */
    const monthView = page.getByTestId('month-view');

    // 캘린더에서 일정이 보일 때까지 대기
    await expect(monthView.locator('text=같은 날짜 DnD 테스트').first()).toBeVisible({
      timeout: 15000,
    });

    const sameEvent = monthView.locator('text=같은 날짜 DnD 테스트').first();
    await expect(sameEvent).toBeVisible({ timeout: 10000 });

    const sameDateCell = monthView
      .locator('td')
      .filter({ hasText: /^12$/ })
      .filter({
        has: page.locator('text=같은 날짜 DnD 테스트'),
      });

    const sameBox = await sameDateCell.boundingBox();

    if (sameBox) {
      await sameEvent.hover();
      await page.mouse.down();
      // 같은 위치로 드래그
      await page.mouse.move(sameBox.x + sameBox.width / 2, sameBox.y + sameBox.height / 2);
      await page.mouse.up();
    }

    await page.waitForTimeout(1500);

    /**
     * 날짜가 그대로인지 확인
     */
    const unchangedEvent = eventList.locator('> *', { hasText: '같은 날짜 DnD 테스트' }).first();
    await expect(unchangedEvent).toContainText('2025-11-12');

    /**
     * 성공 메시지가 나타나지 않아야 함
     */
    await expect(page.locator('text=일정이 수정되었습니다')).not.toBeVisible();

    // 테스트 일정 삭제
    const deleteBtn = unchangedEvent.getByRole('button', { name: /delete/i });
    await expect(deleteBtn).toBeVisible({ timeout: 5000 });
    await deleteBtn.click();
    await page.waitForTimeout(500);
  });

  test('겹치는 시간의 일정이 있는 날짜로 드롭 시 에러 메시지 표시', async ({ page }) => {
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

    // 일정 목록에 추가될 때까지 대기
    const eventList = page.getByTestId('event-list');
    await expect(eventList.locator('> *', { hasText: '기존 일정' }).first()).toBeVisible({
      timeout: 15000,
    });

    await page.waitForTimeout(2000);

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

    // 일정 목록에 추가될 때까지 대기
    await expect(eventList.locator('> *', { hasText: '이동할 일정' }).first()).toBeVisible({
      timeout: 15000,
    });

    await page.waitForTimeout(2000);

    /**
     * 겹치는 시간대로 드래그 앤 드롭 시도
     */
    const monthView = page.getByTestId('month-view');

    // 캘린더에서 일정이 보일 때까지 대기
    await expect(monthView.locator('text=이동할 일정').first()).toBeVisible({ timeout: 15000 });

    const dragEvent = monthView.locator('text=이동할 일정').first();
    await expect(dragEvent).toBeVisible({ timeout: 10000 });

    const sourceOverlapCell = monthView
      .locator('td')
      .filter({ hasText: /^14$/ })
      .filter({
        has: page.locator('text=이동할 일정'),
      });
    const targetOverlapCell = monthView
      .locator('td')
      .filter({ hasText: /^15$/ })
      .filter({
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

    await page.waitForTimeout(2000);

    /**
     * 에러 메시지 확인
     */
    await expect(page.locator('text=다른 일정과 시간이 겹칩니다')).toBeVisible({
      timeout: 10000,
    });

    /**
     * 일정이 원래 날짜에 그대로 있는지 확인
     */
    const unchangedDragEvent = eventList.locator('> *', { hasText: '이동할 일정' }).first();
    await expect(unchangedDragEvent).toContainText('2025-11-14', { timeout: 10000 });

    // 테스트 일정들 삭제
    await page.waitForTimeout(500);
    const deleteBtn1 = eventList
      .locator('> *', { hasText: '기존 일정' })
      .first()
      .getByRole('button', { name: /delete/i });
    await expect(deleteBtn1).toBeVisible({ timeout: 5000 });
    await deleteBtn1.click();
    await page.waitForTimeout(1000);

    const deleteBtn2 = unchangedDragEvent.getByRole('button', { name: /delete/i });
    await expect(deleteBtn2).toBeVisible({ timeout: 5000 });
    await deleteBtn2.click();
    await page.waitForTimeout(500);
  });

  test('droppable 영역이 아닌 곳에 드롭하면 원래 위치 유지', async ({ page }) => {
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

    // 일정 목록에 추가될 때까지 대기
    const eventList = page.getByTestId('event-list');
    await expect(eventList.locator('> *', { hasText: '영역 밖 드롭 테스트' }).first()).toBeVisible({
      timeout: 15000,
    });

    await page.waitForTimeout(2000);

    /**
     * 날짜 cell이 아닌 영역(예: 헤더)으로 드래그 앤 드롭 시도
     */
    const monthView = page.getByTestId('month-view');

    // 캘린더에서 일정이 보일 때까지 대기
    await expect(monthView.locator('text=영역 밖 드롭 테스트').first()).toBeVisible({
      timeout: 15000,
    });

    const outsideEvent = monthView.locator('text=영역 밖 드롭 테스트').first();
    await expect(outsideEvent).toBeVisible({ timeout: 10000 });

    // 캘린더 헤더 영역
    const calendarHeader = page.getByText('일정 보기');
    const headerBox = await calendarHeader.boundingBox();
    const eventBox = await outsideEvent.boundingBox();

    if (eventBox && headerBox) {
      await page.mouse.move(eventBox.x + eventBox.width / 2, eventBox.y + eventBox.height / 2);
      await page.mouse.down();
      // 헤더 영역(droppable이 아닌 곳)으로 드래그
      await page.mouse.move(headerBox.x + headerBox.width / 2, headerBox.y + 10);
      await page.mouse.up();
    }

    await page.waitForTimeout(1500);

    /**
     * 일정이 원래 날짜에 그대로 있는지 확인
     */
    const originalEvent = eventList.locator('> *', { hasText: '영역 밖 드롭 테스트' }).first();
    await expect(originalEvent).toContainText('2025-11-16', { timeout: 10000 });

    /**
     * 성공 메시지가 나타나지 않아야 함
     */
    await expect(page.locator('text=일정이 수정되었습니다')).not.toBeVisible();

    // 테스트 일정 삭제
    const deleteBtn = originalEvent.getByRole('button', { name: /delete/i });
    await expect(deleteBtn).toBeVisible({ timeout: 5000 });
    await deleteBtn.click();
    await page.waitForTimeout(500);
  });

  test('캘린더 영역 밖(폼 영역)으로 드롭하면 원래 위치 유지', async ({ page }) => {
    /**
     * 테스트용 일정 생성
     */
    await page.getByRole('textbox', { name: '제목' }).fill('폼 영역 드롭 테스트');
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-17');
    await page.getByRole('textbox', { name: '시작 시간' }).fill('15:00');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('16:00');
    await page.getByRole('textbox', { name: '설명' }).fill('폼 영역 드롭');
    await page.getByRole('textbox', { name: '위치' }).fill('테스트 장소');
    await page.getByLabel('카테고리').getByRole('combobox').click();
    await page.getByRole('option', { name: '개인-option' }).click();
    await page.getByTestId('event-submit-button').click();

    // 일정 목록에 추가될 때까지 대기
    const eventList = page.getByTestId('event-list');
    await expect(eventList.locator('> *', { hasText: '폼 영역 드롭 테스트' }).first()).toBeVisible({
      timeout: 15000,
    });

    await page.waitForTimeout(2000);

    /**
     * 캘린더 영역 밖(왼쪽 폼 영역)으로 드래그 앤 드롭 시도
     */
    const monthView = page.getByTestId('month-view');

    // 캘린더에서 일정이 보일 때까지 대기
    await expect(monthView.locator('text=폼 영역 드롭 테스트').first()).toBeVisible({
      timeout: 15000,
    });

    const formEvent = monthView.locator('text=폼 영역 드롭 테스트').first();
    await expect(formEvent).toBeVisible({ timeout: 10000 });

    // 왼쪽 폼 영역
    const formArea = page.getByRole('textbox', { name: '제목' });
    const formBox = await formArea.boundingBox();
    const formEventBox = await formEvent.boundingBox();

    if (formEventBox && formBox) {
      await page.mouse.move(
        formEventBox.x + formEventBox.width / 2,
        formEventBox.y + formEventBox.height / 2
      );
      await page.mouse.down();
      // 폼 영역(droppable이 아닌 곳)으로 드래그
      await page.mouse.move(formBox.x + 50, formBox.y + 50);
      await page.mouse.up();
    }

    await page.waitForTimeout(1500);

    /**
     * 일정이 원래 날짜에 그대로 있는지 확인
     */
    const unchangedFormEvent = eventList.locator('> *', { hasText: '폼 영역 드롭 테스트' }).first();
    await expect(unchangedFormEvent).toContainText('2025-11-17', { timeout: 10000 });

    /**
     * 성공 메시지가 나타나지 않아야 함
     */
    await expect(page.locator('text=일정이 수정되었습니다')).not.toBeVisible();

    // 테스트 일정 삭제
    const deleteBtn = unchangedFormEvent.getByRole('button', { name: /delete/i });
    await expect(deleteBtn).toBeVisible({ timeout: 5000 });
    await deleteBtn.click();
    await page.waitForTimeout(500);
  });

  test('여러 일정이 있는 날짜 cell에서 특정 일정만 드래그하여 이동', async ({ page }) => {
    /**
     * 같은 날짜에 여러 일정 생성
     */
    // 첫 번째 일정
    await page.getByRole('textbox', { name: '제목' }).fill('첫 번째 일정');
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-18');
    await page.getByRole('textbox', { name: '시작 시간' }).fill('09:00');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('10:00');
    await page.getByRole('textbox', { name: '설명' }).fill('첫 번째');
    await page.getByRole('textbox', { name: '위치' }).fill('장소 A');
    await page.getByLabel('카테고리').getByRole('combobox').click();
    await page.getByRole('option', { name: '업무-option' }).click();
    await page.getByTestId('event-submit-button').click();

    // 일정 목록에 추가될 때까지 대기
    const eventList = page.getByTestId('event-list');
    await expect(eventList.locator('> *', { hasText: '첫 번째 일정' }).first()).toBeVisible({
      timeout: 15000,
    });

    await page.waitForTimeout(2000);

    // 두 번째 일정
    await page.getByRole('textbox', { name: '제목' }).fill('두 번째 일정');
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-18');
    await page.getByRole('textbox', { name: '시작 시간' }).fill('11:00');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('12:00');
    await page.getByRole('textbox', { name: '설명' }).fill('두 번째');
    await page.getByRole('textbox', { name: '위치' }).fill('장소 B');
    await page.getByLabel('카테고리').getByRole('combobox').click();
    await page.getByRole('option', { name: '개인-option' }).click();
    await page.getByTestId('event-submit-button').click();

    // 일정 목록에 추가될 때까지 대기
    await expect(eventList.locator('> *', { hasText: '두 번째 일정' }).first()).toBeVisible({
      timeout: 15000,
    });

    await page.waitForTimeout(2000);

    /**
     * 두 번째 일정만 드래그하여 다른 날짜로 이동
     */
    const monthView = page.getByTestId('month-view');

    // 캘린더에서 일정들이 보일 때까지 대기
    await expect(monthView.locator('text=두 번째 일정').first()).toBeVisible({
      timeout: 15000,
    });

    const secondEvent = monthView.locator('text=두 번째 일정').first();
    await expect(secondEvent).toBeVisible({ timeout: 10000 });

    const sourceMultiCell = monthView.locator('td').filter({ hasText: /^18$/ }).first();
    const targetMultiCell = monthView.locator('td').filter({ hasText: /^19$/ }).first();

    await expect(sourceMultiCell).toBeVisible({ timeout: 10000 });
    await expect(targetMultiCell).toBeVisible({ timeout: 10000 });

    const srcMultiBox = await sourceMultiCell.boundingBox();
    const tgtMultiBox = await targetMultiCell.boundingBox();

    if (srcMultiBox && tgtMultiBox) {
      await secondEvent.hover();
      await page.mouse.down();
      await page.mouse.move(
        tgtMultiBox.x + tgtMultiBox.width / 2,
        tgtMultiBox.y + tgtMultiBox.height / 2
      );
      await page.mouse.up();
    }

    await page.waitForTimeout(2000);

    /**
     * 두 번째 일정만 이동되고 첫 번째 일정은 그대로인지 확인
     */

    // 첫 번째 일정은 원래 날짜에 그대로
    const firstEvent = eventList.locator('> *', { hasText: '첫 번째 일정' }).first();
    await expect(firstEvent).toContainText('2025-11-18', { timeout: 10000 });

    // 두 번째 일정은 새 날짜로 이동
    const movedSecondEvent = eventList.locator('> *', { hasText: '두 번째 일정' }).first();
    await expect(movedSecondEvent).toContainText('2025-11-19', { timeout: 10000 });

    // 테스트 일정들 삭제
    await page.waitForTimeout(500);
    const deleteBtn1 = firstEvent.getByRole('button', { name: /delete/i });
    await expect(deleteBtn1).toBeVisible({ timeout: 5000 });
    await deleteBtn1.click();
    await page.waitForTimeout(1000);

    const deleteBtn2 = movedSecondEvent.getByRole('button', { name: /delete/i });
    await expect(deleteBtn2).toBeVisible({ timeout: 5000 });
    await deleteBtn2.click();
    await page.waitForTimeout(500);
  });
});
