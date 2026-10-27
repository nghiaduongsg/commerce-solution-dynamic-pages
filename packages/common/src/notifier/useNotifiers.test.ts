import { useDispatch, useSelector } from 'react-redux';
import { renderHook, act } from '@testing-library/react';
import useNotifiers from '@pkg-common/notifier/useNotifiers';
import { EnqueueSnackbar, RemoveSnackbar } from '@pkg-common/notifier/reducers';
import { Notification, NotifierState } from '@pkg-common/notifier/types';

jest.mock('react-redux');

const mockUseDispatch = useDispatch as jest.MockedFunction<typeof useDispatch>;
const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

describe('useNotifiers Hook', () => {
  const mockDispatch = jest.fn();

  const mockState: { Notifier: NotifierState } = {
    Notifier: {
      notifications: [
        {
          key: 'form1-key',
          message: 'form1-message',
          severity: 'dark' as const,
          dismissed: true,
          namespace: 'party',
          successUpdateMessageKey: 'Test',
        },
        {
          key: 'form2-key',
          message: 'form2-message',
          severity: 'error' as const,
          dismissed: false,
          namespace: 'user',
          successUpdateMessageKey: 'Test2',
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDispatch.mockReturnValue(mockDispatch);
    mockUseSelector.mockReturnValue(mockState.Notifier.notifications);
  });

  describe('Unit', () => {
    it('should return the expected structure', () => {
      mockUseSelector.mockReturnValue(mockState.Notifier.notifications);

      const { result } = renderHook(() => useNotifiers());
      const { notifications, enqueueSnackbar, clearNotification } = result.current;

      expect(notifications).toEqual(mockState.Notifier.notifications);
      expect(typeof enqueueSnackbar).toBe('function');
      expect(typeof clearNotification).toBe('function');
    });

    it('should dispatch EnqueueSnackbar with correct payload', () => {
      const testNotification: Notification = {
        key: 'test-key',
        message: 'Test message',
        severity: 'error',
        namespace: 'test',
      };

      const { result } = renderHook(() => useNotifiers());
      const { enqueueSnackbar } = result.current;

      act(() => {
        enqueueSnackbar(testNotification);
      });

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: EnqueueSnackbar.type, // 'Notifier/EnqueueSnackbar'
        payload: testNotification,
      });
    });

    it('should dispatch RemoveSnackbar with correct key', () => {
      const testKey = 'test-key';

      const { result } = renderHook(() => useNotifiers());
      const { clearNotification } = result.current;

      act(() => {
        clearNotification(testKey);
      });

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: RemoveSnackbar.type, // 'Notifier/RemoveSnackbar'
        payload: { key: testKey },
      });
    });
  });
});
