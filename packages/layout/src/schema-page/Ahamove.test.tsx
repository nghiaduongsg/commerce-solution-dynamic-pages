jest.mock('react-i18next', () =>
  jest.requireActual('../../../../node_modules/react-i18next/dist/commonjs/index.js'),
);
jest.mock('i18next', () =>
  jest.requireActual('../../../../node_modules/i18next/dist/cjs/i18next.js'),
);
import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Ahamove, { isAhamoveData, safeTrackingLink } from './Ahamove';
import { render, testI18n } from './testI18n';
jest.mock('axios');
const api = axios as jest.Mocked<typeof axios>;
const page = () =>
  render(<Ahamove title="ahamove.title" data={{ source: { url: '/api/v1/ahamove/orders' } }} />);
beforeEach(() => jest.resetAllMocks());

test('requires a local facade and rejects unsafe tracking URLs', () => {
  expect(isAhamoveData({ source: { url: '/api/v1/ahamove/orders' } })).toBe(true);
  expect(isAhamoveData({ source: { url: 'https://other.test' } })).toBe(false);
  expect(safeTrackingLink('javascript:alert(1)')).toBeUndefined();
  expect(safeTrackingLink('https://express.ahamove.com.evil.test')).toBeUndefined();
  expect(safeTrackingLink('https://express.ahamove.com/s/ABC')).toContain('/s/ABC');
});

