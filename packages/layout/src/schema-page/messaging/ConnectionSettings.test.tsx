import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
jest.mock('i18next', () =>
  jest.requireActual('../../../../../node_modules/i18next/dist/cjs/i18next.js'),
);
jest.mock('react-i18next', () =>
  jest.requireActual('../../../../../node_modules/react-i18next/dist/commonjs/index.js'),
);
jest.mock('axios');
jest.mock('./facebookLogin', () => ({
  prepareFacebook: jest.fn(() => Promise.resolve()),
  loginFacebook: jest.fn(),
}));
import { render, testI18n } from '../testI18n';
import ConnectionSettings from './ConnectionSettings';
import { loginFacebook } from './facebookLogin';
const get = axios.get as jest.Mock;
const post = axios.post as jest.Mock;
const login = loginFacebook as jest.Mock;
beforeEach(() => {
  jest.clearAllMocks();
  get.mockResolvedValue({ data: { app_id: 'app', version: 'v21.0' } });
});
test('login opens Page picker and saves only the selected opaque handle', async () => {
  login.mockResolvedValue('short-lived');
  post.mockResolvedValue({
    data: {
      pages: [
        { id: '1', name: 'First Shop', ticket: 'opaque-1' },
        { id: '2', name: 'Second Shop', ticket: 'opaque-2' },
      ],
    },
  });
  const save = jest.fn(() => Promise.resolve(true)),
    close = jest.fn();
  render(<ConnectionSettings baseUrl="/inbox" busy={false} onSave={save} onClose={close} />);
  const button = await screen.findByRole('button', { name: 'Connect with Facebook' });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  expect(login).toHaveBeenCalledTimes(1);
  fireEvent.change(await screen.findByLabelText('Facebook Page'), { target: { value: '2' } });
  fireEvent.submit(screen.getByLabelText('Facebook Page').closest('form')!);
  await waitFor(() => expect(save).toHaveBeenCalledWith('2', 'opaque-2'));
  await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
});
test('cancelled login does not exchange or persist credentials', async () => {
  login.mockRejectedValue(new Error('login_cancelled'));
  const save = jest.fn();
  render(<ConnectionSettings baseUrl="/inbox" busy={false} onSave={save} onClose={jest.fn()} />);
  const button = screen.getByRole('button', { name: 'Connect with Facebook' });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  expect(await screen.findByRole('alert')).toHaveTextContent('cancelled');
  expect(post).not.toHaveBeenCalled();
  expect(save).not.toHaveBeenCalled();
});
test('Vietnamese login controls and empty Page state', async () => {
  await testI18n.changeLanguage('VI');
  login.mockResolvedValue('short-lived');
  post.mockResolvedValue({ data: { pages: [] } });
  render(
    <ConnectionSettings baseUrl="/inbox" busy={false} onSave={jest.fn()} onClose={jest.fn()} />,
  );
  const button = screen.getByRole('button', { name: 'Kết nối với Facebook' });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  expect(await screen.findByRole('alert')).toHaveTextContent('Không tìm thấy Trang phù hợp');
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
});

test('pasted token lists Pages to choose from when Facebook login is not configured', async () => {
  get.mockRejectedValue({ response: { data: { error: { code: 'facebook_not_configured' } } } });
  post.mockResolvedValue({
    data: {
      pages: [
        { id: '1', name: 'First Shop', ticket: 'opaque-1' },
        { id: '2', name: 'Second Shop', ticket: 'opaque-2' },
      ],
    },
  });
  const save = jest.fn(() => Promise.resolve(true));
  const close = jest.fn();
  render(<ConnectionSettings baseUrl="/inbox" busy={false} onSave={save} onClose={close} />);
  await screen.findByRole('alert');
  fireEvent.click(screen.getByText('Enter access token manually'));
  expect(screen.queryByLabelText('Facebook Page ID')).not.toBeInTheDocument();
  const input = screen.getByLabelText('Facebook access token');
  expect(input).toHaveAttribute('type', 'password');
  fireEvent.change(input, { target: { value: '  test-user-token  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Find Pages' }));
  expect(post).toHaveBeenCalledWith('/inbox/connection/pages', {
    access_token: 'test-user-token',
  });
  fireEvent.change(await screen.findByLabelText('Facebook Page'), { target: { value: '2' } });
  expect(input).toHaveValue('');
  fireEvent.submit(screen.getByLabelText('Facebook Page').closest('form')!);
  await waitFor(() => expect(save).toHaveBeenCalledWith('2', 'opaque-2'));
  await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
  expect(login).not.toHaveBeenCalled();
});
test('rejected pasted token shows an error and no Page picker', async () => {
  await testI18n.changeLanguage('VI');
  post.mockRejectedValue({ response: { data: { error: { code: 'meta_rejected' } } } });
  const save = jest.fn();
  render(<ConnectionSettings baseUrl="/inbox" busy={false} onSave={save} onClose={jest.fn()} />);
  fireEvent.click(screen.getByText('Nhập mã truy cập thủ công'));
  fireEvent.change(screen.getByLabelText('Mã truy cập Facebook'), { target: { value: 'bad' } });
  fireEvent.click(screen.getByRole('button', { name: 'Tìm Trang' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Không thể tải Trang bằng mã này');
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(save).not.toHaveBeenCalled();
});
