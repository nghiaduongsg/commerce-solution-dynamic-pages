import { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import i18next from 'i18next';

const setupInterceptors = (instance, authClient) => {
  instance.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  instance.defaults.headers.common['irm-origin-client'] = 'ui-client';
  instance.defaults.headers.common['irm-include-labels'] = true;
  instance.defaults.headers.common['X-Frame-Options'] = 'DENY';
  instance.defaults.headers.common['Accept-Language'] = i18next.language;

  instance.defaults.paramsSerializer = (params) => {
    const searchParams = new URLSearchParams();
    for (const key of Object.keys(params)) {
      const param = params[key];
      if (Array.isArray(param)) {
        for (const p of param) {
          searchParams.append(key, p);
        }
      } else {
        if (param) {
          searchParams.append(key, param);
        }
      }
    }
    return searchParams.toString();
  };

  instance.interceptors.request.use(
    async (requestConfig: AxiosRequestConfig) => {
      const token = await authClient?.getToken?.();
      if (token) {
        if (!requestConfig.headers) {
          requestConfig.headers = {};
        }
        requestConfig.headers.Authorization = `Bearer ${token}`;
        requestConfig.headers['Accept-Language'] = i18next.language;
      }
      return requestConfig;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 503) {
          return Promise.reject(
            new Promise((_) => {
              window.location.href = `${window['CONTEXT_PATH']}/503.html`;
            }),
          );
        } else if (status === 401) {
          return Promise.reject(authClient?.logout?.()).then(
            () => (window.location.href = `${window['CONTEXT_PATH']}`),
          );
        } else if (status === 409) {
          if ((data as any)?.errorCode === 'ST-E0150') {
            globalThis.dispatchEvent(
              new CustomEvent('http-retry-409', { detail: (data as any)?.message }),
            );
          }
          return Promise.reject(error);
        } else if (status === 414) {
          return Promise.reject({
            ...error,
            status,
            message: status === 414 ? 'uriTooLong' : (data as { message?: string })?.message,
            data,
          });
        } else {
          return Promise.reject(error.response.data ? error.response.data : error.response);
        }
      } else {
        return Promise.reject({
          ...error,
          status: undefined,
          message: 'netWorkError',
        });
      }
    },
  );
};

export default setupInterceptors;
