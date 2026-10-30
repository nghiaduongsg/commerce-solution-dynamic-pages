import axios from 'axios';
import { readConversations, readMessages } from './dataSource';
import { InboxSource } from '../schemas/model';

jest.mock('axios', () => ({ get: jest.fn() }));
const get = axios.get as jest.Mock;
const source: InboxSource = {
  mode: 'api',
  url: '/api/v1/conversations',
  pageSize: 20,
  messagePageSize: 30,
};
beforeEach(() => get.mockReset());

test('preserves backend cursor and filters and requests summaries without history', async () => {
  get.mockResolvedValue({
    data: {
      conversations: [
        {
          id: 'conversation',
          customer_external_id: 'Customer',
          channel: 'instagram',
          status: 'open',
          preview: {
            id: 'last',
            direction: 'inbound',
            content: 'Latest preview',
            created_at: '2026-10-30T10:00:00Z',
          },
        },
      ],
      next_cursor: 'opaque-cursor',
    },
  });
  const signal = new AbortController().signal;
  const page = await readConversations(
    source,
    'previous-cursor',
    { query: 'coffee', channel: 'Instagram', status: 'open' },
    signal,
  );
  expect(get).toHaveBeenCalledWith('/api/v1/conversations', {
    signal,
    params: {
      limit: 20,
      cursor: 'previous-cursor',
      q: 'coffee',
      channel: 'instagram',
      status: 'open',
    },
  });
  expect(page.nextCursor).toBe('opaque-cursor');
  expect(page.items[0].messages).toEqual([]);
  expect(page.items[0].preview?.text).toBe('Latest preview');
});

test('loads a single backend thread in display order while keeping its older cursor', async () => {
  get.mockResolvedValue({
    data: {
      messages: [
        { id: 'new', direction: 'outbound', content: 'New', created_at: '2026-10-30T10:00:00Z' },
        { id: 'old', direction: 'inbound', content: 'Old', created_at: '2026-10-30T09:00:00Z' },
      ],
      next_cursor: 'older-cursor',
    },
  });
  const signal = new AbortController().signal;
  const page = await readMessages(source, 'thread', 'cursor', signal);
  expect(get).toHaveBeenCalledWith('/api/v1/conversations/thread/messages', {
    signal,
    params: { limit: 30, cursor: 'cursor' },
  });
  expect(page.items.map((message) => message.id)).toEqual(['old', 'new']);
  expect(page.nextCursor).toBe('older-cursor');
});

test('rejects oversized or malformed pages instead of rendering unbounded data', async () => {
  get.mockResolvedValueOnce({
    data: {
      messages: Array(31).fill({
        id: 'a',
        direction: 'inbound',
        content: 'Text',
        created_at: '2026-10-30T10:00:00Z',
      }),
    },
  });
  await expect(readMessages(source, 'thread', null, new AbortController().signal)).rejects.toThrow(
    'invalid_page',
  );
  get.mockResolvedValueOnce({
    data: {
      messages: [
        { id: 'a', direction: 'unknown', content: 'Text', created_at: '2026-10-30T10:00:00Z' },
      ],
    },
  });
  await expect(readMessages(source, 'thread', null, new AbortController().signal)).rejects.toThrow(
    'invalid_page',
  );
});
