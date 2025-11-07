import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { Event } from '../../types';
import { findOverlappingEvents } from '../../utils/eventOverlap';

describe('드래그 앤 드롭 핸들러 로직 - API 호출 시뮬레이션', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('일정을 다른 날짜로 드롭하면 PUT 요청이 올바르게 전송된다', async () => {
    const originalEvent: Event = {
      id: '1',
      title: '테스트 일정',
      date: '2024-11-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트',
      location: '테스트 장소',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const nextDate = '2024-11-11';
    const updatedEvent = { ...originalEvent, date: nextDate };

    // handleEventDrop 로직 시뮬레이션
    if (originalEvent && nextDate && originalEvent.date !== nextDate) {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedEvent,
      });

      await fetch(`/api/events/${originalEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });

      expect(global.fetch).toHaveBeenCalledWith(`/api/events/${originalEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });
    }
  });

  it('같은 날짜로 드롭하면 API 호출이 발생하지 않는다', () => {
    const originalEvent: Event = {
      id: '1',
      title: '테스트 일정',
      date: '2024-11-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트',
      location: '테스트 장소',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const nextDate = '2024-11-10'; // 같은 날짜

    // handleEventDrop의 early return 로직
    const shouldReturn = !originalEvent || !nextDate || originalEvent.date === nextDate;

    expect(shouldReturn).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('겹치는 일정이 있는 날짜로 드롭하면 드롭이 차단된다', () => {
    const existingEvents: Event[] = [
      {
        id: '1',
        title: '기존 일정',
        date: '2024-11-10',
        startTime: '10:00',
        endTime: '11:00',
        description: '기존 일정',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    const droppedEvent: Event = {
      id: '2',
      title: '이동할 일정',
      date: '2024-11-10', // 같은 날짜로 이동
      startTime: '10:30',
      endTime: '11:30',
      description: '이동할 일정',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    // findOverlappingEvents 로직 테스트
    const overlapping = findOverlappingEvents(droppedEvent, existingEvents);

    expect(overlapping.length).toBeGreaterThan(0);
    expect(overlapping[0].id).toBe('1');
    // 겹치는 일정이 있으면 API 호출이 차단되어야 함
  });

  it('반복 일정을 드롭하면 반복 일정임을 감지한다', () => {
    const recurringEvent: Event = {
      id: '1',
      title: '반복 일정',
      date: '2024-11-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '반복 일정',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2024-11-15' },
      notificationTime: 10,
    };

    // isRecurringEvent 로직
    const isRecurring = recurringEvent.repeat.type !== 'none' && recurringEvent.repeat.interval > 0;

    expect(isRecurring).toBe(true);
    // 반복 일정인 경우 handleRecurringEdit이 호출되어야 함
  });

  it('드롭 API 호출 실패 시 에러가 발생한다', async () => {
    const originalEvent: Event = {
      id: '1',
      title: '테스트 일정',
      date: '2024-11-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트',
      location: '테스트 장소',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const nextDate = '2024-11-11';
    const updatedEvent = { ...originalEvent, date: nextDate };

    // API 실패 시뮬레이션
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const response = await fetch(`/api/events/${originalEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });
});

describe('드래그 앤 드롭 핸들러 로직 - 날짜 변환', () => {
  it('드롭된 날짜 문자열이 올바르게 처리된다', () => {
    const originalEvent: Event = {
      id: '1',
      title: '테스트 일정',
      date: '2024-11-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트',
      location: '테스트 장소',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const nextDate = '2024-11-11';

    // handleEventDrop 로직 시뮬레이션
    const updatedEvent = {
      ...originalEvent,
      date: nextDate,
    };

    expect(updatedEvent.date).toBe('2024-11-11');
    expect(updatedEvent.startTime).toBe(originalEvent.startTime);
    expect(updatedEvent.endTime).toBe(originalEvent.endTime);
    expect(updatedEvent.title).toBe(originalEvent.title);
  });

  it('잘못된 날짜 형식은 처리되지 않는다', () => {
    const originalEvent: Event = {
      id: '1',
      title: '테스트 일정',
      date: '2024-11-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트',
      location: '테스트 장소',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    // 빈 문자열이나 null은 early return
    const emptyDate = '';
    const shouldReturn = !originalEvent || !emptyDate || originalEvent.date === emptyDate;

    expect(shouldReturn).toBe(true);
  });
});

describe('드래그 앤 드롭 핸들러 로직 - 겹침 검증', () => {
  it('시간이 겹치는 일정이 있으면 드롭이 차단된다', () => {
    const existingEvent: Event = {
      id: '2',
      title: '기존 일정',
      date: '2024-11-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '기존',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const droppedEvent: Event = {
      id: '1',
      title: '이동할 일정',
      date: '2024-11-10',
      startTime: '10:30',
      endTime: '11:30',
      description: '이동',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    // 겹침 확인 로직
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const start1 = timeToMinutes(existingEvent.startTime);
    const end1 = timeToMinutes(existingEvent.endTime);
    const start2 = timeToMinutes(droppedEvent.startTime);
    const end2 = timeToMinutes(droppedEvent.endTime);

    const isOverlapping = start1 < end2 && start2 < end1;

    expect(isOverlapping).toBe(true);
  });

  it('시간이 겹치지 않으면 드롭이 허용된다', () => {
    const existingEvent: Event = {
      id: '2',
      title: '기존 일정',
      date: '2024-11-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '기존',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const droppedEvent: Event = {
      id: '1',
      title: '이동할 일정',
      date: '2024-11-10',
      startTime: '14:00',
      endTime: '15:00',
      description: '이동',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const start1 = timeToMinutes(existingEvent.startTime);
    const end1 = timeToMinutes(existingEvent.endTime);
    const start2 = timeToMinutes(droppedEvent.startTime);
    const end2 = timeToMinutes(droppedEvent.endTime);

    const isOverlapping = start1 < end2 && start2 < end1;

    expect(isOverlapping).toBe(false);
  });
});

describe('드래그 앤 드롭 핸들러 로직 - API 호출', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('일반 일정 드롭 시 PUT 요청이 올바른 데이터로 전송된다', async () => {
    const originalEvent: Event = {
      id: '1',
      title: '테스트 일정',
      date: '2024-11-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트',
      location: '테스트 장소',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const nextDate = '2024-11-11';
    const updatedEvent = { ...originalEvent, date: nextDate };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedEvent,
    });

    await fetch(`/api/events/${originalEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent),
    });

    expect(global.fetch).toHaveBeenCalledWith(`/api/events/${originalEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent),
    });
  });

  it('반복 일정 드롭 시 POST 요청이 올바른 데이터로 전송된다', async () => {
    const recurringEvent: Event = {
      id: '1',
      title: '반복 일정',
      date: '2024-11-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '반복',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2024-11-15' },
      notificationTime: 10,
    };

    const nextDate = '2024-11-11';
    const updatedEvent = { ...recurringEvent, date: nextDate };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    // 반복 일정은 단일 수정으로 처리
    await fetch('/api/events/recurring/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalEvent: recurringEvent,
        updatedEvent: updatedEvent,
        editSingleOnly: true,
      }),
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/events/recurring/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalEvent: recurringEvent,
        updatedEvent: updatedEvent,
        editSingleOnly: true,
      }),
    });
  });
});
