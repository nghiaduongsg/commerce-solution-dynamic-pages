import React from 'react';
import { render, testI18n } from './testI18n';
jest.mock('react-i18next', () =>
  jest.requireActual('../../../../node_modules/react-i18next/dist/commonjs/index.js'),
);
jest.mock('i18next', () =>
  jest.requireActual('../../../../node_modules/i18next/dist/cjs/i18next.js'),
);
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from './Dashboard';

let mockMenu = [{ id: 'Order', code: 'Order' }];
const mockNavigate = jest.fn();
jest.mock('react-redux', () => ({
  useSelector: (selector) => selector({ Menu: { items: mockMenu } }),
}));
jest.mock('react-router', () => ({ useNavigate: () => mockNavigate }));
const data = {
  cards: [
    { id: 'Order', title: 'Orders', path: '/page/Order/list', description: 'Open orders' },
    { id: 'Store', title: 'Store profile', path: '/page/Store/list', description: 'Open store' },
  ],
};
beforeEach(() => {
  mockMenu = [{ id: 'Order', code: 'Order' }];
  mockNavigate.mockClear();
});

test('preserves visibility from the host navigation menu', () => {
  render(<Dashboard title="Workspace" data={data} />);
  expect(screen.getByText('Orders')).toBeInTheDocument();
  expect(screen.queryByText('Store profile')).not.toBeInTheDocument();
});

test('renders owner cards when present in the host menu and navigates from the schema', async () => {
  mockMenu.push({ id: 'Store', code: 'Store' });
  render(<Dashboard title="Workspace" data={data} />);
  await userEvent.click(screen.getByRole('button', { name: /Store profile/ }));
  expect(mockNavigate).toHaveBeenCalledWith('/page/Store/list');
});

test('translates schema card labels after a language change', async () => {
  const { act } = await import('@testing-library/react');
  render(
    <Dashboard
      title="workspaceTest:inbox.title"
      data={{ cards: [{ ...data.cards[0], title: 'workspaceTest:orders' }] }}
    />,
  );
  expect(screen.getByText('Orders')).toBeInTheDocument();
  await act(async () => {
    await testI18n.changeLanguage('VI');
  });
  expect(screen.getByText('Đơn hàng')).toBeInTheDocument();
  expect(screen.queryByText('Orders')).not.toBeInTheDocument();
});
