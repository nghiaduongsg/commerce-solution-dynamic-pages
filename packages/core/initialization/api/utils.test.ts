Object.defineProperty(window, 'REACT_APP_API_URL', {
  writable: true,
  value: 'http://localhost:3000/api',
});

import axios from 'axios';
import { dataToStore, sortByLabelOrCode } from '@pkg-core/codeList/redux/reducers';
import {
  getBaseCodelists,
  getLanguages,
  getUserPreferences,
  getCurrentAccount,
  getRevenueTypes,
  getPartyRoleDetails,
  getMenu,
  getSecurableObjects,
  constructDataToSend,
} from '@pkg-core/initialization/api/utils';
import { wrapEntityDataArea } from '@pkg-entity/utils/utils';
import {
  BaseCodelists,
  Language,
  UserPreferences,
  CurrentAccount,
  RevenueTypes,
  PartyRoleDetails,
  Menu,
  SecurableObjects,
} from '../redux/types.d';
import {
  BOOLEAN_CODELIST_ATTRIBUTES,
  DAYS_RETENTION_PERIOD_READ_NOTIFICATION,
  HIDE_EXPIRED_ITEMS,
  HIDE_INACTIVE_ITEMS,
  REVERSE_SIGN,
  SOURCE_CURRENCY_MODE,
} from '@pkg-constants/codeListVariables';

jest.mock('axios');
jest.mock('@pkg-core/codeList/redux/reducers');
jest.mock('@pkg-entity/utils/utils');

const mockedWrapEntityDataArea = wrapEntityDataArea as jest.MockedFunction<
  typeof wrapEntityDataArea
>;

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedDataToStore = dataToStore as jest.MockedFunction<typeof dataToStore>;
const mockedSortByLabelOrCode = sortByLabelOrCode as jest.MockedFunction<typeof sortByLabelOrCode>;

// Generic test setup - USED in all test files
export const setupMocks = () => {
  const onLoading = jest.fn();
  const onSuccess = jest.fn();
  const onError = jest.fn();

  jest.clearAllMocks();
  mockedDataToStore.mockImplementation((_, items) => items);
  mockedSortByLabelOrCode.mockImplementation((items) => items ?? []);

  return { onLoading, onSuccess, onError };
};

// Error test setup - USED in error test cases
export const setupErrorTest = (error: any, method: 'get' | 'post' = 'get') => {
  mockedAxios[method].mockRejectedValue(error);
};

