import { test, expect } from '@playwright/test';

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
