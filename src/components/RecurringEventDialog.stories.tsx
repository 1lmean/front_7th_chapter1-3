// RecurringEventDialog.stories.tsx
import { Button } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import RecurringEventDialog from './RecurringEventDialog';
import type { Event } from '../types';

const meta: Meta<typeof RecurringEventDialog> = {
  title: 'Components/RecurringEventDialog',
  component: RecurringEventDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof RecurringEventDialog>;

// 스토리북에서 버튼으로 다이얼로그를 열고 모드 확인 가능하도록 만든 wrapper
const Template = ({ mode }: { mode: 'edit' | 'delete' }) => {
  const [open, setOpen] = useState(false);
  const mockEvent: Event = {
    id: 1,
    title: '회의 일정',
    start: '2025-11-07T10:00:00',
    end: '2025-11-07T11:00:00',
    category: '업무',
    description: '정기 회의',
  };

  const handleConfirm = (single: boolean) => {
    alert(single ? '단일 일정만 처리합니다.' : '모든 반복 일정(시리즈 전체)을 처리합니다.');
    setOpen(false);
  };

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        {mode === 'edit' ? '반복 일정 수정 열기' : '반복 일정 삭제 열기'}
      </Button>
      <RecurringEventDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        event={mockEvent}
        mode={mode}
      />
    </>
  );
};

// 두 가지 모드 각각의 스토리
export const EditDialog: Story = {
  render: () => <Template mode="edit" />,
};

export const DeleteDialog: Story = {
  render: () => <Template mode="delete" />,
};
