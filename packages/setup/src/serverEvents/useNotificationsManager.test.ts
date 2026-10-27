import { renderHook, act } from '@testing-library/react';
import useNotificationsManager, {
  NOTIF_INTERVAL,
  PAGES_WITH_NOTIFICATIONS,
} from './useNotificationsManager';
import axios from 'axios';
import useAuth from '@pkg-setup/src/auth/useAuth';
import authClient from '@pkg-setup/src/auth/authClient';
import { useSystem } from '@pkg-setup/index';
import useServerEvents from '@pkg-setup/src/serverEvents/useServerEvents';
import setupServerEvents from '@pkg-setup/src/serverEvents/serverEventsSetup';

//mocked dependecies
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('@pkg-setup/src/auth/useAuth', () => ({
  __esModule: true,
  default: jest.fn(),
}));
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

jest.mock('@pkg-setup/src/auth/authClient', () => ({
  __esModule: true,
  default: { token: 'token-v1', getToken: jest.fn(), logout: jest.fn() },
}));

jest.mock('@pkg-setup/index', () => ({
  useSystem: jest.fn(),
}));
const mockedUseSystem = useSystem as jest.MockedFunction<typeof useSystem>;

jest.mock('@pkg-setup/src/serverEvents/useServerEvents', () => ({
  __esModule: true,
  default: jest.fn(),
}));
const mockedUseServerEvents = useServerEvents as jest.MockedFunction<typeof useServerEvents>;

jest.mock('@pkg-setup/src/serverEvents/serverEventsSetup', () => ({
  __esModule: true,
  default: jest.fn(),
}));
const mockedSetupServerEvents = setupServerEvents as jest.MockedFunction<typeof setupServerEvents>;

//test helpers
const DEFAULT_TOKEN = 'token-v1';
const DEFAULT_API_URL = 'https://test-api.com';
const createSseMock = () => ({
  open: jest.fn(),
  close: jest.fn(),
});
const resetMocks = () => {
  mockedUseAuth.mockReturnValue({
    token: DEFAULT_TOKEN,
    initialized: true,
  } as any);

  mockedUseSystem.mockReturnValue({
    apiUrl: DEFAULT_API_URL,
    application: 'IRM',
  } as any);

  mockedUseServerEvents.mockReturnValue({
    updateCounterNotifications: jest.fn(),
    count: 0,
  } as any);

  mockedSetupServerEvents.mockReturnValue(createSseMock() as any);

  //arbitrary set default axios result to 5 notifications
  mockedAxios.post.mockResolvedValue({
    data: { content: [{ count: 5 }] },
  });

  mockedAxios.isCancel.mockReturnValue(false);
};

