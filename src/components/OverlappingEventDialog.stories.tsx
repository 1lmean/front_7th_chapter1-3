// OverlappingEventDialog.stories.tsx
import { Button } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import OverlappingEventDialog from './OverlappingEventDialog';
import type { Event } from '../types';

const meta: Meta<typeof OverlappingEventDialog> = {
  title: 'Components/OverlappingEventDialog',
  component: OverlappingEventDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof OverlappingEventDialog>;

// 스토리북에서 버튼으로 다이얼로그를 열고 겹치는 일정 확인 가능하도록 만든 wrapper
const Template = ({ overlappingEvents }: { overlappingEvents: Event[] }) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    alert('일정을 계속 진행합니다.');
    setOpen(false);
  };

  const handleClose = () => {
    alert('일정 생성/수정을 취소합니다.');
    setOpen(false);
  };

  return (
    <>
      <Button variant="contained" color="warning" onClick={() => setOpen(true)}>
        일정 겹침 다이얼로그 열기
      </Button>
      <OverlappingEventDialog
        open={open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        overlappingEvents={overlappingEvents}
      />
    </>
  );
};

// 단일 일정과 겹치는 경우
export const SingleOverlap: Story = {
  render: () => (
    <Template
      overlappingEvents={[
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
      ]}
    />
  ),
};

// 여러 일정과 겹치는 경우
export const MultipleOverlaps: Story = {
  render: () => (
    <Template
      overlappingEvents={[
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
          date: '2025-11-20',
          startTime: '14:30',
          endTime: '16:00',
          description: '분기별 프로젝트 리뷰',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
        {
          id: '3',
          title: '1:1 미팅',
          date: '2025-11-20',
          startTime: '14:45',
          endTime: '15:30',
          description: '매니저와의 1:1',
          location: '회의실 C',
          category: '개인',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
      ]}
    />
  ),
};

// 긴 제목의 일정과 겹치는 경우
export const LongTitleOverlap: Story = {
  render: () => (
    <Template
      overlappingEvents={[
        {
          id: '1',
          title: '매우 긴 제목을 가진 일정입니다 - 2025년 4분기 전체 팀 미팅 및 성과 공유회',
          date: '2025-11-20',
          startTime: '09:00',
          endTime: '12:00',
          description: '전체 팀 미팅',
          location: '대회의실',
          category: '업무',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
      ]}
    />
  ),
};

// 반복 일정과 겹치는 경우
export const RecurringEventOverlap: Story = {
  render: () => (
    <Template
      overlappingEvents={[
        {
          id: '1',
          title: '주간 스탠드업',
          date: '2025-11-20',
          startTime: '10:00',
          endTime: '10:30',
          description: '매주 월요일 스탠드업',
          location: '온라인',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '일일 체크인',
          date: '2025-11-20',
          startTime: '10:15',
          endTime: '10:45',
          description: '매일 아침 체크인',
          location: '온라인',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-12-31' },
          notificationTime: 10,
        },
      ]}
    />
  ),
};

// 다양한 카테고리의 일정이 겹치는 경우
export const MixedCategoryOverlaps: Story = {
  render: () => (
    <Template
      overlappingEvents={[
        {
          id: '1',
          title: '업무 미팅',
          date: '2025-11-20',
          startTime: '15:00',
          endTime: '16:00',
          description: '중요 업무 미팅',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '개인 약속',
          date: '2025-11-20',
          startTime: '15:30',
          endTime: '16:30',
          description: '병원 예약',
          location: '병원',
          category: '개인',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
        {
          id: '3',
          title: '가족 모임',
          date: '2025-11-20',
          startTime: '15:45',
          endTime: '17:00',
          description: '가족 저녁 식사',
          location: '레스토랑',
          category: '가족',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
      ]}
    />
  ),
};

// 알림 시간이 다른 일정들과 겹치는 경우
export const DifferentNotificationTimes: Story = {
  render: () => (
    <Template
      overlappingEvents={[
        {
          id: '1',
          title: '중요 미팅 (1분 전 알림)',
          date: '2025-11-20',
          startTime: '16:00',
          endTime: '17:00',
          description: '중요한 미팅',
          location: '회의실',
          category: '업무',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 1,
        },
        {
          id: '2',
          title: '일반 미팅 (10분 전 알림)',
          date: '2025-11-20',
          startTime: '16:30',
          endTime: '17:30',
          description: '일반 미팅',
          location: '회의실',
          category: '업무',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
      ]}
    />
  ),
};
