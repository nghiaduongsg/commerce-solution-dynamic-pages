import React from 'react';
import { act, render } from '@testing-library/react';
import axios from 'axios';
import { useInboxStream } from './useInboxStream';

jest.mock('axios');
const mockedGet = axios.get as jest.Mock;

class FakeWS {
  static instances: FakeWS[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  url: string;
  closed = false;
  constructor(url: string) {
    this.url = url;
    FakeWS.instances.push(this);
  }
  close() {
    this.closed = true;
    this.onclose?.();
  }
}

function Probe(props: { enabled: boolean; baseUrl: string; onRefresh: () => void }) {
  useInboxStream(props);
  return null;
}

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

beforeEach(() => {
  jest.useFakeTimers();
  FakeWS.instances = [];
  (global as unknown as { WebSocket: unknown }).WebSocket = FakeWS;
  mockedGet.mockResolvedValue({ data: { ticket: 'TICKET', expires_in: 30 } });
});
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.resetAllMocks();
});

test('fetches a ticket, opens the stream, and refreshes on a refresh event', async () => {
  const onRefresh = jest.fn();
  render(<Probe enabled baseUrl="/api/v1/inbox" onRefresh={onRefresh} />);

  await act(async () => {
    await flush();
  });
  expect(mockedGet).toHaveBeenCalledWith('/api/v1/inbox/ticket');
  expect(FakeWS.instances).toHaveLength(1);
  expect(FakeWS.instances[0].url).toContain('/api/v1/inbox/stream?ticket=TICKET');

  act(() => FakeWS.instances[0].onopen?.());
  act(() => FakeWS.instances[0].onmessage?.({ data: JSON.stringify({ type: 'refresh' }) }));
  // ping/unknown events never refresh
  act(() => FakeWS.instances[0].onmessage?.({ data: JSON.stringify({ type: 'ping' }) }));
  act(() => jest.advanceTimersByTime(300)); // debounce window
  expect(onRefresh).toHaveBeenCalledTimes(1);
});

test('reconnects after a drop and stops after unmount', async () => {
  const onRefresh = jest.fn();
  const { unmount } = render(<Probe enabled baseUrl="/api/v1/inbox" onRefresh={onRefresh} />);
  await act(async () => {
    await flush();
  });
  expect(FakeWS.instances).toHaveLength(1);

  act(() => FakeWS.instances[0].onopen?.());
  act(() => FakeWS.instances[0].onclose?.()); // server/network drop
  await act(async () => {
    jest.advanceTimersByTime(MaxBackoffAndThen());
    await flush();
  });
  expect(FakeWS.instances.length).toBeGreaterThanOrEqual(2); // a new ticket + socket

  unmount();
  const afterUnmount = FakeWS.instances.length;
  await act(async () => {
    jest.advanceTimersByTime(60_000);
    await flush();
  });
  expect(FakeWS.instances.length).toBe(afterUnmount); // no reconnects after cleanup
});

// The first backoff ceiling is 1s (0.5-1s with jitter); advance comfortably past it.
function MaxBackoffAndThen() {
  return 2_000;
}

test('does not connect when disabled', async () => {
  render(<Probe enabled={false} baseUrl="/api/v1/inbox" onRefresh={jest.fn()} />);
  await act(async () => {
    await flush();
  });
  expect(mockedGet).not.toHaveBeenCalled();
  expect(FakeWS.instances).toHaveLength(0);
});
