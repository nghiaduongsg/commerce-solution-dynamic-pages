jest.mock('react-i18next', () =>
  jest.requireActual('../../../../node_modules/react-i18next/dist/commonjs/index.js'),
);
jest.mock('i18next', () =>
  jest.requireActual('../../../../node_modules/i18next/dist/cjs/i18next.js'),
);
jest.mock('@pkg-setup/src/user/usePermissions', () => ({
  __esModule: true,
  default: jest.fn(() => true),
}));
import React from 'react';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import usePermissions from '@pkg-setup/src/user/usePermissions';
import OrderBoard, { isOrderBoardData } from './OrderBoard';
import { render, testI18n } from './testI18n';

jest.mock('axios');
const api = axios as jest.Mocked<typeof axios>;
const mockUsePermissions = usePermissions as jest.Mock;
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({ useNavigate: () => mockNavigate }));

const data = {
  source: { url: '/api/v1/orders' },
  writePermission: 'Order/WRITE',
  columns: [
    { status: 'draft' as const },
    { status: 'pending' as const },
    { status: 'confirmed' as const },
    { status: 'cancelled' as const },
  ],
};
const orders = [
  {
    id: 'ord-00000001',
    status: 'pending',
    source: 'web',
    currency: 'USD',
    totalAmountMinor: 12500,
    externalReference: 'WEB-1001',
    customerExternalId: 'cust-1',
    createdAt: '2026-10-20T10:00:00Z',
    items: [{ name: 'Cake', sku: 'CK1', quantity: 2 }],
  },
  {
    id: 'ord-00000002',
    status: 'draft',
    source: 'facebook',
    currency: 'USD',
    totalAmountMinor: 4200,
    customerExternalId: 'cust-2',
    createdAt: '2026-10-21T10:00:00Z',
    items: [],
  },
  {
    id: 'ord-00000003',
    status: 'confirmed',
    source: 'web',
    currency: 'USD',
    totalAmountMinor: 99900,
    externalReference: 'WEB-1003',
    createdAt: '2026-10-22T10:00:00Z',
    items: [{ name: 'Box', sku: 'BX', quantity: 1 }],
  },
];
const page = () => render(<OrderBoard title="ordersBoard.title" data={data} />);
beforeEach(() => {
  jest.clearAllMocks();
  mockUsePermissions.mockReturnValue(true);
  api.get.mockResolvedValue({ data: { orders } } as any);
  api.patch.mockResolvedValue({ data: {} } as any);
  api.post.mockResolvedValue({ data: {} } as any);
});

test('validator requires the orders facade, declared lanes, and a string write permission', () => {
  expect(isOrderBoardData(data)).toBe(true);
  expect(isOrderBoardData({ source: { url: '/api/v1/orders' }, columns: [{ status: 'draft' }] })).toBe(true);
  expect(isOrderBoardData({ source: { url: 'https://evil.test' }, columns: [{ status: 'draft' }] })).toBe(false);
  expect(isOrderBoardData({ source: { url: '/api/v1/orders' }, columns: [] })).toBe(false);
  expect(isOrderBoardData({ source: { url: '/api/v1/orders' }, columns: [{ status: 'bogus' }] })).toBe(false);
  expect(
    isOrderBoardData({ source: { url: '/api/v1/orders' }, columns: [{ status: 'draft' }], writePermission: 7 }),
  ).toBe(false);
});

test('loads orders and groups them into status lanes', async () => {
  page();
  expect(await screen.findByText('WEB-1001')).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Draft column, 1 tickets' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Pending column, 1 tickets' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Confirmed column, 1 tickets' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Cancelled column, 0 tickets' })).toBeInTheDocument();
  expect(screen.getByText('Showing 3 of 3')).toBeInTheDocument();
  expect(screen.getByText('$125.00')).toBeInTheDocument();
});

test('uses the item count from the list payload when items are not loaded', async () => {
  api.get.mockReset();
  api.get.mockResolvedValue({ data: { orders: [{ ...orders[0], itemCount: 7, items: [] }] } } as any);
  page();
  expect(await screen.findByText('7 items')).toBeInTheDocument();
});

test('search filters the loaded tickets without refetching', async () => {
  page();
  await screen.findByText('WEB-1001');
  fireEvent.change(screen.getByLabelText('Search tickets'), { target: { value: 'WEB-1003' } });
  expect(screen.queryByText('WEB-1001')).not.toBeInTheDocument();
  expect(screen.getByText('WEB-1003')).toBeInTheDocument();
  expect(screen.getByText('Showing 1 of 3')).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledTimes(1);
});

test('source filter narrows to one channel', async () => {
  page();
  await screen.findByText('WEB-1001');
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Source' }));
  fireEvent.click(await screen.findByRole('option', { name: 'facebook' }));
  await waitFor(() => expect(screen.queryByText('WEB-1001')).not.toBeInTheDocument());
  expect(screen.getByText('Showing 1 of 3')).toBeInTheDocument();
});