describe('getBaseCodelists function tests', () => {
  let onLoading: jest.Mock;
  let onSuccess: jest.Mock;
  let onError: jest.Mock;

  beforeEach(() => {
    ({ onLoading, onSuccess, onError } = setupMocks());
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockResponseData = [
    {
      code: 'CURRENCIES',
      label: 'Currencies',
      items: [
        {
          id: 435,
          code: 'EUR',
          label: 'Euro',
          attributes: [
            {
              key: 'decimalPlaces',
              value: '2',
            },
            {
              key: 'decimalSeparator',
              value: ',',
            },
            {
              key: 'inactive',
              value: 'NO',
            },
            {
              key: 'primary',
              value: 'YES',
            },
            {
              key: 'thousandSeparator',
              value: '.',
            },
            {
              key: 'symbol',
              value: '€',
            },
            {
              key: 'symbolPosition',
              value: 'SUFFIX',
            },
            {
              key: 'decimalPlacesExtended',
              value: '7',
            },
            {
              key: 'roundingRule',
              value: 'RNDHALFUPS',
            },
          ],
          expired: false,
        },
        {
          id: 436,
          code: 'USD',
          label: 'US Dollars',
          attributes: [
            {
              key: 'decimalPlaces',
              value: '2',
            },
            {
              key: 'inactive',
              value: 'NO',
            },
            {
              key: 'primary',
              value: 'NO',
            },
          ],
          expired: false,
        },
      ],
    },
    {
      code: 'ENTITIES',
      label: 'Entities',
      items: [
        {
          id: 61,
          code: 'Party',
          label: 'Party',
          attributes: [
            {
              key: 'microserviceName',
              value: 'registration',
            },
            {
              key: 'serviceBasePath',
              value: '/parties',
            },
          ],
          expired: false,
        },
        {
          id: 62,
          code: 'PartyType',
          label: 'Party Type',
          attributes: [
            {
              key: 'microserviceName',
              value: 'registration',
            },
            {
              key: 'serviceBasePath',
              value: '/party-types',
            },
          ],
          expired: false,
        },
      ],
    },
    {
      code: 'FORM_TYPE_CATEGORIES',
      label: 'Form Type Categories',
      items: [
        {
          id: 492,
          code: 'REGISTRATION_FORMS',
          label: 'Registration forms',
          attributes: [],
          expired: false,
        },
        {
          id: 493,
          code: 'DECLARATION_FORMS',
          label: 'Declaration forms',
          attributes: [],
          expired: false,
        },
      ],
    },
    {
      code: 'SYSTEM_PARAMETERS',
      label: 'System Parameters',
      items: [
        {
          id: 1174,
          code: 'DAYS_OF_YEAR',
          label: 'Days of Year',
          attributes: [
            {
              key: 'id',
              value: '360',
            },
          ],
          expired: false,
        },
        {
          id: 705,
          code: 'SUSPENSE_OBLIGATION_ACTION',
          label: 'Suspense Obligation Action',
          attributes: [
            {
              key: 'id',
              value: 'suspense-obligation-action-uuid---36',
            },
          ],
          expired: false,
        },
        {
          id: 2037,
          code: 'MULTIPLE_ORGANIZATIONAL_UNITS_PER_MEMBER',
          label: 'Allow a member to belong in more than one Organizational Units',
          attributes: [
            {
              key: 'id',
              value: 'Y',
            },
          ],
          expired: false,
        },
      ],
    },
  ];

  describe('Successful API call', () => {
    it('should fetch base codelists and call onSuccess with correct data structure', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockResponseData });

      // Act
      await getBaseCodelists(onLoading, onSuccess, onError);

      // Assert
      expect(onLoading).toHaveBeenCalledWith(BaseCodelists);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/reference-data/codelists?codeListCodes=CURRENCIES&codeListCodes=SYSTEM_PARAMETERS&codeListCodes=ENTITIES&codeListCodes=FORM_TYPE_CATEGORIES',
      );
      expect(onSuccess).toHaveBeenCalledWith(
        {
          CodeList: {
            CURRENCIES: mockResponseData[0].items,
            ENTITIES: mockResponseData[1].items,
            FORM_TYPE_CATEGORIES: mockResponseData[2].items,
            SYSTEM_PARAMETERS: mockResponseData[3].items,
          },
          System: {
            hideExpired: 'N', // No HIDE_EXPIRED_ITEMS parameter in mock data
            hideInactive: 'N', // No HIDE_INACTIVE_ITEMS parameter in mock data
            sourceCurrencyMode: 'N', // No SOURCE_CURRENCY_MODE parameter in mock data
            primaryCurrency: {
              id: 435,
              code: 'EUR',
              label: 'Euro',
              attributes: [
                { key: 'decimalPlaces', value: '2' },
                { key: 'decimalSeparator', value: ',' },
                { key: 'inactive', value: 'NO' },
                { key: 'primary', value: 'YES' },
                { key: 'thousandSeparator', value: '.' },
                { key: 'symbol', value: '€' },
                { key: 'symbolPosition', value: 'SUFFIX' },
                { key: 'decimalPlacesExtended', value: '7' },
                { key: 'roundingRule', value: 'RNDHALFUPS' },
              ],
              expired: false,
            },
            retentionPeriod: 1, // No DAYS_RETENTION_PERIOD_READ_NOTIFICATION parameter in mock data
            isSignReversed: false, // No REVERSE_SIGN parameter in mock data
            labelIndicatorMode: '',
            labelIndicatorSymbol: '',
            labelIndicatorIcon: '',
            labelIndicatorColor: '',
          },
        },
        BaseCodelists,
      );
      expect(onError).not.toHaveBeenCalled();
    });
    it('should handle system parameters with specific values when present', async () => {
      // Arrange
      const mockDataWithSystemParams = [
        ...mockResponseData.slice(0, 3), // Keep first 3 codelists
        {
          code: 'SYSTEM_PARAMETERS',
          label: 'System Parameters',
          items: [
            {
              id: 1,
              code: HIDE_EXPIRED_ITEMS,
              label: 'Hide Expired Items',
              attributes: [{ key: 'id', value: 'Y' }],
              expired: false,
            },
            {
              id: 2,
              code: HIDE_INACTIVE_ITEMS,
              label: 'Hide Inactive Items',
              attributes: [{ key: 'id', value: 'N' }],
              expired: false,
            },
            {
              id: 3,
              code: SOURCE_CURRENCY_MODE,
              label: 'Source Currency Mode',
              attributes: [{ key: 'id', value: 'Y' }],
              expired: false,
            },
            {
              id: 4,
              code: REVERSE_SIGN,
              label: 'Reverse Sign',
              attributes: [{ key: 'id', value: 'Y' }],
              expired: false,
            },
            {
              id: 5,
              code: DAYS_RETENTION_PERIOD_READ_NOTIFICATION,
              label: 'Days Retention Period',
              attributes: [{ key: 'id', value: '30' }],
              expired: false,
            },
          ],
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockDataWithSystemParams });

      // Act
      await getBaseCodelists(onLoading, onSuccess, onError);

      // Assert
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          System: expect.objectContaining({
            hideExpired: 'Y',
            hideInactive: 'N',
            sourceCurrencyMode: 'Y',
            primaryCurrency: expect.objectContaining({
              code: 'EUR',
              attributes: expect.arrayContaining([{ key: 'primary', value: 'YES' }]),
            }),
            retentionPeriod: '30',
            isSignReversed: true,
          }),
        }),
        BaseCodelists,
      );
    });
    it('should find primary currency correctly from EUR currency', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockResponseData });

      // Act
      await getBaseCodelists(onLoading, onSuccess, onError);

      // Assert
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          System: expect.objectContaining({
            primaryCurrency: expect.objectContaining({
              code: 'EUR',
              label: 'Euro',
              attributes: expect.arrayContaining([{ key: 'primary', value: 'YES' }]),
            }),
          }),
        }),
        BaseCodelists,
      );
    });
    it('should handle currency with different primary attribute value', async () => {
      // Arrange - Alter primary currency from mockResponseData
      const mockDataWithUSDPrimary = [
        {
          ...mockResponseData[0],
          items: [
            {
              ...mockResponseData[0].items[0],
              attributes: mockResponseData[0].items[0].attributes.map((attr) =>
                attr.key === 'primary' ? { ...attr, value: 'NO' } : attr,
              ),
            },
            {
              ...mockResponseData[0].items[1],
              attributes: [
                ...mockResponseData[0].items[1].attributes,
                { key: 'primary', value: BOOLEAN_CODELIST_ATTRIBUTES.YES },
              ],
            },
          ],
        },
        ...mockResponseData.slice(1),
      ];

      mockedAxios.get.mockResolvedValue({ data: mockDataWithUSDPrimary });

      // Act
      await getBaseCodelists(onLoading, onSuccess, onError);

      // Assert
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          System: expect.objectContaining({
            primaryCurrency: expect.objectContaining({
              code: 'USD',
              label: 'US Dollars',
            }),
          }),
        }),
        BaseCodelists,
      );
    });
    it('should handle empty response data', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: [] });

      // Act
      await getBaseCodelists(onLoading, onSuccess, onError);

      // Assert
      expect(onSuccess).toHaveBeenCalledWith(
        {
          CodeList: {},
          System: {
            hideExpired: 'N',
            hideInactive: 'N',
            sourceCurrencyMode: 'N',
            primaryCurrency: undefined,
            retentionPeriod: 1,
            isSignReversed: false,
            labelIndicatorMode: '',
            labelIndicatorSymbol: '',
            labelIndicatorIcon: '',
            labelIndicatorColor: '',
          },
        },
        BaseCodelists,
      );
    });
    it('should handle null/undefined response data', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: null });

      // Act
      await getBaseCodelists(onLoading, onSuccess, onError);

      // Assert
      expect(onSuccess).toHaveBeenCalledWith(
        {
          CodeList: {},
          System: {
            hideExpired: 'N',
            hideInactive: 'N',
            sourceCurrencyMode: 'N',
            primaryCurrency: undefined,
            retentionPeriod: 1,
            isSignReversed: false,
            labelIndicatorMode: '',
            labelIndicatorSymbol: '',
            labelIndicatorIcon: '',
            labelIndicatorColor: '',
          },
        },
        BaseCodelists,
      );
    });
    it('should handle missing primary currency', async () => {
      // Arrange
      const mockDataNoPrimary = [
        {
          ...mockResponseData[0],
          items: mockResponseData[0].items.map((item) => ({
            ...item,
            attributes: item.attributes.filter((attr) => attr.key !== 'primary'),
          })),
        },
        ...mockResponseData.slice(1),
      ];

      mockedAxios.get.mockResolvedValue({ data: mockDataNoPrimary });

      // Act
      await getBaseCodelists(onLoading, onSuccess, onError);

      // Assert
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          System: expect.objectContaining({
            primaryCurrency: undefined,
          }),
        }),
        BaseCodelists,
      );
    });
  });
  describe('API call failures', () => {
    it('should call onError when API request fails', async () => {
      // Arrange
      setupErrorTest(new Error('Network error'), 'get');

      // Act
      await getBaseCodelists(onLoading, onSuccess, onError);

      // Assert
      expect(onLoading).toHaveBeenCalledWith(BaseCodelists);
      expect(onError).toHaveBeenCalledWith(BaseCodelists);
      expect(onSuccess).not.toHaveBeenCalled();
    });
    it('should handle axios timeout error', async () => {
      // Arrange
      setupErrorTest({ code: 'ECONNABORTED', message: 'timeout of 5000ms exceeded' }, 'get');

      // Act
      await getBaseCodelists(onLoading, onSuccess, onError);

      // Assert
      expect(onError).toHaveBeenCalledWith(BaseCodelists);
    });
  });
  describe('Data processing', () => {
    it('should call dataToStore and sortByLabelOrCode for each codelist', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockResponseData });

      // Act
      await getBaseCodelists(onLoading, onSuccess, onError);

      // Assert
      expect(mockedDataToStore).toHaveBeenCalledTimes(4);
      expect(mockedDataToStore).toHaveBeenCalledWith({}, mockResponseData[0].items);
      expect(mockedDataToStore).toHaveBeenCalledWith({}, mockResponseData[1].items);
      expect(mockedDataToStore).toHaveBeenCalledWith({}, mockResponseData[2].items);
      expect(mockedDataToStore).toHaveBeenCalledWith({}, mockResponseData[3].items);

      expect(mockedSortByLabelOrCode).toHaveBeenCalledTimes(4);
    });
    it('should handle codelists with null or undefined items', async () => {
      // Arrange
      const mockDataWithNullItems = [
        {
          code: 'CURRENCIES',
          items: null,
        },
        {
          code: 'SYSTEM_PARAMETERS',
          // items property missing
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockDataWithNullItems });

      // Act
      await getBaseCodelists(onLoading, onSuccess, onError);

      // Assert
      expect(mockedDataToStore).toHaveBeenCalledWith({}, []);
      expect(mockedDataToStore).toHaveBeenCalledWith({}, []);
    });
    it('should process all codelist types correctly', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockResponseData });

      // Act
      await getBaseCodelists(onLoading, onSuccess, onError);

      // Assert
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          CodeList: {
            CURRENCIES: expect.any(Array),
            ENTITIES: expect.any(Array),
            FORM_TYPE_CATEGORIES: expect.any(Array),
            SYSTEM_PARAMETERS: expect.any(Array),
          },
        }),
        BaseCodelists,
      );
    });
  });
});