describe('useNotificationsManager', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  beforeEach(() => {
    resetMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('choose between SSE(server side event) or polling', () => {
    let sseMock: ReturnType<typeof createSseMock>;

    beforeEach(() => {
      sseMock = createSseMock();
      mockedSetupServerEvents.mockReturnValue(sseMock as any);
    });

    it('should choose SSE when forceSse is true', () => {
      renderHook(() => useNotificationsManager('pageIdNotImportantInThisCase', false, true));

      expect(sseMock.open).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should fall through to normal logic when forceSSE is false', () => {
      renderHook(() => useNotificationsManager(PAGES_WITH_NOTIFICATIONS[0], false, false));

      expect(sseMock.open).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it.each(PAGES_WITH_NOTIFICATIONS)(
      'should choose SSE when pageId is in PAGES_WITH_NOTIFICATIONS array and isList flag is false',
      (pageId) => {
        renderHook(() => useNotificationsManager(pageId, false));

        expect(sseMock.open).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).not.toHaveBeenCalled();
      },
    );

    it('should choose polling when pageId is in PAGES_WITH_NOTIFICATIONS array and isList flag is true', async () => {
      renderHook(() => useNotificationsManager(PAGES_WITH_NOTIFICATIONS[0], true));

      await act(async () => {
        await Promise.resolve();
      });
      expect(sseMock.open).not.toHaveBeenCalled();
      expect(sseMock.close).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should use polling when pageId is NOT in PAGES_WITH_NOTIFICATIONS array', async () => {
      renderHook(() => useNotificationsManager('pageIdNotInPagesWithNotifications', false));

      await act(async () => {
        await Promise.resolve();
      });
      expect(sseMock.open).not.toHaveBeenCalled();
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('SSE mode', () => {
    let sseMock: ReturnType<typeof createSseMock>;

    beforeEach(() => {
      sseMock = createSseMock();
      mockedSetupServerEvents.mockReturnValue(sseMock as any);
    });

    it('should call sss.open() when SSE mode is active', () => {
      renderHook(() => useNotificationsManager(PAGES_WITH_NOTIFICATIONS[0], false));

      expect(sseMock.open).toHaveBeenCalledTimes(1);
      expect(sseMock.close).not.toHaveBeenCalled();
    });

    it('should call sss.close() when switching from sse to polling', async () => {
      const { rerender } = renderHook(
        ({ isList }) => useNotificationsManager(PAGES_WITH_NOTIFICATIONS[0], isList),
        { initialProps: { isList: false } },
      );

      expect(sseMock.open).toHaveBeenCalledTimes(1);
      expect(sseMock.close).not.toHaveBeenCalled();
      rerender({ isList: true });

      await act(async () => {
        await Promise.resolve();
      });

      expect(sseMock.close).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should not re-run the effect when useSSE has not changed between renders', async () => {
      const { rerender } = renderHook(
        ({ token }) => {
          mockedUseAuth.mockReturnValue({
            token,
            initialized: true,
          } as any);
          return useNotificationsManager(PAGES_WITH_NOTIFICATIONS[0], false);
        },
        { initialProps: { token: 'token-v1' } },
      );

      expect(sseMock.open).toHaveBeenCalledTimes(1);

      await act(async () => {
        rerender({ token: 'token-v2' });
      });

      expect(sseMock.open).toHaveBeenCalledTimes(1);
    });
  });

  describe('polling mode', () => {
    let sseMock: ReturnType<typeof createSseMock>;

    beforeEach(() => {
      sseMock = createSseMock();
      mockedSetupServerEvents.mockReturnValue(sseMock as any);
    });

    it('should call refreshNotificationsNumber  on mount', async () => {
      renderHook(() => useNotificationsManager('pageIdNotInList', false));

      await act(async () => {
        await Promise.resolve();
      });
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should set up an interval that calls refreshNotificationsNumber on repeat', async () => {
      renderHook(() => useNotificationsManager('pageNotInList', false));

      await act(async () => {
        await Promise.resolve();
      });
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);

      await act(async () => {
        jest.advanceTimersByTime(NOTIF_INTERVAL);
      });
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);

      await act(async () => {
        jest.advanceTimersByTime(NOTIF_INTERVAL);
      });
      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
    });

    it('should NOT start calling if token is NOT PRESENT', async () => {
      mockedUseAuth.mockReturnValue({
        token: undefined,
        initialized: true,
      } as any);

      renderHook(() => useNotificationsManager('pageNotInList', false));

      await act(async () => {
        await Promise.resolve();
      });
      await act(async () => {
        jest.advanceTimersByTime(NOTIF_INTERVAL * 3);
      });

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('API call, refreshNotificationsNumber', () => {
    let sseMock: ReturnType<typeof createSseMock>;
    beforeEach(() => {
      sseMock = createSseMock();
      mockedSetupServerEvents.mockReturnValue(sseMock as any);
    });

    it('should post to the correct URL with IRM queryParam --> UNR_NOTIF and valid auth token', async () => {
      renderHook(() => useNotificationsManager('pageNotInList', false));
      await act(async () => {
        await Promise.resolve();
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${DEFAULT_API_URL}/query-management/queries/UNR_NOTIF/execute?enablePagination=false&isControlActive=FALSE&page=0&size=100`,
        {},
        expect.objectContaining({
          headers: { Authorization: `Bearer ${DEFAULT_TOKEN}` },
        }),
      );
    });

    it('should post to the correct URL with ISS queryParam --> ISS_UNOTIF', async () => {
      mockedUseSystem.mockReturnValue({
        apiUrl: DEFAULT_API_URL,
        application: 'ISS',
      } as any);

      renderHook(() => useNotificationsManager('pageNotInList', false));

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${DEFAULT_API_URL}/query-management/queries/ISS_UNOTIF/execute?enablePagination=false&isControlActive=FALSE&page=0&size=100`,
        {},
        expect.objectContaining({
          headers: { Authorization: `Bearer ${DEFAULT_TOKEN}` },
        }),
      );
    });

    it('should throw error if application is not IRM or ISS', async () => {
      mockedUseSystem.mockReturnValue({
        apiUrl: DEFAULT_API_URL,
        application: 'UNKNOWN_APP',
      } as any);

      // suppress console.error — the hook catches and logs the throw
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      renderHook(() => useNotificationsManager('pageNotInList', false));

      await act(async () => {
        await Promise.resolve();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Unknown application: UNKNOWN_APP' }),
      );
      expect(mockedAxios.post).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should pass an abortController signal to axios', async () => {
      renderHook(() => useNotificationsManager('pageNotInList', false));

      await act(async () => {
        await Promise.resolve();
      });

      // get the third argument (config) from the axios.post call
      const axiosConfig = mockedAxios.post.mock.calls[0][2];

      expect(axiosConfig?.signal).toBeInstanceOf(AbortSignal);
    });
  });

  describe('in-flight guard', () => {
    let sseMock: ReturnType<typeof createSseMock>;

    beforeEach(() => {
      sseMock = createSseMock();
      mockedSetupServerEvents.mockReturnValue(sseMock as any);
    });

    it('should skip the API call if a request is already in flight', async () => {
      let resolveRequest: (value: any) => void;
      mockedAxios.post.mockReturnValue(
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
      );

      renderHook(() => useNotificationsManager('pageNotInList', false));

      await act(async () => {
        await Promise.resolve();
      });
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);

      await act(async () => {
        jest.advanceTimersByTime(NOTIF_INTERVAL);
      });
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should reset the in-flight flag after the request completes', async () => {
      renderHook(() => useNotificationsManager('pageNotInList', false));

      await act(async () => {
        await Promise.resolve();
      });
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);

      await act(async () => {
        jest.advanceTimersByTime(NOTIF_INTERVAL);
      });
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('should reset the in-flight flag even if the request fails', async () => {
      mockedAxios.post
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValue({ data: { content: [{ count: 5 }] } });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      renderHook(() => useNotificationsManager('pageNotInList', false));

      await act(async () => {
        await Promise.resolve();
      });
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);

      await act(async () => {
        jest.advanceTimersByTime(NOTIF_INTERVAL);
      });
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });
  });

  describe('cleanup', () => {
    let sseMock: ReturnType<typeof createSseMock>;

    beforeEach(() => {
      sseMock = createSseMock();
      mockedSetupServerEvents.mockReturnValue(sseMock as any);
    });

    it('should clear the polling interval on unmount', async () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = renderHook(() => useNotificationsManager('pageNotInList', false));

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();

      await act(async () => {
        jest.advanceTimersByTime(NOTIF_INTERVAL * 3);
      });
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);

      clearIntervalSpy.mockRestore();
    });

    it('should abort any in-flight request on unmount', async () => {
      let resolveRequest: (value: any) => void;
      mockedAxios.post.mockReturnValue(
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
      );

      const { unmount } = renderHook(() => useNotificationsManager('pageNotInList', false));

      await act(async () => {
        await Promise.resolve();
      });

      const signal = mockedAxios.post.mock.calls[0][2]?.signal as AbortSignal;
      expect(signal.aborted).toBe(false);

      unmount();

      expect(signal.aborted).toBe(true);
    });

    it('should clear the existing interval before starting a new one when useSSE changes', async () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { rerender } = renderHook(
        ({ pageId, token }) => {
          mockedUseAuth.mockReturnValue({
            token,
            initialized: true,
          } as any);
          return useNotificationsManager(pageId, false);
        },
        { initialProps: { pageId: 'pageNotInList', token: DEFAULT_TOKEN } },
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      await act(async () => {
        jest.advanceTimersByTime(NOTIF_INTERVAL);
        await Promise.resolve();
      });

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(clearIntervalSpy).not.toHaveBeenCalled();

      await act(async () => {
        rerender({ pageId: 'pageNotInList', token: 'token-v2' });
        await Promise.resolve();
      });

      expect(clearIntervalSpy).toHaveBeenCalledTimes(1);

      await act(async () => {
        rerender({ pageId: PAGES_WITH_NOTIFICATIONS[0], token: 'token-v2' });
        await Promise.resolve();
      });

      expect(sseMock.open).toHaveBeenCalledTimes(1);

      clearIntervalSpy.mockRestore();
    });

    it('should handle sse being null gracefully', () => {
      mockedSetupServerEvents.mockReturnValue(null as any);

      // should not throw error even with null sse
      expect(() => {
        renderHook(() => useNotificationsManager('pageNotInList', false));
      }).not.toThrow();
    });

    it('should handle sse being null in SSE mode gracefully', () => {
      mockedSetupServerEvents.mockReturnValue(null as any);

      expect(() => {
        renderHook(() => useNotificationsManager(PAGES_WITH_NOTIFICATIONS[0], false));
      }).not.toThrow();
    });
  });
});
