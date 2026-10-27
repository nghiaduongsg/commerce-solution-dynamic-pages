import React, { ReactNode } from 'react';
import { cleanup, renderHook } from '@testing-library/react';
import useNavigationGuard from './useNavigationGuard';
import { useBlocker, MemoryRouter } from 'react-router';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useBlocker: jest.fn(),
}));

const mockedUseBlocker = useBlocker as jest.Mock;

const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

let originalWindow: object;

beforeAll(() => {
  originalWindow = global.window;
  (global as any).window = {
    confirm: jest.fn(() => true),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
});
beforeEach(() => jest.resetAllMocks());

afterEach(() => {
  jest.resetModules();
  cleanup();
});

afterAll(() => {
  (global as any).window = originalWindow;
  jest.resetAllMocks();
});

describe('useNavigationGuard', () => {
  it('should return undefined when called but define window.confirm', () => {
    mockedUseBlocker.mockImplementation(() => ({
      state: 'unblocked',
      proceed: jest.fn(),
      reset: jest.fn(),
    }));
    const { result } = renderHook(
      () => useNavigationGuard({ shouldBlock: true, leaveMsg: 'Test Message' }),
      { wrapper },
    );
    expect(result.current).toBeUndefined();
    expect(global.window.confirm).toBeDefined();
  });

  it('should return undefined when called on false', () => {
    mockedUseBlocker.mockImplementation(() => ({
      state: 'blocked',
      proceed: jest.fn(),
      reset: jest.fn(),
    }));
    const { result } = renderHook(
      () => useNavigationGuard({ shouldBlock: false, leaveMsg: 'Test Message' }),
      { wrapper },
    );
    expect(result.current).toBeUndefined();
    expect(global.window.confirm).toBeDefined();
  });

  it('should call e.preventDefault() when beforeunload event is triggered', () => {
    mockedUseBlocker.mockImplementation(() => ({
      state: 'unblocked',
      proceed: jest.fn(),
      reset: jest.fn(),
    }));

    // Re-assign confirm mock since beforeEach resets all mocks
    (global as any).window.addEventListener = jest.fn();

    renderHook(() => useNavigationGuard({ shouldBlock: true, leaveMsg: 'Test Message' }), {
      wrapper,
    });

    const addEventListenerCalls = (window.addEventListener as jest.Mock).mock.calls;
    const beforeUnloadCall = addEventListenerCalls.find(
      ([eventName]) => eventName === 'beforeunload',
    );

    expect(beforeUnloadCall).toBeDefined();

    const handler = beforeUnloadCall[1];
    const mockEvent = { preventDefault: jest.fn() } as unknown as BeforeUnloadEvent;
    handler(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('should remove beforeunload event listener on cleanup', () => {
    (global as any).window.addEventListener = jest.fn();
    (global as any).window.removeEventListener = jest.fn();

    mockedUseBlocker.mockImplementation(() => ({
      state: 'unblocked',
      proceed: jest.fn(),
      reset: jest.fn(),
    }));

    const { unmount } = renderHook(
      () => useNavigationGuard({ shouldBlock: true, leaveMsg: 'Test Message' }),
      { wrapper },
    );

    const beforeUnloadCall = (window.addEventListener as jest.Mock).mock.calls.find(
      ([eventName]) => eventName === 'beforeunload',
    );
    const handler = beforeUnloadCall[1];

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith('beforeunload', handler);
  });

  it('should call blocker.proceed() when user confirms leaving', () => {
    const proceed = jest.fn();
    const reset = jest.fn();

    mockedUseBlocker.mockImplementation(() => ({
      state: 'blocked',
      proceed,
      reset,
    }));

    (global as any).window.confirm = jest.fn(() => true);

    renderHook(() => useNavigationGuard({ shouldBlock: true, leaveMsg: 'Test Message' }), {
      wrapper,
    });

    expect(window.confirm).toHaveBeenCalledWith('Test Message');
    expect(proceed).toHaveBeenCalledTimes(1);
    expect(reset).not.toHaveBeenCalled();
  });

  it('should call blocker.reset() when user cancels leaving', () => {
    const proceed = jest.fn();
    const reset = jest.fn();

    mockedUseBlocker.mockImplementation(() => ({
      state: 'blocked',
      proceed,
      reset,
    }));

    (global as any).window.confirm = jest.fn(() => false);

    renderHook(() => useNavigationGuard({ shouldBlock: true, leaveMsg: 'Test Message' }), {
      wrapper,
    });

    expect(window.confirm).toHaveBeenCalledWith('Test Message');
    expect(reset).toHaveBeenCalledTimes(1);
    expect(proceed).not.toHaveBeenCalled();
  });
});
