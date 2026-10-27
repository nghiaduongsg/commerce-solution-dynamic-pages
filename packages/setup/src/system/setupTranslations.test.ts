import axios from 'axios';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import backend from 'i18next-http-backend';
import setupTranslations, { DEFAULT_LNG, I18NTRANSLATION } from './setupTranslations';
import { CODELISTS, COMMON } from '@pkg-constants/translationNamespaces';

jest.mock('axios');
jest.mock('i18next');
jest.mock('react-i18next');
jest.mock('i18next-http-backend');
jest.mock('@pkg-constants/translationNamespaces', () => ({
  CODELISTS: 'codelists',
  COMMON: 'common',
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedI18n = i18n as jest.Mocked<typeof i18n>;

interface BackendOptions {
  loadPath: string;
  request: (
    options: any,
    path: string,
    payload: any,
    callback: (error: any, result?: any) => void,
  ) => void;
}

describe('setupTranslations', () => {
  let mockResourceStore: any;
  let mockServices: any;
  let originalWindow: any;

  beforeEach(() => {
    jest.clearAllMocks();

    originalWindow = {
      REACT_APP_API_URL: (window as any)['REACT_APP_API_URL'],
      DEFAULT_TRANSLATIONS: (window as any)['DEFAULT_TRANSLATIONS'],
    };

    Object.defineProperty(window, 'REACT_APP_API_URL', {
      value: 'https://test-api.com',
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, 'DEFAULT_TRANSLATIONS', {
      value: {
        testNamespace: {
          testKey: 'Test Translation',
        },
      },
      writable: true,
      configurable: true,
    });

    mockResourceStore = {
      data: {
        EN: {
          common: { test: 'value' },
        },
      },
    };

    mockServices = {
      resourceStore: mockResourceStore,
    };

    mockedI18n.services = mockServices;
    mockedI18n.use = jest.fn().mockReturnThis();
    mockedI18n.init = jest.fn().mockReturnThis();
  });

  afterEach(() => {
    if (originalWindow.REACT_APP_API_URL !== undefined) {
      (window as any)['REACT_APP_API_URL'] = originalWindow.REACT_APP_API_URL;
    } else {
      delete (window as any)['REACT_APP_API_URL'];
    }

    if (originalWindow.DEFAULT_TRANSLATIONS !== undefined) {
      (window as any)['DEFAULT_TRANSLATIONS'] = originalWindow.DEFAULT_TRANSLATIONS;
    } else {
      delete (window as any)['DEFAULT_TRANSLATIONS'];
    }
  });

  describe('setupTranslations function', () => {
    it('should initialize i18n with default language when no language provided', () => {
      setupTranslations();

      expect(mockedI18n.use).toHaveBeenCalledWith(initReactI18next);
      expect(mockedI18n.use).toHaveBeenCalledWith(backend);
      expect(mockedI18n.init).toHaveBeenCalledWith({
        backend: expect.any(Object),
        lng: DEFAULT_LNG,
        debug: false,
        defaultNS: COMMON,
        fallbackLng: DEFAULT_LNG,
        react: {
          wait: true,
          useSuspense: false,
        },
        interpolation: {
          escapeValue: false,
        },
      });
    });

    it('should initialize i18n with provided language', () => {
      const customLng = 'FR';
      setupTranslations(customLng);

      expect(mockedI18n.init).toHaveBeenCalledWith(
        expect.objectContaining({
          lng: customLng,
        }),
      );
    });
  });

  describe('backend request function', () => {
    let backendOptions: BackendOptions;

    beforeEach(() => {
      setupTranslations();
      const initCall = mockedI18n.init.mock.calls[0][0];
      backendOptions = initCall.backend as BackendOptions;
    });

    it('should handle valid path with namespace and language', (done) => {
      const mockApiData = [
        {
          namespaceCL: 'testNS',
          items: [{ itemKey: 'test', itemDescription: 'Test Description' }],
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockApiData });

      const mockCallback = jest.fn((error, result) => {
        if (!error) {
          expect(result.status).toBe(200);
          expect(mockedAxios.get).toHaveBeenCalledWith(
            'https://test-api.com/translation-management/translatable-items/namespace-labels',
            {
              params: {
                namespaceCLs: 'testNS',
              },
            },
          );
        }
        done();
      });

      backendOptions.request({}, 'testNS__SEPARATOR__EN', {}, mockCallback);
    });

    it('should filter out excluded namespaces', () => {
      const mockCallback = jest.fn();

      backendOptions.request({}, `${CODELISTS}__SEPARATOR__EN`, {}, mockCallback);

      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should filter out I18NTRANSLATION namespace', () => {
      const mockCallback = jest.fn();

      backendOptions.request({}, `${I18NTRANSLATION}__SEPARATOR__EN`, {}, mockCallback);

      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should not make API call if namespace already exists in resource store', () => {
      mockResourceStore.data.EN.testExisting = { test: 'existing' };

      const mockCallback = jest.fn();
      backendOptions.request({}, 'testExisting__SEPARATOR__EN', {}, mockCallback);

      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should use default translations when available', (done) => {
      const mockApiData = [
        {
          namespaceCL: 'testNamespace',
          items: [{ itemKey: 'test', itemDescription: 'API Description' }],
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockApiData });

      const mockCallback = jest.fn((error, result) => {
        if (!error) {
          expect(result.data).toEqual({ testKey: 'Test Translation' });
          expect(result.status).toBe(200);
        }
        done();
      });

      backendOptions.request({}, 'testNamespace__SEPARATOR__EN', {}, mockCallback);
    });

    it('should handle API errors gracefully', (done) => {
      delete (window as any)['DEFAULT_TRANSLATIONS'];

      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const mockCallback = jest.fn((error, result) => {
        expect(error).toBeNull();
        expect(result.status).toBe(200);
        expect(result.data).toEqual({});
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to load ',
          'testNS',
          '. Using default labels.',
        );
        consoleSpy.mockRestore();
        done();
      });

      backendOptions.request({}, 'testNS__SEPARATOR__EN', {}, mockCallback);
    });

    it('should handle API errors with default translations fallback', (done) => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const mockCallback = jest.fn((error, result) => {
        expect(error).toBeNull();
        expect(result.status).toBe(200);
        expect(result.data).toEqual({ testKey: 'Test Translation' });
        consoleSpy.mockRestore();
        done();
      });

      backendOptions.request({}, 'testNamespace__SEPARATOR__EN', {}, mockCallback);
    });

    it('should handle invalid path format', () => {
      const mockCallback = jest.fn();

      backendOptions.request({}, 'invalidpath', {}, mockCallback);

      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should handle undefined/null namespaces', () => {
      const mockCallback = jest.fn();

      backendOptions.request({}, 'undefined__SEPARATOR__EN', {}, mockCallback);
      backendOptions.request({}, 'null__SEPARATOR__EN', {}, mockCallback);

      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should transform API data to translation format', (done) => {
      const mockApiData = [
        {
          namespaceCL: 'testNamespace',
          items: [
            { itemKey: 'key1', itemDescription: 'Description 1' },
            { itemKey: 'key2', itemDescription: 'Description 2' },
            { itemKey: 'key3' },
          ],
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockApiData });

      const mockCallback = jest.fn((error, result) => {
        if (!error) {
          expect(result.data).toEqual({ testKey: 'Test Translation' });
          expect(result.status).toBe(200);
        }
        done();
      });

      backendOptions.request({}, 'testNamespace__SEPARATOR__EN', {}, mockCallback);
    });
  });

  describe('constants', () => {
    it('should export correct default language', () => {
      expect(DEFAULT_LNG).toBe('EN');
    });

    it('should export correct translation constant', () => {
      expect(I18NTRANSLATION).toBe('translation');
    });
  });

  describe('edge cases', () => {
    it('should handle missing window.REACT_APP_API_URL', () => {
      delete (window as any)['REACT_APP_API_URL'];

      setupTranslations();
      const initCall = mockedI18n.init.mock.calls[0][0];
      const backendOptions = initCall.backend as BackendOptions;

      const mockCallback = jest.fn();

      expect(() => {
        backendOptions.request({}, 'testNS__SEPARATOR__EN', {}, mockCallback);
      }).toThrow();
    });

    it('should handle missing i18n services', () => {
      (mockedI18n as any).services = undefined;

      setupTranslations();
      const initCall = mockedI18n.init.mock.calls[0][0];
      const backendOptions = initCall.backend as BackendOptions;

      const mockCallback = jest.fn();

      expect(() => {
        backendOptions.request({}, 'testNS__SEPARATOR__EN', {}, mockCallback);
      }).toThrow();
    });
  });
});
