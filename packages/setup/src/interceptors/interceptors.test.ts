import setupInterceptors from './interceptors';
import i18next from 'i18next';

describe('setupInterceptors', () => {
  const createAxiosInstance = (): any => {
    return {
      defaults: {
        headers: {
          common: {},
        },
      },
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
    };
  };

  const createAuthClient = (): any => ({
    token: 'token-123',
    getToken: jest.fn().mockResolvedValue('token-123'),
    logout: jest.fn().mockReturnValue('logout-called'),
  });

  const getRegisteredHandlers = (instance: any) => {
    const [requestFulfilled, requestRejected] = instance.interceptors.request.use.mock.calls[0];
    const [responseFulfilled, responseRejected] = instance.interceptors.response.use.mock.calls[0];

    return {
      requestFulfilled,
      requestRejected,
      responseFulfilled,
      responseRejected,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window['CONTEXT_PATH'] = '/context';
    window.location.href = 'http://localhost/';
  });

  it('sets default headers and params serializer', () => {
    const instance = createAxiosInstance();
    const authClient = createAuthClient();

    setupInterceptors(instance, authClient);

    expect(instance.defaults.headers.common['X-Requested-With']).toBe('XMLHttpRequest');
    expect(instance.defaults.headers.common['irm-origin-client']).toBe('ui-client');
    expect(instance.defaults.headers.common['irm-include-labels']).toBe(true);
    expect(instance.defaults.headers.common['X-Frame-Options']).toBe('DENY');
    expect(instance.defaults.headers.common['Accept-Language']).toBe(i18next.language);

    const serialized = instance.defaults.paramsSerializer({
      single: 'value',
      list: ['a', 'b'],
      empty: '',
      falsyZero: 0,
    });

    expect(serialized).toBe('single=value&list=a&list=b');
  });

  it('adds authorization and language headers when token exists', async () => {
    const instance = createAxiosInstance();
    const authClient = createAuthClient();
    setupInterceptors(instance, authClient);

    const { requestFulfilled } = getRegisteredHandlers(instance);
    const requestConfig: any = { headers: {} };

    const result = await requestFulfilled(requestConfig);

    expect(result).toBe(requestConfig);
    expect(requestConfig.headers.Authorization).toBe('Bearer token-123');
    expect(requestConfig.headers['Accept-Language']).toBe(i18next.language);
  });

  it('creates headers object when request headers are missing', async () => {
    const instance = createAxiosInstance();
    const authClient = createAuthClient();
    setupInterceptors(instance, authClient);

    const { requestFulfilled } = getRegisteredHandlers(instance);
    const requestConfig: any = {};

    await requestFulfilled(requestConfig);

    expect(requestConfig.headers).toBeDefined();
    expect(requestConfig.headers.Authorization).toBe('Bearer token-123');
  });

  it('returns config unchanged when token does not exist', async () => {
    const instance = createAxiosInstance();
    const authClient = createAuthClient();
    authClient.getToken.mockResolvedValue(undefined);

    setupInterceptors(instance, authClient);
    const { requestFulfilled } = getRegisteredHandlers(instance);
    const requestConfig: any = { headers: {} };

    const result = await requestFulfilled(requestConfig);

    expect(result).toBe(requestConfig);
    expect(requestConfig.headers.Authorization).toBeUndefined();
  });

  it('rejects request errors', async () => {
    const instance = createAxiosInstance();
    const authClient = createAuthClient();
    setupInterceptors(instance, authClient);
    const { requestRejected } = getRegisteredHandlers(instance);
    const error = new Error('request error');

    await expect(requestRejected(error)).rejects.toBe(error);
  });

  it('returns response on successful response interceptor', () => {
    const instance = createAxiosInstance();
    const authClient = createAuthClient();
    setupInterceptors(instance, authClient);
    const { responseFulfilled } = getRegisteredHandlers(instance);
    const response = { data: { ok: true } };

    expect(responseFulfilled(response)).toBe(response);
  });

  it('handles 503 by redirecting to 503 page and rejecting with a promise', async () => {
    const instance = createAxiosInstance();
    const authClient = createAuthClient();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => null);
    setupInterceptors(instance, authClient);
    const { responseRejected } = getRegisteredHandlers(instance);
    const error = {
      response: {
        status: 503,
        data: {},
      },
    };

    await expect(responseRejected(error)).rejects.toBeInstanceOf(Promise);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('handles 401 by calling logout and rejecting', async () => {
    const instance = createAxiosInstance();
    const authClient = createAuthClient();
    setupInterceptors(instance, authClient);
    const { responseRejected } = getRegisteredHandlers(instance);
    const error = {
      response: {
        status: 401,
        data: {},
      },
    };

    await expect(responseRejected(error)).rejects.toBe('logout-called');
    expect(authClient.logout).toHaveBeenCalledTimes(1);
  });

  it('handles 409 by rejecting original error', async () => {
    const instance = createAxiosInstance();
    const authClient = createAuthClient();
    setupInterceptors(instance, authClient);
    const { responseRejected } = getRegisteredHandlers(instance);
    const error = {
      response: {
        status: 409,
        data: { message: 'conflict' },
      },
    };

    await expect(responseRejected(error)).rejects.toBe(error);
  });

  it('handles 414 by rejecting with uriTooLong message payload', async () => {
    const instance = createAxiosInstance();
    const authClient = createAuthClient();
    setupInterceptors(instance, authClient);
    const { responseRejected } = getRegisteredHandlers(instance);
    const error = {
      response: {
        status: 414,
        data: { message: 'ignored' },
      },
      message: 'original-message',
    };

    await expect(responseRejected(error)).rejects.toMatchObject({
      status: 414,
      message: 'uriTooLong',
      data: { message: 'ignored' },
    });
  });

  it('handles generic server errors by rejecting response data', async () => {
    const instance = createAxiosInstance();
    const authClient = createAuthClient();
    setupInterceptors(instance, authClient);
    const { responseRejected } = getRegisteredHandlers(instance);
    const error = {
      response: {
        status: 400,
        data: { message: 'bad request' },
      },
    };

    await expect(responseRejected(error)).rejects.toEqual({ message: 'bad request' });
  });

  it('handles generic server errors without response data by rejecting response', async () => {
    const instance = createAxiosInstance();
    const authClient = createAuthClient();
    setupInterceptors(instance, authClient);
    const { responseRejected } = getRegisteredHandlers(instance);
    const response = {
      status: 500,
      data: undefined,
    };
    const error = {
      response,
    };

    await expect(responseRejected(error)).rejects.toBe(response);
  });

  it('handles network errors by rejecting mapped fallback error', async () => {
    const instance = createAxiosInstance();
    const authClient = createAuthClient();
    setupInterceptors(instance, authClient);
    const { responseRejected } = getRegisteredHandlers(instance);
    const error = {
      message: 'network',
    };

    await expect(responseRejected(error)).rejects.toMatchObject({
      status: undefined,
      message: 'netWorkError',
    });
  });
});