test('moving a ticket persists the new status and announces the move', async () => {
  page();
  await screen.findByText('WEB-1001');
  fireEvent.click(screen.getByRole('button', { name: 'Move ticket WEB-1001' }));
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Confirmed' }));
  expect(screen.getByRole('region', { name: 'Confirmed column, 2 tickets' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Pending column, 0 tickets' })).toBeInTheDocument();
  expect(screen.getByText('Moved WEB-1001 to Confirmed')).toBeInTheDocument();
  expect(api.patch).toHaveBeenCalledWith('/api/v1/orders/ord-00000001', { status: 'confirmed' });
});

test('a failed save rolls the ticket back to its original lane and reports it', async () => {
  api.patch.mockReset();
  api.patch.mockRejectedValueOnce(new Error('forbidden'));
  page();
  await screen.findByText('WEB-1001');
  fireEvent.click(screen.getByRole('button', { name: 'Move ticket WEB-1001' }));
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Confirmed' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Could not save WEB-1001. The change was reverted.',
  );
  expect(screen.getByRole('region', { name: 'Pending column, 1 tickets' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Confirmed column, 1 tickets' })).toBeInTheDocument();
});

test('dragging a card onto a lane moves it there', async () => {
  page();
  await screen.findByText('WEB-1001');
  const card = screen
    .getByRole('button', { name: 'Open order WEB-1001' })
    .closest('[draggable="true"]')!;
  const target = screen.getByRole('region', { name: /Cancelled column/ });
  const dataTransfer = { getData: () => 'ord-00000001', setData: jest.fn(), effectAllowed: '' };
  fireEvent.dragStart(card, { dataTransfer });
  fireEvent.dragOver(target, { dataTransfer });
  fireEvent.drop(target, { dataTransfer });
  expect(screen.getByRole('region', { name: 'Cancelled column, 1 tickets' })).toBeInTheDocument();
  expect(api.patch).toHaveBeenCalledWith('/api/v1/orders/ord-00000001', { status: 'cancelled' });
});

test('read-only users cannot move tickets', async () => {
  mockUsePermissions.mockReturnValue(false);
  page();
  await screen.findByText('WEB-1001');
  expect(screen.queryByRole('button', { name: 'Move ticket WEB-1001' })).not.toBeInTheDocument();
  expect(
    screen.getByText('You have read-only access — order status can’t be changed here.'),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Open order WEB-1001' }).closest('[draggable="true"]'),
  ).toBeNull();
  expect(screen.queryByRole('button', { name: 'Create order' })).not.toBeInTheDocument();
  expect(api.patch).not.toHaveBeenCalled();
});

test('creating an order posts it and refreshes the board', async () => {
  page();
  await screen.findByText('WEB-1001');
  fireEvent.click(screen.getByRole('button', { name: 'Create order' }));
  const dialog = await screen.findByRole('dialog');
  fireEvent.change(within(dialog).getByLabelText('Item'), { target: { value: 'Latte' } });
  fireEvent.change(within(dialog).getByLabelText('Unit price'), { target: { value: '4.50' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Create' }));
  await waitFor(() => expect(api.post).toHaveBeenCalled());
  expect(api.post).toHaveBeenCalledWith(
    '/api/v1/orders',
    expect.objectContaining({
      currency: 'USD',
      items: [expect.objectContaining({ name: 'Latte', quantity: 1, unit_price_minor: 450 })],
    }),
  );
  await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
});

test('create requires at least one named item', async () => {
  page();
  await screen.findByText('WEB-1001');
  fireEvent.click(screen.getByRole('button', { name: 'Create order' }));
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Create' }));
  expect(
    within(dialog).getByText('Add at least one item with a name and quantity.'),
  ).toBeInTheDocument();
  expect(api.post).not.toHaveBeenCalled();
});

test('opening a ticket navigates to its detail page', async () => {
  page();
  await screen.findByText('WEB-1001');
  fireEvent.click(screen.getByRole('button', { name: 'Open order WEB-1001' }));
  expect(mockNavigate).toHaveBeenCalledWith('/page/Order/ord-00000001');
});

test('shows an error with retry and recovers on reload', async () => {
  api.get.mockReset();
  api.get.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce({ data: { orders } } as any);
  page();
  expect(await screen.findByText('Could not load orders.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('WEB-1001')).toBeInTheDocument();
});

test('shows an empty state when there are no orders', async () => {
  api.get.mockReset();
  api.get.mockResolvedValue({ data: { orders: [] } } as any);
  page();
  expect(await screen.findByText('No orders yet.')).toBeInTheDocument();
});

test('lane labels and controls switch language', async () => {
  page();
  await screen.findByText('WEB-1001');
  await act(async () => {
    await testI18n.changeLanguage('VI');
  });
  expect(screen.getByRole('region', { name: /Chờ xử lý/ })).toBeInTheDocument();
  expect(screen.getByLabelText('Tìm phiếu')).toBeInTheDocument();
});
