import React from 'react';
import { render } from './testI18n';
jest.mock('react-i18next', () =>
  jest.requireActual('../../../../node_modules/react-i18next/dist/commonjs/index.js'),
);
jest.mock('i18next', () =>
  jest.requireActual('../../../../node_modules/i18next/dist/cjs/i18next.js'),
);
import '@testing-library/jest-dom';
import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Inbox from './Inbox';
import schema from './__fixtures__/inbox.schema.json';
import { isInboxData } from './schemas/pageDefinitions';
const data = schema.default;
if (!isInboxData(data)) throw new Error('Invalid inbox test fixture');

jest.mock('./inbox.css', () => ({}));

test('filters conversations by channel, query and status', async () => {
  const user = userEvent.setup();
  render(<Inbox title={schema.title} description={schema.description} data={data} />);
  const list = screen.getByRole('complementary', { name: 'Conversations' });
  await user.selectOptions(screen.getByLabelText('Filter by channel'), 'Messenger');
  expect(within(list).getByText('James Wilson')).toBeInTheDocument();
  expect(within(list).queryByText('Mia Chen')).not.toBeInTheDocument();
  await user.type(screen.getByLabelText('Search conversations'), 'nothing matches');
  expect(within(list).getByText('No conversations found')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Clear search' }));
  await user.selectOptions(screen.getByLabelText('Filter by channel'), 'All channels');
  await user.click(screen.getByRole('button', { name: 'Resolved' }));
  expect(within(list).getByText('Ava Thompson')).toBeInTheDocument();
});

test('keeps unsent replies attached to the correct conversation', async () => {
  const user = userEvent.setup();
  render(<Inbox title={schema.title} description={schema.description} data={data} />);
  await user.type(screen.getByLabelText('Reply to Mia Chen'), 'A private draft for Mia');
  await user.click(screen.getByRole('button', { name: /James Wilson.*Order update/ }));
  expect(screen.getByLabelText('Reply to James Wilson')).toHaveValue('');
  await user.click(screen.getByRole('button', { name: /Mia Chen.*Product question/ }));
  expect(screen.getByLabelText('Reply to Mia Chen')).toHaveValue('A private draft for Mia');
});

test('inserts a sample draft for review and sends only within the demo', async () => {
  const user = userEvent.setup();
  const request = jest.spyOn(XMLHttpRequest.prototype, 'open');
  render(<Inbox title={schema.title} description={schema.description} data={data} />);
  await user.click(await screen.findByRole('button', { name: /Use this draft/ }));
  const reply = screen.getByLabelText('Reply to Mia Chen') as HTMLTextAreaElement;
  expect(reply.value).toContain('Which city would we be shipping to?');
  const text = reply.value;
  await user.click(screen.getByRole('button', { name: /Send reply/ }));
  expect(within(screen.getByRole('log')).getByText(text)).toBeInTheDocument();
  expect(reply).toHaveValue('');
  expect(screen.getByRole('status')).toHaveTextContent('No message was sent to Meta');
  expect(request).not.toHaveBeenCalled();
  request.mockRestore();
});

test('blocks replies while resolved and allows reopening', async () => {
  const user = userEvent.setup();
  render(<Inbox title={schema.title} description={schema.description} data={data} />);
  await user.click(screen.getByRole('button', { name: 'Resolve' }));
  expect(screen.getByLabelText('Reply to Mia Chen')).toBeDisabled();
  expect(screen.getByRole('button', { name: /Send reply/ })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Reopen' }));
  expect(screen.getByLabelText('Reply to Mia Chen')).toBeEnabled();
});

test('does not send during input method composition or for whitespace', () => {
  render(<Inbox title={schema.title} description={schema.description} data={data} />);
  const reply = screen.getByLabelText('Reply to Mia Chen');
  fireEvent.change(reply, { target: { value: '   ' } });
  expect(screen.getByRole('button', { name: /Send reply/ })).toBeDisabled();
  fireEvent.change(reply, { target: { value: 'Composing' } });
  fireEvent.keyDown(reply, { key: 'Enter', isComposing: true });
  expect(reply).toHaveValue('Composing');
  fireEvent.keyDown(reply, { key: 'Enter' });
  expect(reply).toHaveValue('');
});
