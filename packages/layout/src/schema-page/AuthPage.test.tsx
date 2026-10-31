import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
jest.mock('react-i18next', () =>
  jest.requireActual('../../../../node_modules/react-i18next/dist/commonjs/index.js'),
);
jest.mock('i18next', () =>
  jest.requireActual('../../../../node_modules/i18next/dist/cjs/i18next.js'),
);
import AuthPage from './AuthPage';
import { AuthActionError, AuthAdapter, AuthAdapterProvider } from './auth/AuthAdapter';
import { AuthData } from './schemas/auth';
import { render, testI18n } from './testI18n';

const loginData: AuthData = {
  mode: 'login',
  alternatePath: '/signup',
  brand: 'auth.firebaseNote',
  eyebrow: 'auth.firebaseNote',
  featureKeys: ['auth.firebaseNote'],
};
const signupData: AuthData = { ...loginData, mode: 'signup', alternatePath: '/login' };

function createAdapter(): jest.Mocked<AuthAdapter> {
  return {
    login: jest.fn().mockResolvedValue(undefined),
    signup: jest.fn().mockResolvedValue(undefined),
  };
}

function renderAuthPage(data: AuthData, adapter = createAdapter()) {
  render(
    <MemoryRouter>
      <AuthAdapterProvider adapter={adapter}>
        <AuthPage
          title={data.mode === 'signup' ? 'auth.createAccount' : 'auth.login'}
          data={data}
        />
      </AuthAdapterProvider>
    </MemoryRouter>,
  );
  return adapter;
}

function enterLoginCredentials() {
  fireEvent.change(screen.getByLabelText('Email address'), {
    target: { value: 'owner@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret12' } });
}

test('validates login fields and translates adapter failures', async () => {
  const adapter = createAdapter();
  adapter.login.mockRejectedValue(new AuthActionError('invalidCredentials'));
  renderAuthPage(loginData, adapter);

  fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
  expect(screen.getAllByText('This field is required.')).toHaveLength(2);
  expect(adapter.login).not.toHaveBeenCalled();

  enterLoginCredentials();
  fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('The email or password is incorrect.');
});

test('passes normalized login credentials through the adapter', async () => {
  const adapter = renderAuthPage(loginData);
  fireEvent.change(screen.getByLabelText('Email address'), {
    target: { value: '  owner@example.com  ' },
  });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret12' } });
  fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

  await waitFor(() =>
    expect(adapter.login).toHaveBeenCalledWith({
      email: 'owner@example.com',
      password: 'secret12',
    }),
  );
});

test('shows the activation state when Firebase login lacks a provisioned commerce account', async () => {
  const adapter = createAdapter();
  adapter.login.mockRejectedValue(new AuthActionError('accountPending'));
  renderAuthPage(loginData, adapter);
  enterLoginCredentials();
  fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

  expect(
    await screen.findByText('Your commerce access is awaiting activation'),
  ).toBeInTheDocument();
  expect(screen.getByText(/administrator must activate your commerce access/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Return to login' }));
  expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
});

test('disables login while the adapter request is pending', async () => {
  let finishLogin: () => void = () => undefined;
  const adapter = createAdapter();
  adapter.login.mockImplementation(() => new Promise<void>((resolve) => (finishLogin = resolve)));
  renderAuthPage(loginData, adapter);
  enterLoginCredentials();
  fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

  expect(await screen.findByRole('button', { name: 'Please wait…' })).toBeDisabled();
  await act(async () => finishLogin());
});

test('validates signup confirmation and shows the activation state after success', async () => {
  const adapter = renderAuthPage(signupData);
  fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Store Owner' } });
  fireEvent.change(screen.getByLabelText('Email address'), {
    target: { value: 'owner@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret12' } });
  fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'different' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
  expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
  expect(adapter.signup).not.toHaveBeenCalled();

  fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'secret12' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

  await waitFor(() =>
    expect(adapter.signup).toHaveBeenCalledWith({
      displayName: 'Store Owner',
      email: 'owner@example.com',
      password: 'secret12',
    }),
  );
  expect(await screen.findByText('Your Firebase account was created')).toBeInTheDocument();
  expect(screen.getByText(/administrator must activate your commerce access/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Return to login' })).toHaveAttribute('href', '/login');
});

test('updates the signup experience when the workspace language changes', async () => {
  renderAuthPage(signupData);
  await act(async () => {
    await testI18n.changeLanguage('VI');
  });

  expect(screen.getByRole('heading', { name: 'Tạo tài khoản' })).toBeInTheDocument();
  expect(screen.getByLabelText('Tên của bạn')).toBeInTheDocument();
  expect(screen.getByLabelText('Địa chỉ email')).toBeInTheDocument();
  expect(screen.getByLabelText('Xác nhận mật khẩu')).toBeInTheDocument();
});