describe('getLanguages function tests', () => {
  let onLoading: jest.Mock;
  let onSuccess: jest.Mock;
  let onError: jest.Mock;

  beforeEach(() => {
    ({ onLoading, onSuccess, onError } = setupMocks());
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockResponseData = [
    {
      code: 'LANGUAGES',
      label: 'Languages',
      items: [
        {
          id: 2835,
          code: 'sasas',
          label: 'ass',
          attributes: [],
          expired: true,
        },
        {
          id: 83,
          code: 'EN',
          label: 'English',
          attributes: [
            {
              key: 'primary',
              value: 'YES',
            },
          ],
          expired: false,
        },
        {
          id: 2912,
          code: 'test-1',
          label: 'Test 1 Lang',
          attributes: [],
          expired: true,
        },
        {
          id: 2913,
          code: 'test-2',
          label: 'Test 2 Lang',
          attributes: [],
          expired: true,
        },
      ],
    },
  ];

  describe('Successful API call', () => {
    it('should fetch languages and call onSuccess with correct data structure', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockResponseData });

      // Act
      await getLanguages(onLoading, onSuccess, onError);

      // Assert
      expect(onLoading).toHaveBeenCalledWith(Language);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/reference-data/codelists?codeListCodes=LANGUAGES',
      );
      expect(onError).not.toHaveBeenCalled();

      expect(onSuccess).toHaveBeenCalledWith(
        {
          CodeList: {
            LANGUAGES: mockResponseData[0].items,
          },
          System: {
            primaryLanguage: {
              id: 83,
              code: 'EN',
              label: 'English',
              attributes: [
                {
                  key: 'primary',
                  value: 'YES',
                },
              ],
              expired: false,
            },
          },
        },
        Language,
      );
    });
    it('should find primary language correctly', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockResponseData });

      // Act
      await getLanguages(onLoading, onSuccess, onError);

      // Assert
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          System: expect.objectContaining({
            primaryLanguage: expect.objectContaining({
              code: 'EN',
              label: 'English',
              attributes: expect.arrayContaining([{ key: 'primary', value: 'YES' }]),
            }),
          }),
        }),
        Language,
      );
    });
    it('should handle missing primary language', async () => {
      // Arrange
      const mockDataNoPrimary = [
        {
          ...mockResponseData[0],
          items: mockResponseData[0].items.map((item) => ({
            ...item,
            attributes: item.attributes.filter((attr) => attr.key !== 'primary'),
          })),
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockDataNoPrimary });

      // Act
      await getLanguages(onLoading, onSuccess, onError);

      // Assert
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          System: expect.objectContaining({
            primaryLanguage: undefined,
          }),
        }),
        Language,
      );
    });
    it('should handle different primary language', async () => {
      // Arrange
      const mockDataDifferentPrimary = [
        {
          ...mockResponseData[0],
          items: [
            {
              ...mockResponseData[0].items[0],
              attributes: [{ key: 'primary', value: BOOLEAN_CODELIST_ATTRIBUTES.YES }],
            },
            {
              ...mockResponseData[0].items[1],
              attributes: [{ key: 'primary', value: 'NO' }],
            },
            ...mockResponseData[0].items.slice(2),
          ],
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockDataDifferentPrimary });

      // Act
      await getLanguages(onLoading, onSuccess, onError);

      // Assert
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          System: expect.objectContaining({
            primaryLanguage: expect.objectContaining({
              code: 'sasas',
            }),
          }),
        }),
        Language,
      );
    });
    it('should handle empty response data', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: [] });

      // Act
      await getLanguages(onLoading, onSuccess, onError);

      // Assert
      expect(onSuccess).toHaveBeenCalledWith(
        {
          CodeList: {},
          System: {
            primaryLanguage: undefined,
          },
        },
        Language,
      );
    });
    it('should handle null/undefined response data', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: null });

      // Act
      await getLanguages(onLoading, onSuccess, onError);

      // Assert
      expect(onSuccess).toHaveBeenCalledWith(
        {
          CodeList: {},
          System: {
            primaryLanguage: undefined,
          },
        },
        Language,
      );
    });
    it('should handle missing languages codelist', async () => {
      // Arrange
      const mockDataNoLanguages = [
        {
          code: 'OTHER_CODELIST',
          label: 'Other Codelist',
          items: [{ code: 'TEST', label: 'Test' }],
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockDataNoLanguages });

      // Act
      await getLanguages(onLoading, onSuccess, onError);

      // Assert
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          CodeList: {
            OTHER_CODELIST: [{ code: 'TEST', label: 'Test' }],
          },
          System: expect.objectContaining({
            primaryLanguage: undefined,
          }),
        }),
        Language,
      );
    });
    it('should handle languages codelist with empty items', async () => {
      // Arrange
      const mockDataEmptyItems = [
        {
          code: 'LANGUAGES',
          label: 'Languages',
          items: [],
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockDataEmptyItems });

      // Act
      await getLanguages(onLoading, onSuccess, onError);

      // Assert
      expect(onSuccess).toHaveBeenCalledWith(
        {
          CodeList: {
            LANGUAGES: [],
          },
          System: {
            primaryLanguage: undefined,
          },
        },
        Language,
      );
    });
  });
  describe('API call failures', () => {
    it('should call onError when API request fails', async () => {
      // Arrange
      setupErrorTest(new Error('Network error'), 'get');

      // Act
      await getLanguages(onLoading, onSuccess, onError);

      // Assert
      expect(onLoading).toHaveBeenCalledWith(Language);
      expect(onError).toHaveBeenCalledWith(Language);
      expect(onSuccess).not.toHaveBeenCalled();
    });
    it('should handle axios timeout error', async () => {
      // Arrange
      setupErrorTest({ code: 'ECONNABORTED', message: 'timeout of 5000ms exceeded' }, 'get');

      // Act
      await getLanguages(onLoading, onSuccess, onError);

      // Assert
      expect(onError).toHaveBeenCalledWith(Language);
    });
  });
  describe('Data processing', () => {
    it('should call dataToStore and sortByLabelOrCode for languages', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockResponseData });

      // Act
      await getLanguages(onLoading, onSuccess, onError);

      // Assert
      expect(mockedDataToStore).toHaveBeenCalledTimes(1);
      expect(mockedDataToStore).toHaveBeenCalledWith({}, mockResponseData[0].items);
      expect(mockedSortByLabelOrCode).toHaveBeenCalledTimes(1);
    });
    it('should handle languages with null or undefined items', async () => {
      // Arrange
      const mockDataWithNullItems = [
        {
          code: 'LANGUAGES',
          label: 'Languages',
          items: null,
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockDataWithNullItems });

      // Act
      await getLanguages(onLoading, onSuccess, onError);

      // Assert
      expect(mockedDataToStore).toHaveBeenCalledWith({}, []);
    });
  });
});

