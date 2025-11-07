import { Delete, Edit, Notifications, Repeat } from '@mui/icons-material';
import {
  Box,
  FormControl,
  FormLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
  Tooltip,
} from '@mui/material';

import { Event } from '../types';
import { getRepeatTypeLabel } from '../utils/eventUtils';

type Props = {
  filteredEvents: Event[];
  notifiedEvents: string[]; // event ids
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  onEdit: (e: Event) => void;
  onDelete: (e: Event) => void;
};

export default function EventSearch({
  filteredEvents,
  notifiedEvents,
  searchTerm,
  setSearchTerm,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Stack
      data-testid="event-list"
      spacing={2}
      sx={{ width: '30%', height: '100%', overflowY: 'auto' }}
    >
      <FormSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {filteredEvents.length === 0 ? (
        <Typography>검색 결과가 없습니다.</Typography>
      ) : (
        filteredEvents.map((event) => (
          <Box key={event.id} sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}>
            <Stack direction="row" justifyContent="space-between">
              <Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  {notifiedEvents.includes(event.id) && <Notifications color="error" />}
                  {event.repeat.type !== 'none' && (
                    <Tooltip
                      title={`${event.repeat.interval}${getRepeatTypeLabel(
                        event.repeat.type
                      )}마다 반복${event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''}`}
                    >
                      <Repeat fontSize="small" />
                    </Tooltip>
                  )}
                  <Typography
                    fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
                    color={notifiedEvents.includes(event.id) ? 'error' : 'inherit'}
                  >
                    {event.title}
                  </Typography>
                </Stack>
                <Typography>{event.date}</Typography>
                <Typography>
                  {event.startTime} - {event.endTime}
                </Typography>
                <Typography>{event.description}</Typography>
                <Typography>{event.location}</Typography>
                <Typography>카테고리: {event.category}</Typography>
                {event.repeat.type !== 'none' && (
                  <Typography>
                    반복: {event.repeat.interval}
                    {event.repeat.type === 'daily' && '일'}
                    {event.repeat.type === 'weekly' && '주'}
                    {event.repeat.type === 'monthly' && '월'}
                    {event.repeat.type === 'yearly' && '년'}
                    마다
                    {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
                  </Typography>
                )}
                <Typography>
                  알림:{' '}
                  {/* some parent should provide same notificationOptions if needed; for simplicity show number */}
                  {event.notificationTime}분 전
                </Typography>
              </Stack>
              <Stack>
                <IconButton aria-label="Edit event" onClick={() => onEdit(event)}>
                  <Edit />
                </IconButton>
                <IconButton aria-label="Delete event" onClick={() => onDelete(event)}>
                  <Delete />
                </IconButton>
              </Stack>
            </Stack>
          </Box>
        ))
      )}
    </Stack>
  );
}

function FormSearch({
  searchTerm,
  setSearchTerm,
}: {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
}) {
  return (
    <FormControl fullWidth>
      <FormLabel htmlFor="search">일정 검색</FormLabel>
      <TextField
        id="search"
        size="small"
        placeholder="검색어를 입력하세요"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </FormControl>
  );
}