async function fillDelivery() {
  for (const [label, values] of [
    ['Contact name', ['Sender', 'Recipient']],
    ['Phone number', ['0901234567', '0907654321']],
  ] as const)
    screen
      .getAllByLabelText(new RegExp(label))
      .forEach((input, i) => fireEvent.change(input, { target: { value: values[i] } }));
  for (let i = 0; i < 2; i++) {
    const address = i === 0 ? 'Pickup address' : 'Delivery address';
    api.get.mockResolvedValueOnce({
      data: { items: [{ id: String(i), address, lat: 10.7 + i / 10, lng: 106.6 + i / 10 }] },
    });
    fireEvent.change(screen.getAllByLabelText(/Full address/)[i], { target: { value: address } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Search locations' })[i]);
    fireEvent.click(await screen.findByRole('button', { name: address }));
  }
}
const estimateResponse = {
  data: [{ service_id: 'SGN-BIKE', data: { total_price: 33000, total_fee: 33000 } }],
};

test('shows a quote with selected coordinates before explicit booking confirmation', async () => {
  api.post
    .mockResolvedValueOnce(estimateResponse)
    .mockResolvedValueOnce({ data: { order_id: 'ABC', status: 'ASSIGNING', order: {} } });
  page();
  await fillDelivery();
  fireEvent.click(screen.getByRole('button', { name: 'Get delivery price' }));
  await screen.findByRole('button', { name: 'Review booking' });
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(api.post).toHaveBeenCalledWith(
    '/api/v1/ahamove/orders/estimates',
    expect.objectContaining({
      services: [{ _id: 'SGN-BIKE', requests: [] }],
      path: [
        expect.objectContaining({ lat: 10.7, lng: 106.6 }),
        expect.objectContaining({ cod: 0, lat: expect.any(Number), lng: expect.any(Number) }),
      ],
    }),
  );
  expect(
    screen.getByText(
      new Intl.NumberFormat('en', { style: 'currency', currency: 'VND' }).format(33000),
    ),
  ).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Review booking' }));
  expect(api.post).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Confirm and book delivery' }));
  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith(
      '/api/v1/ahamove/orders',
      expect.objectContaining({
        order_time: 0,
        service_id: 'SGN-BIKE',
        requests: [],
        path: [
          expect.objectContaining({ name: 'Sender', lat: 10.7 }),
          expect.objectContaining({ name: 'Recipient', cod: 0 }),
        ],
      }),
    ),
  );
  expect(await screen.findByText('ABC')).toBeVisible();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Get delivery price' })).toBeDisabled(), { timeout: 5000 });
});

test('typed addresses alone cannot be priced or booked', async () => {
  page();
  screen
    .getAllByLabelText(/Full address/)
    .forEach((input, i) =>
      fireEvent.change(input, { target: { value: 'Unselected address ' + i } }),
    );
  screen
    .getAllByLabelText(/Contact name/)
    .forEach((input) => fireEvent.change(input, { target: { value: 'Contact' } }));
  screen
    .getAllByLabelText(/Phone number/)
    .forEach((input) => fireEvent.change(input, { target: { value: '0901234567' } }));
  fireEvent.click(screen.getByRole('button', { name: 'Get delivery price' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Select a search result');
  expect(api.post).not.toHaveBeenCalled();
});

test('changing an address clears its selection and invalidates the quote', async () => {
  api.post.mockResolvedValueOnce(estimateResponse);
  page();
  await fillDelivery();
  fireEvent.click(screen.getByRole('button', { name: 'Get delivery price' }));
  await screen.findByRole('button', { name: 'Review booking' });
  fireEvent.change(screen.getAllByLabelText(/Full address/)[0], {
    target: { value: 'Another address' },
  });
  expect(screen.queryByRole('button', { name: 'Review booking' })).not.toBeInTheDocument();
  expect(screen.getAllByText('Location selected')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Get delivery price' }));
  await screen.findByText(/Select a search result/);
  expect(api.post).toHaveBeenCalledTimes(1);
});

test('an unsuccessful estimate never enables booking', async () => {
  api.post.mockResolvedValueOnce({ data: [{ service_id: 'SGN-BIKE', error: 'NOT_AVAILABLE' }] });
  page();
  await fillDelivery();
  fireEvent.click(screen.getByRole('button', { name: 'Get delivery price' }));
  expect(await screen.findByText(/Unable to price/)).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Review booking' })).not.toBeInTheDocument();
});

test('cancellation requires confirmation and sends a reason', async () => {
  api.get.mockResolvedValue({ data: { _id: 'ABC', status: 'ACCEPTED' } });
  api.delete.mockResolvedValue({ data: {} });
  page();
  fireEvent.change(screen.getByLabelText(/Ahamove order ID/), { target: { value: 'ABC' } });
  fireEvent.click(screen.getByRole('button', { name: 'Refresh status' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Cancel delivery' }));
  expect(api.delete).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Confirm cancellation' })).toBeDisabled();
  fireEvent.change(screen.getByLabelText(/Cancellation reason/), {
    target: { value: 'Customer requested cancellation' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Confirm cancellation' }));
  await waitFor(() =>
    expect(api.delete).toHaveBeenCalledWith('/api/v1/ahamove/orders/ABC', {
      data: { comment: 'Customer requested cancellation' },
    }),
  );
  expect(await screen.findByText('Delivery cancelled.')).toBeVisible();
});

test('completed deliveries cannot be cancelled and labels switch languages', async () => {
  api.get.mockResolvedValue({ data: { _id: 'ABC', status: 'COMPLETED' } });
  page();
  fireEvent.change(screen.getByLabelText(/Ahamove order ID/), { target: { value: 'ABC' } });
  fireEvent.click(screen.getByRole('button', { name: 'Refresh status' }));
  expect(await screen.findByRole('button', { name: 'Cancel delivery' })).toBeDisabled();
  await act(async () => {
    await testI18n.changeLanguage('VI');
  });
  expect(screen.getByRole('button', { name: 'Làm mới trạng thái' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Giao hàng Ahamove' })).toBeVisible();
});

test('missing configuration stays visible without fake order data', async () => {
  api.get.mockRejectedValue({ response: { status: 503 } });
  page();
  fireEvent.change(screen.getByLabelText(/Ahamove order ID/), { target: { value: 'ABC' } });
  fireEvent.click(screen.getByRole('button', { name: 'Refresh status' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('not connected');
});

test('editing a location ignores an obsolete search response', async () => {
  let resolve: (value: any) => void = () => {};
  api.get.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  page();
  fireEvent.change(screen.getAllByLabelText(/Full address/)[0], {
    target: { value: 'Old address' },
  });
  fireEvent.click(screen.getAllByRole('button', { name: 'Search locations' })[0]);
  fireEvent.change(screen.getAllByLabelText(/Full address/)[0], {
    target: { value: 'New address' },
  });
  await act(async () =>
    resolve({ data: { items: [{ id: 'old', address: 'Old result', lat: 10, lng: 106 }] } }),
  );
  expect(screen.queryByRole('button', { name: 'Old result' })).not.toBeInTheDocument();
});

test('expired quotes cannot be confirmed', async () => {
  api.post.mockResolvedValueOnce(estimateResponse);
  page();
  await fillDelivery();
  fireEvent.click(screen.getByRole('button', { name: 'Get delivery price' }));
  await screen.findByRole('button', { name: 'Review booking' });
  const now = Date.now();
  const time = jest.spyOn(Date, 'now').mockReturnValue(now + 120001);
  try {
    // Opening the review after expiry must reject the stale estimate.
    fireEvent.click(screen.getByRole('button', { name: 'Review booking' }));
    expect(screen.queryByRole('button', { name: 'Review booking' })).not.toBeInTheDocument();
    expect(api.post).toHaveBeenCalledTimes(1);
  } finally {
    time.mockRestore();
  }
});

