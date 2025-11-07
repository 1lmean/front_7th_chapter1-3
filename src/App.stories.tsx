import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import App from './App';
import type { Event } from './types';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '회의: 디자인 리뷰',
    date: '2024-11-10',
    startTime: '10:00',
    endTime: '11:00',
    description: '디자인 관련 논의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '반복: 데일리 스탠드업',
    date: '2024-11-10',
    startTime: '09:00',
    endTime: '09:15',
    description: '데일리 스탠드업',
    location: '온라인',
    category: '업무',
    repeat: { type: 'daily', interval: 1, endDate: '2024-12-31' },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '개인: 점심 약속',
    date: '2024-11-12',
    startTime: '12:00',
    endTime: '13:00',
    description: '친구와 점심',
    location: '레스토랑',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
];

const meta: Meta<typeof App> = {
  title: 'App/Calendar',
  component: App,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get('/api/events', () => {
          return HttpResponse.json(mockEvents);
        }),
        http.post('/api/events', async ({ request }) => {
          const body = (await request.json()) as Event;
          return HttpResponse.json({ ...body, id: String(Date.now()) });
        }),
        http.put('/api/events/:id', async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json(body);
        }),
        http.delete('/api/events/:id', () => {
          return HttpResponse.json({ success: true });
        }),
        http.post('/api/events/recurring/edit', () => {
          return HttpResponse.json({ success: true });
        }),
        http.post('/api/events/recurring/delete', () => {
          return HttpResponse.json({ success: true });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 캘린더 앱
 */
export const Default: Story = {
  name: '기본 뷰',
};

/**
 * 일정이 없는 빈 캘린더
 */
export const Empty: Story = {
  name: '일정 없음',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/events', () => {
          return HttpResponse.json([]);
        }),
        http.post('/api/events', async ({ request }) => {
          const body = (await request.json()) as Event;
          return HttpResponse.json({ ...body, id: String(Date.now()) });
        }),
        http.put('/api/events/:id', async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json(body);
        }),
        http.delete('/api/events/:id', () => {
          return HttpResponse.json({ success: true });
        }),
      ],
    },
  },
};

/**
 * 반복 일정만 있는 경우
 */
export const RecurringOnly: Story = {
  name: '반복 일정만',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/events', () => {
          return HttpResponse.json([mockEvents[1]]); // only recurring
        }),
        http.post('/api/events', async ({ request }) => {
          const body = (await request.json()) as Event;
          return HttpResponse.json({ ...body, id: String(Date.now()) });
        }),
        http.put('/api/events/:id', async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json(body);
        }),
        http.delete('/api/events/:id', () => {
          return HttpResponse.json({ success: true });
        }),
        http.post('/api/events/recurring/edit', () => {
          return HttpResponse.json({ success: true });
        }),
        http.post('/api/events/recurring/delete', () => {
          return HttpResponse.json({ success: true });
        }),
      ],
    },
  },
};

/**
 * 많은 일정이 있는 경우
 */
export const ManyEvents: Story = {
  name: '많은 일정',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/events', () => {
          const manyEvents = [
            ...mockEvents,
            ...Array.from({ length: 15 }, (_, i) => ({
              id: `extra-${i}`,
              title: `일정 ${i + 4}`,
              date: `2024-11-${String((i % 20) + 1).padStart(2, '0')}`,
              startTime: `${String((i % 12) + 9).padStart(2, '0')}:00`,
              endTime: `${String((i % 12) + 10).padStart(2, '0')}:00`,
              description: `추가 일정 ${i + 1}`,
              location: '회의실',
              category: ['업무', '개인', '가족'][i % 3] as Event['category'],
              repeat: { type: 'none' as const, interval: 1 },
              notificationTime: 10,
            })),
          ];
          return HttpResponse.json(manyEvents);
        }),
        http.post('/api/events', async ({ request }) => {
          const body = (await request.json()) as Event;
          return HttpResponse.json({ ...body, id: String(Date.now()) });
        }),
        http.put('/api/events/:id', async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json(body);
        }),
        http.delete('/api/events/:id', () => {
          return HttpResponse.json({ success: true });
        }),
        http.post('/api/events/recurring/edit', () => {
          return HttpResponse.json({ success: true });
        }),
        http.post('/api/events/recurring/delete', () => {
          return HttpResponse.json({ success: true });
        }),
      ],
    },
  },
};

/**
 * 다양한 카테고리의 일정
 */
export const MultipleCategories: Story = {
  name: '다양한 카테고리',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/events', () => {
          const categorizedEvents = [
            ...mockEvents,
            {
              id: '4',
              title: '가족 모임',
              date: '2024-11-13',
              startTime: '18:00',
              endTime: '20:00',
              description: '가족 저녁 식사',
              location: '집',
              category: '가족',
              repeat: { type: 'none', interval: 1 },
              notificationTime: 60,
            },
            {
              id: '5',
              title: '기타 일정',
              date: '2024-11-14',
              startTime: '15:00',
              endTime: '16:00',
              description: '기타 약속',
              location: '카페',
              category: '기타',
              repeat: { type: 'none', interval: 1 },
              notificationTime: 10,
            },
          ];
          return HttpResponse.json(categorizedEvents);
        }),
        http.post('/api/events', async ({ request }) => {
          const body = (await request.json()) as Event;
          return HttpResponse.json({ ...body, id: String(Date.now()) });
        }),
        http.put('/api/events/:id', async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json(body);
        }),
        http.delete('/api/events/:id', () => {
          return HttpResponse.json({ success: true });
        }),
        http.post('/api/events/recurring/edit', () => {
          return HttpResponse.json({ success: true });
        }),
        http.post('/api/events/recurring/delete', () => {
          return HttpResponse.json({ success: true });
        }),
      ],
    },
  },
};

/**
 * API 에러 상황
 */
export const ApiError: Story = {
  name: 'API 에러',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/events', () => {
          return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }),
      ],
    },
  },
};

/**
 * 로딩이 느린 경우
 */
export const SlowLoading: Story = {
  name: '느린 로딩',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/events', async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return HttpResponse.json(mockEvents);
        }),
        http.post('/api/events', async ({ request }) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const body = (await request.json()) as Event;
          return HttpResponse.json({ ...body, id: String(Date.now()) });
        }),
        http.put('/api/events/:id', async ({ request }) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const body = await request.json();
          return HttpResponse.json(body);
        }),
        http.delete('/api/events/:id', async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return HttpResponse.json({ success: true });
        }),
      ],
    },
  },
};
