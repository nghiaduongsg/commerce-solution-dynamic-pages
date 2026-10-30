import React from 'react';
import { render, testI18n } from './testI18n';
jest.mock('react-i18next', () =>
  jest.requireActual('../../../../node_modules/react-i18next/dist/commonjs/index.js'),
);
jest.mock('i18next', () =>
  jest.requireActual('../../../../node_modules/i18next/dist/cjs/i18next.js'),
);
import '@testing-library/jest-dom';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import Inbox from './Inbox';
import { InboxData } from './schemas/model';
jest.mock('./inbox.css', () => ({}));
jest.mock('axios', () => ({ get: jest.fn(), post: jest.fn(), patch: jest.fn() }));
const get = axios.get as jest.Mock;
const post = axios.post as jest.Mock;
const patch = axios.patch as jest.Mock;
const data: InboxData = {
  workspace: 'Meta',
  source: { mode: 'api', url: '/api/v1/inbox', pageSize: 20, messagePageSize: 30 },
};
const inbound = {
  id: 'm1',
  direction: 'inbound',
  content: 'Customer question',
  created_at: '2026-10-30T01:00:00Z',
};
beforeEach(() => {
  get.mockReset();
  post.mockReset();
  patch.mockReset();
  Object.defineProperty(crypto, 'randomUUID', {
    configurable: true,
    value: () => '11111111-1111-4111-8111-111111111111',
  });
  get.mockImplementation((url: string) =>
    Promise.resolve({
      data: url.endsWith('/connection')
        ? {
            connection: { page_name: 'Real Page', page_id: 'page1' },
            can_reply: true,
            can_manage: true,
            ai_available: true,
          }
        : url.endsWith('/messages')
          ? { messages: [inbound], next_cursor: null }
          : {
              conversations: [
                {
                  id: 'thread1',
                  customer_external_id: 'customer1',
                  customer_name: 'Real Customer',
                  channel: 'messenger',
                  status: 'open',
                  unread: false,
                  preview: inbound,
                },
              ],
              next_cursor: null,
            },
    }),
  );
  patch.mockResolvedValue({ data: { ok: true } });
});
test('enables live replies without a suggested draft, preserves failed text, and adds only confirmed sends', async () => {
  render(<Inbox title="conversations" data={data} />);
  const input = await screen.findByLabelText('Reply to Real Customer');
  await waitFor(() => expect(input).toBeEnabled());
  expect(post).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: 'My reply' } });
  post.mockRejectedValueOnce({ response: { data: { error: { code: 'meta_reply_restricted' } } } });
  fireEvent.click(screen.getByRole('button', { name: 'Send reply' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Meta did not allow this reply');
  expect(input).toHaveValue('My reply');
  expect(within(screen.getByRole('log')).queryByText('My reply')).not.toBeInTheDocument();
  post.mockResolvedValueOnce({
    data: {
      id: 'sent1',
      direction: 'outbound',
      content: 'My reply',
      created_at: '2026-10-30T01:02:00Z',
    },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Send reply' }));
  await waitFor(() => expect(input).toHaveValue(''));
  expect(within(screen.getByRole('log')).getByText('My reply')).toBeInTheDocument();
  expect(post.mock.calls[1][1]).toMatchObject({
    content: 'My reply',
    request_id: expect.any(String),
  });
});
test('keeps the same request key after ambiguous delivery and does not send during drafting', async () => {
  render(<Inbox title="conversations" data={data} />);
  const input = await screen.findByLabelText('Reply to Real Customer');
  await waitFor(() => expect(input).toBeEnabled());
  post.mockRejectedValue({ response: { data: { error: { code: 'send_status_unknown' } } } });
  fireEvent.change(input, { target: { value: 'Check delivery' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send reply' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Delivery is unconfirmed');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Send reply' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Send reply' }));
  await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
  expect(post.mock.calls[0][1].request_id).toBe(post.mock.calls[1][1].request_id);
});
test('disables writes for users with read permission only', async () => {
  const implementation = get.getMockImplementation()!;
  get.mockImplementation((url: string, ...args: any[]) =>
    url.endsWith('/connection')
      ? Promise.resolve({
          data: {
            connection: { page_name: 'Real Page', page_id: 'page1' },
            can_reply: false,
            can_manage: false,
            ai_available: false,
          },
        })
      : implementation(url, ...args),
  );
  render(<Inbox title="conversations" data={data} />);
  expect(await screen.findByLabelText('Reply to Real Customer')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Resolve' })).toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Facebook connection' })).not.toBeInTheDocument();
  expect(post).not.toHaveBeenCalled();
});

