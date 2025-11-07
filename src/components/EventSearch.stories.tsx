import type { Meta, StoryObj } from '@storybook/react';

import EventSearch from './EventSearch';

import type { Event } from '../types';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-11-20',
    startTime: '14:00',
    endTime: '15:00',
    description: '정기 팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '프로젝트 리뷰',
    date: '2025-11-21',
    startTime: '10:00',
    endTime: '11:00',
    description: '분기별 프로젝트 리뷰',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '주간 스탠드업',
    date: '2025-11-22',
    startTime: '09:00',
    endTime: '09:30',
    description: '매주 월요일 스탠드업',
    location: '온라인',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '점심 약속',
    date: '2025-11-22',
    startTime: '12:00',
    endTime: '13:00',
    description: '친구와 점심',
    location: '레스토랑',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 1,
  },
  {
    id: '5',
    title: '일일 체크인',
    date: '2025-11-23',
    startTime: '10:00',
    endTime: '10:15',
    description: '매일 아침 체크인',
    location: '온라인',
    category: '업무',
    repeat: { type: 'daily', interval: 1, endDate: '2025-12-31' },
    notificationTime: 10,
  },
];

const meta: Meta<typeof EventSearch> = {
  title: 'Components/EventSearch',
  component: EventSearch,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    filteredEvents: mockEvents,
    notifiedEvents: [],
    searchTerm: '',
    setSearchTerm: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ height: '600px', display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 일정 목록
 */
export const Default: Story = {
  name: '기본 목록',
};

/**
 * 검색어 입력 상태
 */
export const WithSearchTerm: Story = {
  name: '검색 중',
  args: {
    searchTerm: '회의',
    filteredEvents: mockEvents.filter((e) => e.title.includes('회의')),
  },
};

/**
 * 일정이 없는 상태
 */
export const Empty: Story = {
  name: '일정 없음',
  args: {
    filteredEvents: [],
  },
};

/**
 * 알림이 있는 일정들
 */
export const WithNotifications: Story = {
  name: '알림 표시',
  args: {
    filteredEvents: mockEvents,
    notifiedEvents: ['1', '3', '4'],
  },
};

/**
 * 반복 일정만 표시
 */
export const RecurringEventsOnly: Story = {
  name: '반복 일정만',
  args: {
    filteredEvents: mockEvents.filter((e) => e.repeat.type !== 'none'),
    notifiedEvents: [],
  },
};

/**
 * 단일 일정만 표시
 */
export const SingleEventsOnly: Story = {
  name: '단일 일정만',
  args: {
    filteredEvents: mockEvents.filter((e) => e.repeat.type === 'none'),
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
        title: '매우 긴 제목의 일정입니다 - 2025년 4분기 전체 팀 미팅 및 성과 공유회',
        date: '2025-11-20',
        startTime: '09:00',
        endTime: '12:00',
        description: '전체 팀 미팅과 Q4 성과 공유',
        location: '대회의실',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '또 다른 매우 긴 제목의 일정 - 고객사 방문 및 제품 시연회 진행',
        date: '2025-11-21',
        startTime: '14:00',
        endTime: '17:00',
        description: '고객사 제품 시연',
        location: '고객사 본사',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 60,
      },
    ],
    notifiedEvents: [],
  },
};

/**
 * 많은 일정
 */
export const ManyEvents: Story = {
  name: '많은 일정',
  args: {
    filteredEvents: [
      ...mockEvents,
      ...Array.from({ length: 15 }, (_, i) => ({
        id: `extra-${i}`,
        title: `일정 ${i + 6}`,
        date: `2025-11-${String((i % 28) + 1).padStart(2, '0')}`,
        startTime: `${String((i % 12) + 9).padStart(2, '0')}:00`,
        endTime: `${String((i % 12) + 10).padStart(2, '0')}:00`,
        description: `추가 일정 ${i + 1}`,
        location: '회의실',
        category: ['업무', '개인', '가족'][i % 3] as Event['category'],
        repeat: { type: 'none' as const, interval: 1 },
        notificationTime: 10,
      })),
    ],
    notifiedEvents: [],
  },
};

/**
 * 다양한 카테고리
 */
export const MultipleCategories: Story = {
  name: '다양한 카테고리',
  args: {
    filteredEvents: [
      ...mockEvents,
      {
        id: '6',
        title: '가족 모임',
        date: '2025-11-24',
        startTime: '18:00',
        endTime: '20:00',
        description: '가족 저녁 식사',
        location: '집',
        category: '가족',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 60,
      },
      {
        id: '7',
        title: '기타 일정',
        date: '2025-11-25',
        startTime: '15:00',
        endTime: '16:00',
        description: '기타 약속',
        location: '카페',
        category: '기타',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: [],
  },
};

/**
 * 알림과 반복 일정 혼합
 */
export const NotificationsAndRecurring: Story = {
  name: '알림 + 반복 일정',
  args: {
    filteredEvents: mockEvents.filter((e) => e.repeat.type !== 'none'),
    notifiedEvents: ['3', '5'],
  },
};

/**
 * 다양한 알림 시간
 */
export const DifferentNotificationTimes: Story = {
  name: '다양한 알림 시간',
  args: {
    filteredEvents: [
      {
        id: '1',
        title: '1분 전 알림',
        date: '2025-11-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '긴급 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '10분 전 알림',
        date: '2025-11-20',
        startTime: '14:00',
        endTime: '15:00',
        description: '일반 회의',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '1시간 전 알림',
        date: '2025-11-20',
        startTime: '16:00',
        endTime: '17:00',
        description: '중요 미팅',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 60,
      },
      {
        id: '4',
        title: '1일 전 알림',
        date: '2025-11-21',
        startTime: '09:00',
        endTime: '18:00',
        description: '전체 워크샵',
        location: '외부',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 1440,
      },
    ],
    notifiedEvents: ['1', '3'],
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
        date: '2025-11-20',
        startTime: '09:00',
        endTime: '10:00',
        description: '아침 스탠드업',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '점심 약속',
        date: '2025-11-20',
        startTime: '12:00',
        endTime: '13:00',
        description: '팀 점심',
        location: '식당',
        category: '개인',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '오후 회의',
        date: '2025-11-20',
        startTime: '15:00',
        endTime: '16:00',
        description: '프로젝트 리뷰',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '4',
        title: '저녁 모임',
        date: '2025-11-20',
        startTime: '18:00',
        endTime: '20:00',
        description: '팀 저녁',
        location: '레스토랑',
        category: '가족',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: ['1', '3'],
  },
};
