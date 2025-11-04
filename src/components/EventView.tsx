import { DndContext, pointerWithin, MeasuringStrategy, DragEndEvent } from '@dnd-kit/core';
import { Notifications, ChevronLeft, ChevronRight, Repeat } from '@mui/icons-material';
import {
  Box,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
} from '@mui/material';
import { useEffect } from 'react';
import Draggable from '../components/ui/Draggable';
import Droppable from '../components/ui/Droppable';
import {
  formatDate,
  formatMonth,
  formatWeek,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
} from '../utils/dateUtils';
import { useCalendarView } from '../hooks/useCalendarView';
import { getRepeatTypeLabel } from '../utils/eventUtils';
import { Event } from '../types';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

// 스타일 상수
const eventBoxStyles = {
  notified: {
    backgroundColor: '#ffebee',
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  normal: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'normal',
    color: 'inherit',
  },
  common: {
    p: 0.5,
    my: 0.5,
    borderRadius: 1,
    minHeight: '18px',
    width: '100%',
    overflow: 'hidden',
  },
};

interface Props {
  filteredEvents: Event[];
  notifiedEvents: string[];
  onEventDrop: (originalEvent: Event, nextDate: string) => Promise<void> | void;
  onCalendarStateChange: (state: {
    view: 'week' | 'month';
    currentDate: Date;
    holidays: Record<string, string>;
  }) => void;
  onEmptySlotSelect: (date: string) => void;
}

const EventView = ({
  filteredEvents,
  notifiedEvents,
  onEventDrop,
  onCalendarStateChange,
  onEmptySlotSelect,
}: Props) => {
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();

  useEffect(() => {
    onCalendarStateChange({ view, currentDate, holidays });
  }, [onCalendarStateChange, view, currentDate, holidays]);

  const hasEventsOnDate = (dateString: string) =>
    filteredEvents.some((event) => event.date === dateString);

  const handleDateCellClick = (dateString: string) => {
    if (hasEventsOnDate(dateString)) {
      return;
    }
    onEmptySlotSelect(dateString);
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    return (
      <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatWeek(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {weekDates.map((date) => (
                  <TableCell
                    key={date.toISOString()}
                    sx={{
                      height: '120px',
                      verticalAlign: 'top',
                      width: '14.28%',
                      padding: 1,
                      border: '1px solid #e0e0e0',
                    }}
                    onClick={() => handleDateCellClick(date.toISOString().slice(0, 10))}
                  >
                    <Droppable id={`${date.toISOString().slice(0, 10)}`}>
                      <Typography variant="body2" fontWeight="bold">
                        {date.getDate()}
                      </Typography>
                      {filteredEvents
                        .filter(
                          (event) => new Date(event.date).toDateString() === date.toDateString()
                        )
                        .map((event) => {
                          const isNotified = notifiedEvents.includes(event.id);
                          const isRepeating = event.repeat.type !== 'none';

                          return (
                            <Draggable key={event.id} id={`${event.id}`}>
                              <Box
                                key={event.id}
                                sx={{
                                  ...eventBoxStyles.common,
                                  ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Stack direction="row" spacing={1} alignItems="center">
                                  {isNotified && <Notifications fontSize="small" />}
                                  {/* ! TEST CASE */}
                                  {isRepeating && (
                                    <Tooltip
                                      title={`${event.repeat.interval}${getRepeatTypeLabel(
                                        event.repeat.type
                                      )}마다 반복${
                                        event.repeat.endDate
                                          ? ` (종료: ${event.repeat.endDate})`
                                          : ''
                                      }`}
                                    >
                                      <Repeat fontSize="small" />
                                    </Tooltip>
                                  )}
                                  <Typography
                                    variant="caption"
                                    noWrap
                                    sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                                  >
                                    {event.title}
                                  </Typography>
                                </Stack>
                              </Box>
                            </Draggable>
                          );
                        })}
                    </Droppable>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  const renderMonthView = () => {
    const weeks = getWeeksAtMonth(currentDate);

    return (
      <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatMonth(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%', overflow: 'hidden' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {weeks.map((week, weekIndex) => (
                <TableRow key={weekIndex}>
                  {week.map((day, dayIndex) => {
                    const dateString = day ? formatDate(currentDate, day) : '';
                    const holiday = holidays[dateString];

                    return (
                      <TableCell
                        key={dayIndex}
                        sx={{
                          height: '120px',
                          verticalAlign: 'top',
                          width: '14.28%',
                          padding: 1,
                          border: '1px solid #e0e0e0',
                          position: 'relative',
                        }}
                        onClick={() => day && handleDateCellClick(dateString)}
                      >
                        {day && (
                          <>
                            <Typography variant="body2" fontWeight="bold">
                              {day}
                            </Typography>
                            {holiday && (
                              <Typography variant="body2" color="error">
                                {holiday}
                              </Typography>
                            )}
                            <Droppable id={`${dateString}`}>
                              {getEventsForDay(filteredEvents, day).map((event) => {
                                const isNotified = notifiedEvents.includes(event.id);
                                const isRepeating = event.repeat.type !== 'none';

                                return (
                                  <Draggable key={event.id} id={`${event.id}`}>
                                    <Box
                                      key={event.id}
                                      sx={{
                                        p: 0.5,
                                        my: 0.5,
                                        backgroundColor: isNotified ? '#ffebee' : '#f5f5f5',
                                        borderRadius: 1,
                                        fontWeight: isNotified ? 'bold' : 'normal',
                                        color: isNotified ? '#d32f2f' : 'inherit',
                                        minHeight: '18px',
                                        width: '100%',
                                        overflow: 'hidden',
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        {isNotified && <Notifications fontSize="small" />}
                                        {/* ! TEST CASE */}
                                        {isRepeating && (
                                          <Tooltip
                                            title={`${event.repeat.interval}${getRepeatTypeLabel(
                                              event.repeat.type
                                            )}마다 반복${
                                              event.repeat.endDate
                                                ? ` (종료: ${event.repeat.endDate})`
                                                : ''
                                            }`}
                                          >
                                            <Repeat fontSize="small" />
                                          </Tooltip>
                                        )}
                                        <Typography
                                          variant="caption"
                                          noWrap
                                          sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                                        >
                                          {event.title}
                                        </Typography>
                                      </Stack>
                                    </Box>
                                  </Draggable>
                                );
                              })}
                            </Droppable>
                          </>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }

    const editingEvent = filteredEvents.find((item) => item.id === active.id);
    if (!editingEvent) {
      return;
    }

    const nextDate = String(over.id);
    await onEventDrop(editingEvent, nextDate);
  };

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      collisionDetection={pointerWithin}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
    >
      <Stack flex={1} spacing={5}>
        <Typography variant="h4">일정 보기</Typography>

        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
          <IconButton aria-label="Previous" onClick={() => navigate('prev')}>
            <ChevronLeft />
          </IconButton>
          <Select
            size="small"
            aria-label="뷰 타입 선택"
            value={view}
            onChange={(e) => setView(e.target.value as 'week' | 'month')}
          >
            <MenuItem value="week" aria-label="week-option">
              Week
            </MenuItem>
            <MenuItem value="month" aria-label="month-option">
              Month
            </MenuItem>
          </Select>
          <IconButton aria-label="Next" onClick={() => navigate('next')}>
            <ChevronRight />
          </IconButton>
        </Stack>

        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
      </Stack>
    </DndContext>
  );
};

export default EventView;