describe('getMenu function tests', () => {
  let onLoading: jest.Mock;
  let onSuccess: jest.Mock;
  let onError: jest.Mock;

  beforeEach(() => {
    ({ onLoading, onSuccess, onError } = setupMocks());
  });

  const mockMenuData = [
    {
      code: 'tst',
      codeDescription: 'Archiving',
      target: null,
      order: 0,
      children: null,
      dataArea: null,
    },
    {
      code: 'ADMIN',
      codeDescription: 'Admin',
      target: null,
      order: 10,
      children: [
        {
          code: 'SECURITY',
          codeDescription: 'Security',
          target: null,
          order: 50,
          children: [
            {
              code: 'SECURABLE-OBJECTS',
              codeDescription: 'Securable Objects',
              target: 'page/SecurableObject/list',
              order: 10,
              children: null,
              dataArea:
                '{"securableObjectKey" : "MENU/authorization-management/securable-objects/", "securableObjectOperation" : "VIEW"}',
            },
          ],
          dataArea:
            '{"securableObjectKey" : "MENU/GroupSecurity", "securableObjectOperation" : "VIEW"}',
        },
      ],
      dataArea: '{"securableObjectKey" : "MENU/GroupAdmin", "securableObjectOperation" : "VIEW"}',
    },
  ];

  describe('Successful API call', () => {
    it('should fetch menu for ISS application with ISS_INTERNAL menuTypeCL', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockMenuData });

      // Act
      await getMenu(onLoading, onSuccess, onError, 'ISS');

      // Assert
      expect(onLoading).toHaveBeenCalledWith(Menu);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/ui-configuration/menus/tree?menuTypeCL=ISS_INTERNAL',
      );
      expect(onSuccess).toHaveBeenCalledWith(
        {
          Menu: mockMenuData,
        },
        Menu,
      );
      expect(onError).not.toHaveBeenCalled();
    });
    it('should fetch menu for any non-ISS application with INTERNAL menuTypeCL', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: mockMenuData });

      // Act
      await getMenu(onLoading, onSuccess, onError, 'REGISTRATION');

      // Assert
      expect(onLoading).toHaveBeenCalledWith(Menu);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/ui-configuration/menus/tree?menuTypeCL=INTERNAL',
      );
      expect(onSuccess).toHaveBeenCalledWith(
        {
          Menu: mockMenuData,
        },
        Menu,
      );
      expect(onError).not.toHaveBeenCalled();
    });
  });
  describe('API call failures', () => {
    it('should call onError when API request fails for ISS application', async () => {
      // Arrange
      setupErrorTest(new Error('Network error'), 'get');

      // Act
      await getMenu(onLoading, onSuccess, onError, 'ISS');

      // Assert
      expect(onLoading).toHaveBeenCalledWith(Menu);
      expect(onError).toHaveBeenCalledWith(Menu);
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });
});

