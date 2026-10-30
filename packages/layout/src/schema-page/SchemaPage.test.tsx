import React from 'react';
import { render, testI18n } from './testI18n';
jest.mock('react-i18next', () =>
  jest.requireActual('../../../../node_modules/react-i18next/dist/commonjs/index.js'),
);
jest.mock('i18next', () =>
  jest.requireActual('../../../../node_modules/i18next/dist/cjs/i18next.js'),
);
import { screen } from '@testing-library/react';
import SchemaPage from './SchemaPage';
import schema from './__fixtures__/inbox.schema.json';
import { isDashboardData, isInboxData } from './schemas/pageDefinitions';
import { formatMessageTime } from './translations';

jest.mock('./Dashboard', () => () => <div>Shared dashboard</div>);
jest.mock('./inbox.css', () => ({}));
const uiSchema = { 'ui:page': { id: 'Inbox', component: 'inbox' } };

test('renders inbox from a JSON definition through the public renderer', async () => {
  render(<SchemaPage schema={schema} uiSchema={uiSchema} />);
  expect(await screen.findByRole('heading', { name: 'Inbox', level: 1 })).toBeInTheDocument();
  expect(screen.getByLabelText('Reply to Mia Chen')).toBeInTheDocument();
  expect(document.title).toBe('Inbox');
  expect(await screen.findByRole('log')).toHaveTextContent(
    formatMessageTime(schema.default.conversations[0].messages[0].time, 'EN'),
  );
});

test('uses page copy and workspace supplied by the host schema', async () => {
  render(
    <SchemaPage
      schema={{
        ...schema,
        title: 'Support',
        description: 'Our customers',
        default: { ...schema.default, workspace: 'Another Store' },
      }}
      uiSchema={uiSchema}
    />,
  );
  expect(await screen.findByRole('heading', { name: 'Support' })).toBeInTheDocument();
  expect(screen.getByText('Our customers')).toBeInTheDocument();
  expect(screen.getAllByText('Another Store').length).toBeGreaterThan(0);
});

test('handles an empty inbox without assuming a fixture customer', async () => {
  render(
    <SchemaPage
      schema={{ title: 'Empty inbox', default: { workspace: 'Store', conversations: [] } }}
      uiSchema={uiSchema}
    />,
  );
  expect(await screen.findByText('No conversations yet.')).toBeInTheDocument();
});

test.each(['unknown', 'dashboard'])('rejects incompatible %s definitions', (component) => {
  render(<SchemaPage schema={schema} uiSchema={{ 'ui:page': { id: 'Bad', component } }} />);
  expect(screen.getByRole('alert')).toHaveTextContent('invalid page configuration');
});

test('rejects malformed messages and duplicate conversation ids', () => {
  expect(
    isInboxData({
      workspace: 'Store',
      conversations: [{ ...schema.default.conversations[0], messages: [{ id: 7 }] }],
    }),
  ).toBe(false);
  expect(
    isInboxData({
      workspace: 'Store',
      conversations: [schema.default.conversations[0], schema.default.conversations[0]],
    }),
  ).toBe(false);
  expect(
    isInboxData({
      workspace: 'Store',
      conversations: [
        {
          ...schema.default.conversations[0],
          messages: [{ id: 'bad', direction: 'unknown', time: 'Now', text: 'Hello' }],
        },
      ],
    }),
  ).toBe(false);
  expect(
    isDashboardData({
      cards: [{ id: 'bad', title: 'Bad', description: 'Bad', path: '//outside.example' }],
    }),
  ).toBe(false);
});

test('updates labels, accessibility text and document title when language changes', async () => {
  const { act } = await import('@testing-library/react');
  render(<SchemaPage schema={schema} uiSchema={uiSchema} />);
  await act(async () => {
    await testI18n.changeLanguage('VI');
  });
  expect(screen.getByRole('heading', { name: 'Hộp thư', level: 1 })).toBeInTheDocument();
  expect(document.title).toBe('Hộp thư');
  expect(screen.getByLabelText('Trả lời Mia Chen')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Giải quyết' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Gửi trả lời' })).toBeInTheDocument();
  expect(screen.getByRole('complementary', { name: 'Hội thoại' })).toBeInTheDocument();
  expect(screen.getByText('Đã tải 5 hội thoại', { exact: true })).toBeInTheDocument();
});
test('keeps a pending notification translatable after switching language', async () => {
  const { act, fireEvent } = await import('@testing-library/react');
  render(<SchemaPage schema={schema} uiSchema={uiSchema} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Use this draft' }));
  await act(async () => {
    await testI18n.changeLanguage('VI');
  });
  expect(screen.getByRole('status')).toHaveTextContent('Đã thêm câu trả lời mẫu');
  expect(screen.getByLabelText('Trả lời Mia Chen')).toHaveValue(
    schema.default.conversations[0].draft,
  );
});
test('uses plural forms and locale-aware time formatting', () => {
  expect(testI18n.t('conversationCount', { count: 1 })).toBe('1 conversation');
  expect(testI18n.t('conversationCount', { count: 2 })).toBe('2 conversations');
});
