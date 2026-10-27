import EventSource from 'sse-events';
import setupServerEvents, {
  DOCUMENT_SIGNED,
  NOTIFICATION_TOPIC,
  ACKNOWLEDGE_TOPIC,
  SUBSCRIBE_API,
  SUBSCRIBE_RESPONSE,
  RECONNECT_INTERVAL,
} from './serverEventsSetup';

jest.mock('sse-events');

describe('setupServerEvents', () => {
  let mockEventSource;
  let mockAuthClient;
  let mockAddEventListener;
  let mockReload;

  beforeEach(() => {
    jest.resetAllMocks();

    mockReload = jest.fn();

    delete (window as any).location;

    (window as any).location = {
      pathname: '/current/path',
      reload: mockReload,
    };

    (window as any)['CONTEXT_PATH'] = '/test-context';
    window.dispatchEvent = jest.fn();

    mockAddEventListener = jest.fn();
    mockEventSource = {
      addEventListener: mockAddEventListener,
      options: {
        headers: {
          Authorization: 'Bearer test-token',
        },
      },
      reconnectInterval: RECONNECT_INTERVAL,
      retrying: false,
    };

    EventSource.mockImplementation(() => mockEventSource);
    EventSource.types = {
      ON_ERROR: 'error',
      ON_OPEN: 'open',
      ON_CLOSE: 'close',
    };

    mockAuthClient = {
      token: 'test-token',
      logout: jest.fn(),
    };

    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('EventSource initialization', () => {
    it('should create EventSource with correct configuration', () => {
      setupServerEvents('https://api.test.com', mockAuthClient);

      expect(EventSource).toHaveBeenCalledWith({
        url: 'https://api.test.com',
        path: SUBSCRIBE_API,
        options: {
          headers: {
            Authorization: 'Bearer test-token',
          },
        },
        reconnectInterval: RECONNECT_INTERVAL,
        retryOnNetworkError: true,
      });
    });

    it('should set up all required event listeners', () => {
      setupServerEvents('https://api.test.com', mockAuthClient);

      expect(mockAddEventListener).toHaveBeenCalledWith(DOCUMENT_SIGNED, expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith(NOTIFICATION_TOPIC, expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith(ACKNOWLEDGE_TOPIC, expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('open', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('close', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });

  describe('DOCUMENT_SIGNED event handler', () => {
    it('should dispatch success event when DOCUMENT_SIGNED is received', () => {
      setupServerEvents('https://api.test.com', mockAuthClient);

      const documentSignedHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === DOCUMENT_SIGNED,
      )[1];

      documentSignedHandler();

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
        }),
      );
    });
  });

  describe('ACKNOWLEDGE_TOPIC event handler', () => {
    let acknowledgeHandler;

    beforeEach(() => {
      setupServerEvents('https://api.test.com', mockAuthClient);
      acknowledgeHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === ACKNOWLEDGE_TOPIC,
      )[1];
    });

    it('should not update reconnectInterval when event data is SUBSCRIBE_RESPONSE', () => {
      const mockEvent = { data: SUBSCRIBE_RESPONSE };
      const originalInterval = mockEventSource.reconnectInterval;

      acknowledgeHandler(mockEvent);

      expect(mockEventSource.reconnectInterval).toBe(originalInterval);
    });

    it('should update reconnectInterval when event data is not SUBSCRIBE_RESPONSE', () => {
      const mockEvent = {
        data: { timeLeft: 3000 },
      };

      acknowledgeHandler(mockEvent);

      expect(mockEventSource.reconnectInterval).toBe(3000);
    });
  });

  describe('Connection state event handlers', () => {
    let openHandler;
    let closeHandler;

    beforeEach(() => {
      setupServerEvents('https://api.test.com', mockAuthClient);
      openHandler = mockAddEventListener.mock.calls.find((call) => call[0] === 'open')[1];
      closeHandler = mockAddEventListener.mock.calls.find((call) => call[0] === 'close')[1];
    });

    it('should set retrying to false on open event', () => {
      mockEventSource.retrying = true;

      openHandler();

      expect(mockEventSource.retrying).toBe(false);
    });

    it('should set retrying to false on close event', () => {
      mockEventSource.retrying = true;

      closeHandler();

      expect(mockEventSource.retrying).toBe(false);
    });
  });

  describe('Error event handler', () => {
    let errorHandler;

    beforeEach(() => {
      setupServerEvents('https://api.test.com', mockAuthClient);
      errorHandler = mockAddEventListener.mock.calls.find((call) => call[0] === 'error')[1];
    });

    it('should logout and remove authorization when error code is in success range and not retrying', () => {
      const mockError = {
        data: { code: 200 },
      };
      mockEventSource.retrying = false;

      errorHandler(mockError);

      expect(mockEventSource.options.headers.Authorization).toBeUndefined();
      expect(mockEventSource.retrying).toBe(true);
      expect(mockAuthClient.logout).toHaveBeenCalled();
    });

    it('should logout for code 204 when not retrying', () => {
      const mockError = {
        data: { code: 204 },
      };
      mockEventSource.retrying = false;

      errorHandler(mockError);

      expect(mockEventSource.options.headers.Authorization).toBeUndefined();
      expect(mockEventSource.retrying).toBe(true);
      expect(mockAuthClient.logout).toHaveBeenCalled();
    });

    it('should not logout when already retrying', () => {
      const mockError = {
        data: { code: 200 },
      };
      mockEventSource.retrying = true;

      errorHandler(mockError);

      expect(mockAuthClient.logout).not.toHaveBeenCalled();
      expect(mockEventSource.retrying).toBe(false);
    });

    it('should not logout when error code is outside success range', () => {
      const mockError = {
        data: { code: 400 },
      };
      mockEventSource.retrying = false;

      errorHandler(mockError);

      expect(mockAuthClient.logout).not.toHaveBeenCalled();
      expect(mockEventSource.retrying).toBe(false);
    });

    it('should handle error without data gracefully', () => {
      const mockError = null;

      errorHandler(mockError);

      expect(mockAuthClient.logout).not.toHaveBeenCalled();
      expect(mockEventSource.retrying).toBe(false);
    });
  });

  describe('Return value', () => {
    it('should return the created EventSource instance', () => {
      const result = setupServerEvents('https://api.test.com', mockAuthClient);

      expect(result).toBe(mockEventSource);
    });
  });
});
