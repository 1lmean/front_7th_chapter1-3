import type { Meta, StoryObj } from '@storybook/react-vite';

import EventView from './EventView';
import { Event } from '../types';

// Mock events data
const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-10-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '프로젝트 계획',
    date: '2025-10-20',
    startTime: '14:00',
    endTime: '16:00',
    description: 'Q4 프로젝트 계획 수립',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
  {
    id: '3',
    title: '반복 회의',
    date: '2025-10-10',
    startTime: '09:00',
    endTime: '10:00',
    description: '매일 스탠드업',
    location: '온라인',
    category: '업무',
    repeat: { type: 'daily', interval: 1, endDate: '2025-10-15' },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '점심 약속',
    date: '2025-10-18',
    startTime: '12:00',
    endTime: '13:00',
    description: '친구와 점심',
    location: '레스토랑',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '5',
    title: '주간 리뷰',
    date: '2025-10-25',
    startTime: '16:00',
    endTime: '17:00',
    description: '주간 업무 리뷰',
    location: '회의실 C',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30' },
    notificationTime: 60,
  },
];

const meta = {
  title: 'Components/EventView',
  component: EventView,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    filteredEvents: mockEvents,
    notifiedEvents: [],
    onEventDrop: () => Promise.resolve(),
    onCalendarStateChange: () => {},
    onEmptySlotSelect: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventView>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 월간 뷰
 */
export const MonthView: Story = {
  name: '월간 뷰 (기본)',
};

/**
 * 일정이 없는 빈 캘린더
 */
export const EmptyCalendar: Story = {
  name: '일정 없음',
  args: {
    filteredEvents: [],
    notifiedEvents: [],
  },
};

/**
 * 알림이 있는 일정
 */
export const WithNotifications: Story = {
  name: '알림 표시',
  args: {
    filteredEvents: mockEvents,
    notifiedEvents: ['1', '3'], // 팀 회의와 반복 회의에 알림
  },
};

/**
 * 반복 일정만 표시
 */
export const RecurringEventsOnly: Story = {
  name: '반복 일정만',
  args: {
    filteredEvents: mockEvents.filter((event) => event.repeat.type !== 'none'),
    notifiedEvents: [],
  },
};

/**
 * 단일 일정만 표시
 */
export const SingleEventsOnly: Story = {
  name: '단일 일정만',
  args: {
    filteredEvents: mockEvents.filter((event) => event.repeat.type === 'none'),
    notifiedEvents: [],
  },
};

/**
 * 많은 일정이 있는 경우
 */
export const ManyEvents: Story = {
  name: '많은 일정',
  args: {
    filteredEvents: [
      ...mockEvents,
      ...Array.from({ length: 20 }, (_, i) => ({
        id: `extra-${i}`,
        title: `일정 ${i + 6}`,
        date: `2025-10-${String(i + 1).padStart(2, '0')}`,
        startTime: '10:00',
        endTime: '11:00',
        description: `추가 일정 ${i + 1}`,
        location: '회의실',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      })),
    ],
    notifiedEvents: [],
  },
};

/**
 * 여러 카테고리의 일정
 */
export const MultipleCategories: Story = {
  name: '다양한 카테고리',
  args: {
    filteredEvents: mockEvents,
    notifiedEvents: [],
  },
};

/**
 * 긴 제목의 일정
 */
export const LongTitles: Story = {
  name: '긴 제목',
  args: {
    filteredEvents: [
      {
        id: '1',
        title: '매우 긴 제목의 일정입니다 이것은 말줄임표로 표시되어야 합니다',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '긴 제목 테스트',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '또 다른 매우 긴 제목의 일정입니다 noWrap 속성으로 잘려야 합니다',
        date: '2025-10-16',
        startTime: '14:00',
        endTime: '15:00',
        description: '긴 제목 테스트 2',
        location: '회의실 B',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: [],
  },
};

/**
 * 하루에 여러 일정
 */
export const MultipleEventsPerDay: Story = {
  name: '하루 여러 일정',
  args: {
    filteredEvents: [
      {
        id: '1',
        title: '아침 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '아침 스탠드업',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '점심 약속',
        date: '2025-10-15',
        startTime: '12:00',
        endTime: '13:00',
        description: '팀 점심',
        location: '식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '오후 회의',
        date: '2025-10-15',
        startTime: '15:00',
        endTime: '16:00',
        description: '프로젝트 리뷰',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: ['1', '3'],
  },
};

/**
 * 알림과 반복 일정이 함께 있는 경우
 */
export const NotificationsAndRecurring: Story = {
  name: '알림 + 반복 일정',
  args: {
    filteredEvents: mockEvents.filter((event) => event.repeat.type !== 'none'),
    notifiedEvents: ['3', '5'],
  },
};

/**
 * 10월 초반 일정
 */
export const EarlyMonth: Story = {
  name: '월 초반',
  args: {
    filteredEvents: mockEvents.filter((event) => {
      const day = new Date(event.date).getDate();
      return day <= 10;
    }),
    notifiedEvents: [],
  },
};

/**
 * 10월 후반 일정
 */
export const LateMonth: Story = {
  name: '월 후반',
  args: {
    filteredEvents: mockEvents.filter((event) => {
      const day = new Date(event.date).getDate();
      return day >= 15;
    }),
    notifiedEvents: [],
  },
};