test('passes optional employee instructions to AI without sending a customer message', async () => {
  render(<Inbox title="conversations" data={data} />);
  await screen.findByLabelText('Reply to Real Customer');
  const instruction = await screen.findByLabelText('What would you like help with? (optional)');
  await waitFor(() => expect(instruction).toBeEnabled());
  post.mockResolvedValue({ data: { draft: 'Suggested follow-up' } });
  fireEvent.change(instruction, { target: { value: '  Draft a polite follow-up  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Generate reply draft' }));
  await waitFor(() =>
    expect(post).toHaveBeenCalledWith('/api/v1/inbox/thread1/suggestion', {
      prompt: 'Draft a polite follow-up',
    }),
  );
  expect(await screen.findByText('Suggested follow-up')).toBeInTheDocument();
  expect(post).toHaveBeenCalledTimes(1);
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Generate reply draft' })).toBeEnabled(),
  );
  fireEvent.change(instruction, { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Generate reply draft' }));
  await waitFor(() =>
    expect(post).toHaveBeenLastCalledWith('/api/v1/inbox/thread1/suggestion', { prompt: '' }),
  );
});

test('translates the optional instruction field when switching languages', async () => {
  render(<Inbox title="conversations" data={data} />);
  await screen.findByLabelText('What would you like help with? (optional)');
  await act(async () => {
    await testI18n.changeLanguage('VI');
  });
  expect(screen.getByLabelText('Bạn muốn AI hỗ trợ việc gì? (không bắt buộc)')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Soạn xác nhận đơn bánh' })).toBeInTheDocument();
  expect(
    screen.getByPlaceholderText(
      'Ví dụ: gợi ý sản phẩm phù hợp hoặc soạn tin nhắn hỏi thăm lịch sự',
    ),
  ).toBeInTheDocument();
});

test('drafts an order confirmation for review before sending', async () => {
  render(<Inbox title="conversations" data={data} />);
  const reply = await screen.findByLabelText('Reply to Real Customer');
  const instruction = await screen.findByLabelText('What would you like help with? (optional)');
  await waitFor(() => expect(instruction).toBeEnabled());
  fireEvent.change(instruction, { target: { value: 'Include the cake size' } });
  const confirmation =
    'Tên người nhận: Lan\nĐịa chỉ: Chưa có — vui lòng bổ sung\nSố điện thoại liên lạc: Chưa có — vui lòng bổ sung\nThông tin đơn bánh: Bánh kem — 250.000 ₫ × 2\nTổng tiền bánh: 500.000 ₫';
  post.mockResolvedValue({ data: { draft: confirmation } });
  fireEvent.click(screen.getByRole('button', { name: 'Draft order confirmation' }));
  await waitFor(() =>
    expect(post).toHaveBeenCalledWith('/api/v1/inbox/thread1/suggestion', {
      prompt: 'Include the cake size',
      action: 'order_confirmation',
    }),
  );
  await waitFor(() => expect(screen.getByRole('button', { name: 'Use this draft' })).toBeEnabled());
  expect(post).toHaveBeenCalledTimes(1);
  expect(reply).toHaveValue('');
  fireEvent.click(screen.getByRole('button', { name: 'Use this draft' }));
  expect(reply).toHaveValue(confirmation);
  expect(post).toHaveBeenCalledTimes(1);
});
