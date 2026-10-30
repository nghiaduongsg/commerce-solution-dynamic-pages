import { act, renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { useInboxData } from './useInboxData';
import { InboxData } from '../schemas/model';
import schema from '../__fixtures__/inbox.schema.json';

jest.mock('axios', () => ({ get: jest.fn() }));
const get = axios.get as jest.Mock;
const filters = { query: '', channel: 'all', status: 'open' };
const source: InboxData = {
  workspace: 'Store',
  source: { mode: 'demo', url: '/demo/messaging', pageSize: 2, messagePageSize: 2 },
};
const summaries = schema.default.conversations.map((c) => ({
  ...c,
  summary: '',
  draft: '',
  messages: [],
  preview: c.messages[c.messages.length - 1],
}));
beforeEach(() => get.mockReset());

test('loads one summary page and only the selected thread; older messages load on demand', async () => {
  get.mockImplementation((url: string) => {
    if (url.endsWith('/conversations/0.json'))
      return Promise.resolve({ data: { items: summaries.slice(0, 2), nextCursor: '1' } });
    if (url.endsWith('/conversations/1.json'))
      return Promise.resolve({ data: { items: summaries.slice(2, 4), nextCursor: null } });
    if (url.endsWith('/messages/mia/0.json'))
      return Promise.resolve({
        data: {
          items: [...schema.default.conversations[0].messages.slice(-2)].reverse(),
          nextCursor: '1',
        },
      });
    if (url.endsWith('/messages/mia/1.json'))
      return Promise.resolve({
        data: { items: schema.default.conversations[0].messages.slice(0, 1), nextCursor: null },
      });
    throw new Error('Unexpected fetch: ' + url);
  });
  const { result } = renderHook(() => useInboxData(source, filters));
  await waitFor(() => expect(result.current.conversations[0]?.messages).toHaveLength(2));
  expect(get).toHaveBeenCalledTimes(2);
  expect(get.mock.calls.some(([url]) => url.includes('/messages/james/'))).toBe(false);
  expect(result.current.conversations).toHaveLength(2);
  act(() => result.current.loadEarlier());
  await waitFor(() => expect(result.current.conversations[0].messages).toHaveLength(3));
  expect(result.current.conversations[0].messages[0].id).toBe('m1');
  act(() => result.current.loadMore());
  await waitFor(() => expect(result.current.conversations).toHaveLength(4));
  expect(get.mock.calls.some(([url]) => url.includes('/messages/sofia/'))).toBe(false);
});

test('aborts an old thread request and ignores its late response', async () => {
  let finishOld!: (value: any) => void;
  let oldSignal!: AbortSignal;
  get.mockImplementation((url: string, options: any) => {
    if (url.includes('/conversations/'))
      return Promise.resolve({ data: { items: summaries.slice(0, 2), nextCursor: null } });
    if (url.includes('/messages/mia/')) {
      oldSignal = options.signal;
      return new Promise((resolve) => {
        finishOld = resolve;
      });
    }
    return Promise.resolve({
      data: { items: schema.default.conversations[1].messages, nextCursor: null },
    });
  });
  const { result, unmount } = renderHook(() => useInboxData(source, filters));
  await waitFor(() => expect(oldSignal).toBeDefined());
  act(() => result.current.selectConversation('james'));
  await waitFor(() => expect(result.current.conversations[1].messages).toHaveLength(1));
  expect(oldSignal.aborted).toBe(true);
  await act(async () =>
    finishOld({
      data: { items: schema.default.conversations[0].messages.slice(0, 2), nextCursor: null },
    }),
  );
  expect(result.current.selected).toBe('james');
  expect(result.current.conversations[0].messages).toHaveLength(0);
  const activeSignal = get.mock.calls[get.mock.calls.length - 1][1].signal;
  unmount();
  expect(activeSignal.aborted).toBe(true);
});

test('keeps message windows bounded and can return to latest history', async () => {
  const data: InboxData = { ...source, source: { ...source.source!, messagePageSize: 100 } };
  get.mockImplementation((url: string) => {
    if (url.includes('/conversations/'))
      return Promise.resolve({ data: { items: summaries.slice(0, 1), nextCursor: null } });
    const page = Number(url.match(/\/(\d+)\.json$/)![1]);
    return Promise.resolve({
      data: {
        items: Array.from({ length: 100 }, (_, n) => ({
          id: `${page}-${n}`,
          direction: 'in',
          text: 'History',
          time: '2026-10-30T10:00:00Z',
        })),
        nextCursor: String(page + 1),
      },
    });
  });
  const { result } = renderHook(() => useInboxData(data, filters));
  await waitFor(() => expect(result.current.conversations[0]?.messages).toHaveLength(100));
  act(() => result.current.loadEarlier());
  await waitFor(() => expect(result.current.conversations[0].messages).toHaveLength(200));
  act(() => result.current.loadEarlier());
  await waitFor(() => expect(result.current.hasNewer).toBe(true));
  expect(result.current.conversations[0].messages).toHaveLength(200);
  act(() => result.current.loadLatest());
  await waitFor(() => expect(result.current.hasNewer).toBe(false));
  expect(result.current.conversations[0].messages).toHaveLength(100);
});

test('exposes load failures without falling back to demo data, and supports retry', async () => {
  get.mockRejectedValueOnce(new Error('offline')).mockImplementation((url: string) =>
    Promise.resolve({
      data: url.includes('/conversations/')
        ? { items: summaries.slice(0, 1), nextCursor: null }
        : { items: schema.default.conversations[0].messages.slice(0, 2), nextCursor: null },
    }),
  );
  const { result } = renderHook(() => useInboxData(source, filters));
  await waitFor(() => expect(result.current.listError).toBe(true));
  expect(result.current.conversations).toHaveLength(0);
  act(() => result.current.retryList());
  await waitFor(() => expect(result.current.conversations[0]?.messages).toHaveLength(2));
  expect(result.current.listError).toBe(false);
});

test('preserves local demo resolutions and replies when filters reload summaries', async () => {
  get.mockImplementation((url: string) =>
    Promise.resolve({
      data: url.includes('/conversations/')
        ? { items: summaries.slice(0, 2), nextCursor: null }
        : { items: schema.default.conversations[0].messages.slice(1).reverse(), nextCursor: null },
    }),
  );
  const { result, rerender } = renderHook(
    ({ status }) => useInboxData(source, { ...filters, status }),
    { initialProps: { status: 'open' } },
  );
  await waitFor(() => expect(result.current.conversations[0]?.messages).toHaveLength(2));
  act(() =>
    result.current.setConversations((items) =>
      items.map((c) =>
        c.id === 'mia'
          ? {
              ...c,
              resolved: true,
              messages: [
                ...c.messages,
                {
                  id: 'local-saved',
                  direction: 'out',
                  text: 'Saved demo reply',
                  time: '2026-10-30T10:30:00Z',
                },
              ],
            }
          : c,
      ),
    ),
  );
  rerender({ status: 'resolved' });
  await waitFor(() =>
    expect(result.current.conversations[0]?.messages.some((m) => m.id === 'local-saved')).toBe(
      true,
    ),
  );
  expect(result.current.conversations).toHaveLength(1);
  expect(result.current.conversations[0].resolved).toBe(true);
});