describe('getUserPreferences function test', () => {
  let onLoading: jest.Mock;
  let onSuccess: jest.Mock;
  let onError: jest.Mock;

  beforeEach(() => {
    ({ onLoading, onSuccess, onError } = setupMocks());
  });
  const userId = 'user123';

  describe('ISS Application', () => {
    const mockISSResponse = {
      id: 'user-user-user',
      identificationLabel:
        'Example User, Tax Identification Number: exampleuser, Self Service User',
      party: {
        id: 'user-user-user--irm-party-uuid-36cha',
        identificationLabel: 'Example User, Tax Identification Number: exampleuser',
      },
      partyRoleTypeCode: 'SOTAXSSUSR',
      partyRoleTypeDescription: 'Self Service User',
      partyRoleTypeCategoryCL: 'SOTAXSS_USER',
      partyRoleTypeCategoryCLDescription: null,
      dataArea:
        '{"themeMode": "light", "themeType": "LARGE", "themeSource": "system", "applyShortcuts": false, "customizeTheme": false, "preferredLanguage": "EN"}',
      eligibleIdentifiers: [
        {
          id: 'user-user-user-priden-ss-username-id',
          partyIdentifier: {
            id: 'user-user-user-pident-ss-username-id',
            identificationLabel: 'Self Service User name: ss-user',
          },
          primary: false,
        },
        {
          id: 'user-user-user-priden-ss-subject--id',
          partyIdentifier: {
            id: 'user-user-user-pident-ss-subject--id',
            identificationLabel: 'Self Service Subject Id: 8dcea3cf-2f7',
          },
          primary: true,
        },
      ],
      eligibleAddresses: [],
      eligibleContacts: [],
      states: [
        {
          id: 'user-user-user-ss-state-active-id-36',
          partyStateCL: 'ACTIVE',
          partyStateCLDescription: 'Active',
          startDate: '2024-01-01',
          endDate: null,
        },
      ],
    };

    it('should fetch user preferences for ISS application and parse dataArea', async () => {
      // Arrange
      mockedAxios.request.mockResolvedValue({ data: mockISSResponse });

      // Act
      await getUserPreferences(userId, 'ISS', onLoading, onSuccess, onError);

      // Assert
      expect(onLoading).toHaveBeenCalledWith(UserPreferences);
      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'GET',
        url: `http://localhost:3000/api/ss-registry/portal-users/${userId}`,
      });
      expect(onSuccess).toHaveBeenCalledWith({
        themeMode: 'light',
        themeType: 'LARGE',
        themeSource: 'system',
        applyShortcuts: false,
        customizeTheme: false,
        preferredLanguage: 'EN',
      });
      expect(onError).not.toHaveBeenCalled();
    });
    it('should handle ISS application with empty dataArea', async () => {
      // Arrange
      const mockResponseEmptyDataArea = { ...mockISSResponse, dataArea: '{}' };
      mockedAxios.request.mockResolvedValue({ data: mockResponseEmptyDataArea });

      // Act
      await getUserPreferences(userId, 'ISS', onLoading, onSuccess, onError);

      // Assert
      expect(onLoading).toHaveBeenCalledWith(UserPreferences);
      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'GET',
        url: `http://localhost:3000/api/ss-registry/portal-users/${userId}`,
      });
      expect(onSuccess).toHaveBeenCalledWith({});
      expect(onError).not.toHaveBeenCalled();
    });
    it('should handle ISS application with missing dataArea property', async () => {
      // Arrange
      const { dataArea, ...mockResponseNoDataArea } = mockISSResponse;
      mockedAxios.request.mockResolvedValue({ data: mockResponseNoDataArea });

      // Act
      await getUserPreferences(userId, 'ISS', onLoading, onSuccess, onError);

      // Assert
      expect(onLoading).toHaveBeenCalledWith(UserPreferences);
      expect(onError).toHaveBeenCalledWith(UserPreferences);
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('IRM Application', () => {
    const mockIRMResponse = {
      pageMetadata: {
        requestedPageSize: 100,
        requestedPageNumber: 0,
        totalElements: 1,
        totalPages: 1,
        currentPageNumberOfElements: 1,
        currentPageNumber: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
      content: [
        {
          id: 'user-user-user--irm',
          identificationLabel: 'Example User, exampleuser, Active',
          dataArea: '{"themeMode": "light", "preferredLanguage": "EN", "applyShortcuts": true}',
        },
      ],
    };

    it('should fetch user preferences for IRM application and parse content[0].dataArea', async () => {
      // Arrange
      mockedAxios.request.mockResolvedValue({ data: mockIRMResponse });

      // Act
      await getUserPreferences(userId, 'IRM', onLoading, onSuccess, onError);

      // Assert
      expect(onLoading).toHaveBeenCalledWith(UserPreferences);
      expect(mockedAxios.request).toHaveBeenCalledWith({
        data: { ids: [userId], partyRoleTypeCode: 'SOTAXUSER' },
        method: 'POST',
        url: 'http://localhost:3000/api/registration/users/search',
      });
      expect(onSuccess).toHaveBeenCalledWith({
        themeMode: 'light',
        preferredLanguage: 'EN',
        applyShortcuts: true,
      });
      expect(onError).not.toHaveBeenCalled();
    });
    it('should handle IRM application with empty content array', async () => {
      // Arrange
      const mockEmptyContent = { ...mockIRMResponse, content: [] };
      mockedAxios.request.mockResolvedValue({ data: mockEmptyContent });

      // Act
      await getUserPreferences(userId, 'IRM', onLoading, onSuccess, onError);

      // Assert
      expect(onLoading).toHaveBeenCalledWith(UserPreferences);
      expect(onError).toHaveBeenCalledWith(UserPreferences);
      expect(onSuccess).not.toHaveBeenCalled();
    });
    it('should handle IRM application with empty dataArea in content[0]', async () => {
      // Arrange
      const mockEmptyDataArea = {
        ...mockIRMResponse,
        content: [{ ...mockIRMResponse.content[0], dataArea: '{}' }],
      };
      mockedAxios.request.mockResolvedValue({ data: mockEmptyDataArea });

      // Act
      await getUserPreferences(userId, 'IRM', onLoading, onSuccess, onError);

      // Assert
      expect(onLoading).toHaveBeenCalledWith(UserPreferences);
      expect(onSuccess).toHaveBeenCalledWith({});
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('Other Applications', () => {
    it('should return empty object for unknown applications', async () => {
      // Arrange
      mockedAxios.request.mockResolvedValue({ data: {} });

      // Act
      await getUserPreferences(userId, 'OTHER_APP', onLoading, onSuccess, onError);

      // Assert
      expect(onLoading).toHaveBeenCalledWith(UserPreferences);
      expect(mockedAxios.request).toHaveBeenCalledWith({
        data: { ids: [userId], partyRoleTypeCode: 'SOTAXUSER' },
        method: 'POST',
        url: 'http://localhost:3000/api/registration/users/search',
      });
      expect(onSuccess).toHaveBeenCalledWith({});
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('API call failures', () => {
    it('should handle API errors for ISS application', async () => {
      // Arrange
      setupErrorTest(new Error('Network error'), 'get');

      // Act
      await getUserPreferences(userId, 'ISS', onLoading, onSuccess, onError);

      // Assert
      expect(onLoading).toHaveBeenCalledWith(UserPreferences);
      expect(onError).toHaveBeenCalledWith(UserPreferences);
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });
});

describe('getCurrentAccount', () => {
  let onLoading: jest.Mock;
  let onSuccess: jest.Mock;
  let onError: jest.Mock;

  beforeEach(() => {
    ({ onLoading, onSuccess, onError } = setupMocks());
  });

  const mockCurrentAccountResponse = {
    userId: 'user-user-user',
    favoriteAccountId: '58784bde',
    lastAccountId: '58784bde',
    lastLoginDateTime: '2025-03-31T18:28:36.577919Z',
  };

  it('should fetch current account successfully', async () => {
    // Arrange
    mockedAxios.get.mockResolvedValue({ data: mockCurrentAccountResponse });

    // Act
    await getCurrentAccount(onLoading, onSuccess, onError);

    // Assert
    expect(onLoading).toHaveBeenCalledWith(CurrentAccount);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3000/api/ss-registry/default-accounts/currentUser',
    );
    expect(onSuccess).toHaveBeenCalledWith(
      {
        LoggedInPartyRole: {
          userId: 'user-user-user',
          favoriteAccountId: '58784bde',
          lastAccountId: '58784bde',
          lastLoginDateTime: '2025-03-31T18:28:36.577919Z',
        },
      },
      CurrentAccount,
    );
    expect(onError).not.toHaveBeenCalled();
  });
  it('should handle current account with missing optional fields', async () => {
    // Arrange
    const mockPartialResponse = {
      userId: 'user-user-user',
      lastLoginDateTime: '2025-03-31T18:28:36.577919Z',
    };
    mockedAxios.get.mockResolvedValue({ data: mockPartialResponse });

    // Act
    await getCurrentAccount(onLoading, onSuccess, onError);

    // Assert
    expect(onLoading).toHaveBeenCalledWith(CurrentAccount);
    expect(onSuccess).toHaveBeenCalledWith(
      {
        LoggedInPartyRole: {
          userId: 'user-user-user',
          lastLoginDateTime: '2025-03-31T18:28:36.577919Z',
        },
      },
      CurrentAccount,
    );
    expect(onError).not.toHaveBeenCalled();
  });
  it('should handle API errors', async () => {
    // Arrange
    setupErrorTest(new Error('Unauthorized'), 'get');

    // Act
    await getCurrentAccount(onLoading, onSuccess, onError);

    // Assert
    expect(onLoading).toHaveBeenCalledWith(CurrentAccount);
    expect(onError).toHaveBeenCalledWith(CurrentAccount);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

describe('getRevenueTypes', () => {
  let onLoading: jest.Mock;
  let onSuccess: jest.Mock;
  let onError: jest.Mock;

  beforeEach(() => {
    ({ onLoading, onSuccess, onError } = setupMocks());
  });

  it('should fetch revenue types successfully', async () => {
    // Arrange
    const mockResponse = {
      data: {
        content: [
          { revenue_type_cd: 'TYPE1' },
          { revenue_type_cd: 'TYPE2' },
          { revenue_type_cd: 'TYPE3' },
        ],
      },
    };
    mockedAxios.post.mockResolvedValue(mockResponse);

    // Act
    await getRevenueTypes(onLoading, onSuccess, onError);

    // Assert
    expect(onLoading).toHaveBeenCalledWith(RevenueTypes);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/iss-service-management/operations/execute-paginated',
      {
        operation: 'getAllowedRevenueTypeCodes',
        revenueTypeCodes: [],
        parameters: {},
      },
    );
    expect(onSuccess).toHaveBeenCalledWith(
      {
        LoggedInPartyRole: {
          revenueTypes: ['TYPE1', 'TYPE2', 'TYPE3'],
          fetchedRevenueTypes: true,
        },
      },
      RevenueTypes,
    );
    expect(onError).not.toHaveBeenCalled();
  });
  it('should handle empty content array', async () => {
    // Arrange
    const mockResponse = { data: { content: [] } };
    mockedAxios.post.mockResolvedValue(mockResponse);

    // Act
    await getRevenueTypes(onLoading, onSuccess, onError);

    // Assert
    expect(onLoading).toHaveBeenCalledWith(RevenueTypes);
    expect(onSuccess).toHaveBeenCalledWith(
      {
        LoggedInPartyRole: {
          revenueTypes: [],
          fetchedRevenueTypes: true,
        },
      },
      RevenueTypes,
    );
    expect(onError).not.toHaveBeenCalled();
  });
  it('should handle missing content property', async () => {
    // Arrange
    const mockResponse = { data: {} };
    mockedAxios.post.mockResolvedValue(mockResponse);

    // Act
    await getRevenueTypes(onLoading, onSuccess, onError);

    // Assert
    expect(onLoading).toHaveBeenCalledWith(RevenueTypes);
    expect(onSuccess).toHaveBeenCalledWith(
      {
        LoggedInPartyRole: {
          revenueTypes: [],
          fetchedRevenueTypes: true,
        },
      },
      RevenueTypes,
    );
    expect(onError).not.toHaveBeenCalled();
  });
  it('should handle API errors', async () => {
    // Arrange
    setupErrorTest(new Error('API Error'), 'post');

    // Act
    await getRevenueTypes(onLoading, onSuccess, onError);

    // Assert
    expect(onLoading).toHaveBeenCalledWith(RevenueTypes);
    expect(onError).toHaveBeenCalledWith(RevenueTypes);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

describe('getPartyRoleDetails', () => {
  let onLoading: jest.Mock;
  let onSuccess: jest.Mock;
  let onError: jest.Mock;

  beforeEach(() => {
    ({ onLoading, onSuccess, onError } = setupMocks());
  });

  const accountId = 'acc123';

  it('should fetch party role details successfully', async () => {
    // Arrange
    const mockResponse = {
      data: {
        content: [
          {
            id: 'role123',
            partyId: 'party456',
            identificationLabel: 'Role Label',
            partyIdentificationLabel: 'Party Label',
          },
        ],
      },
    };
    mockedAxios.post.mockResolvedValue(mockResponse);

    // Act
    await getPartyRoleDetails(accountId, onLoading, onSuccess, onError);

    // Assert
    expect(onLoading).toHaveBeenCalledWith(PartyRoleDetails);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/iss-service-management/operations/execute-simple',
      {
        operation: 'getPartyRoleIdentification',
        revenueTypeCodes: [],
        parameters: {},
      },
    );
    expect(onSuccess).toHaveBeenCalledWith(
      {
        LoggedInPartyRole: {
          partyRoleDetails: {
            partyRoleId: 'role123',
            partyId: 'party456',
            identificationLabel: 'Role Label',
            partyIdentificationLabel: 'Party Label',
          },
        },
      },
      PartyRoleDetails,
    );
    expect(onError).not.toHaveBeenCalled();
  });
  it('should handle empty content array', async () => {
    // Arrange
    const mockResponse = { data: { content: [] } };
    mockedAxios.post.mockResolvedValue(mockResponse);

    // Act
    await getPartyRoleDetails(accountId, onLoading, onSuccess, onError);

    // Assert
    expect(onLoading).toHaveBeenCalledWith(PartyRoleDetails);
    expect(onError).toHaveBeenCalledWith(PartyRoleDetails);
    expect(onSuccess).not.toHaveBeenCalled();
  });
  it('should handle API errors', async () => {
    // Arrange
    setupErrorTest(new Error('Server Error'), 'post');

    // Act
    await getPartyRoleDetails(accountId, onLoading, onSuccess, onError);

    // Assert
    expect(onLoading).toHaveBeenCalledWith(PartyRoleDetails);
    expect(onError).toHaveBeenCalledWith(PartyRoleDetails);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

describe('getSecurableObjects', () => {
  let onLoading: jest.Mock;
  let onSuccess: jest.Mock;
  let onError: jest.Mock;

  beforeEach(() => {
    ({ onLoading, onSuccess, onError } = setupMocks());
  });
  const userId = 'user123';

  it('should fetch securable objects successfully', async () => {
    // Arrange
    const mockSecurableObjects = [
      { id: 'obj1', name: 'Object 1', permissions: ['READ', 'WRITE'] },
      { id: 'obj2', name: 'Object 2', permissions: ['READ'] },
    ];
    mockedAxios.get.mockResolvedValue({ data: mockSecurableObjects });

    // Act
    await getSecurableObjects(userId, onLoading, onSuccess, onError);

    // Assert
    expect(onLoading).toHaveBeenCalledWith(SecurableObjects);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `http://localhost:3000/api/authorization-management/user-roles/${userId}/securable-objects`,
    );
    expect(onSuccess).toHaveBeenCalledWith(
      {
        LoggedInUser: { securableObjects: mockSecurableObjects },
        System: { securableObjects: mockSecurableObjects },
      },
      SecurableObjects,
    );
    expect(onError).not.toHaveBeenCalled();
  });
  it('should handle empty securable objects array', async () => {
    // Arrange
    mockedAxios.get.mockResolvedValue({ data: [] });

    // Act
    await getSecurableObjects(userId, onLoading, onSuccess, onError);

    // Assert
    expect(onLoading).toHaveBeenCalledWith(SecurableObjects);
    expect(onSuccess).toHaveBeenCalledWith(
      {
        LoggedInUser: { securableObjects: [] },
        System: { securableObjects: [] },
      },
      SecurableObjects,
    );
    expect(onError).not.toHaveBeenCalled();
  });
  it('should handle API errors', async () => {
    // Arrange
    setupErrorTest(new Error('Forbidden'), 'get');

    // Act
    await getSecurableObjects(userId, onLoading, onSuccess, onError);

    // Assert
    expect(onLoading).toHaveBeenCalledWith(SecurableObjects);
    expect(onError).toHaveBeenCalledWith(SecurableObjects);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

describe('constructDataToSend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedWrapEntityDataArea.mockImplementation((data) => ({ ...data, wrapped: true }));
  });

  describe('when uiSchema has no customFieldsKey', () => {
    it('returns data as-is when ui:page has no customFieldsKey', () => {
      const data = { name: 'test' };
      const uiSchema = { 'ui:page': {} };

      const result = constructDataToSend(data, undefined, uiSchema);

      expect(result).toBe(data);
      expect(mockedWrapEntityDataArea).not.toHaveBeenCalled();
    });

    it('returns data as-is when ui:page is absent', () => {
      const data = { name: 'test' };
      const uiSchema = {};

      const result = constructDataToSend(data, undefined, uiSchema);

      expect(result).toBe(data);
      expect(mockedWrapEntityDataArea).not.toHaveBeenCalled();
    });

    it('returns empty object when data is not provided and no customFieldsKey', () => {
      const uiSchema = { 'ui:page': {} };

      const result = constructDataToSend(undefined, undefined, uiSchema);

      expect(result).toEqual({});
      expect(mockedWrapEntityDataArea).not.toHaveBeenCalled();
    });
  });

  describe('when uiSchema has customFieldsKey and no wrapToProperty', () => {
    it('calls wrapEntityDataArea with full data', () => {
      const data = { name: 'test' };
      const uiSchema = { 'ui:page': { customFieldsKey: 'dataArea' } };
      const wrapped = { name: 'test', wrapped: true };
      mockedWrapEntityDataArea.mockReturnValue(wrapped);

      const result = constructDataToSend(data, undefined, uiSchema);

      expect(mockedWrapEntityDataArea).toHaveBeenCalledWith(data, 'dataArea', uiSchema);
      expect(result).toBe(wrapped);
    });

    it('calls wrapEntityDataArea with empty object when data is not provided', () => {
      const uiSchema = { 'ui:page': { customFieldsKey: 'dataArea' } };
      mockedWrapEntityDataArea.mockReturnValue({ wrapped: true });

      constructDataToSend(undefined, undefined, uiSchema);

      expect(mockedWrapEntityDataArea).toHaveBeenCalledWith({}, 'dataArea', uiSchema);
    });
  });

  describe('when uiSchema has customFieldsKey and wrapToProperty is set', () => {
    it('calls wrapEntityDataArea on the nested property and merges the result', () => {
      const data = { header: { amount: 100 }, other: 'value' };
      const uiSchema = { 'ui:page': { customFieldsKey: 'dataArea' } };
      const wrappedHeader = { amount: 100, wrapped: true };
      mockedWrapEntityDataArea.mockReturnValue(wrappedHeader);

      const result = constructDataToSend(data, 'header', uiSchema);

      expect(mockedWrapEntityDataArea).toHaveBeenCalledWith(data['header'], 'dataArea', uiSchema);
      expect(result).toEqual({ header: wrappedHeader, other: 'value' });
    });

    it('spreads original data and only replaces the wrapToProperty key', () => {
      const data = { header: { amount: 50 }, footer: { note: 'test' } };
      const uiSchema = { 'ui:page': { customFieldsKey: 'dataArea' } };
      const wrappedHeader = { amount: 50, wrapped: true };
      mockedWrapEntityDataArea.mockReturnValue(wrappedHeader);

      const result = constructDataToSend(data, 'header', uiSchema) as typeof data;

      expect(result.footer).toEqual({ note: 'test' });
      expect(result.header).toBe(wrappedHeader);
    });

    it('handles wrapToProperty pointing to an undefined nested value', () => {
      const data = { other: 'value' };
      const uiSchema = { 'ui:page': { customFieldsKey: 'dataArea' } };
      mockedWrapEntityDataArea.mockReturnValue(undefined);

      const result = constructDataToSend(data, 'missing', uiSchema);

      expect(mockedWrapEntityDataArea).toHaveBeenCalledWith(undefined, 'dataArea', uiSchema);
      expect(result).toEqual({ other: 'value', missing: undefined });
    });
  });

  describe('when uiSchema has customFieldsKey, no wrapToProperty and removeWrappingIfEmpty flag is true', () => {
    it('does not remove wrapping if there is content in it', () => {
      const data = { name: 'test' };
      const uiSchema = { 'ui:page': { customFieldsKey: 'dataArea' } };
      const wrapped = { name: 'test', dataArea: '{ ..... }' };
      mockedWrapEntityDataArea.mockReturnValue(wrapped);

      const result = constructDataToSend(data, undefined, uiSchema, true);

      expect(mockedWrapEntityDataArea).toHaveBeenCalledWith(data, 'dataArea', uiSchema);
      expect(result).toBe(wrapped);
    });

    it('does remove wrapping if there is no content in it', () => {
      const data = { name: 'test' };
      const uiSchema = { 'ui:page': { customFieldsKey: 'dataArea' } };
      const wrapped = { name: 'test', dataArea: '  {   }  ' }; //Leave this as is, to test proper white space removing
      mockedWrapEntityDataArea.mockReturnValue(wrapped);

      const result = constructDataToSend(data, undefined, uiSchema, true);

      expect(mockedWrapEntityDataArea).toHaveBeenCalledWith(data, 'dataArea', uiSchema);
      expect(result).toEqual({ name: 'test' });
    });
  });

  describe('when uiSchema has customFieldsKey and wrapToProperty is set and removeWrappingIfEmpty flag is true', () => {
    it('does not remove wrapping if there is content in it', () => {
      const data = { header: { amount: 100 }, other: 'value' };
      const uiSchema = { 'ui:page': { customFieldsKey: 'dataArea' } };
      const wrappedHeader = { amount: 100, dataArea: '{...}' };
      mockedWrapEntityDataArea.mockReturnValue(wrappedHeader);

      const result = constructDataToSend(data, 'header', uiSchema, true);

      expect(mockedWrapEntityDataArea).toHaveBeenCalledWith(data['header'], 'dataArea', uiSchema);
      expect(result).toEqual({ header: wrappedHeader, other: 'value' });
    });

    it('does remove wrapping if there is no content in it', () => {
      const data = { header: { amount: 100 }, other: 'value' };
      const uiSchema = { 'ui:page': { customFieldsKey: 'dataArea' } };
      const wrappedHeader = { amount: 100, dataArea: '{  }' };
      mockedWrapEntityDataArea.mockReturnValue(wrappedHeader);

      const result = constructDataToSend(data, 'header', uiSchema, true);

      expect(mockedWrapEntityDataArea).toHaveBeenCalledWith(data['header'], 'dataArea', uiSchema);
      expect(result).toEqual({ header: { amount: 100 }, other: 'value' });
    });
  });
});
