import { renderHook } from '@testing-library/react';
import useMenu from './useMenu';
import { getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';
import { mockUserHook } from '@_jestHelpers/useUserMock';
import * as useSystem from '@pkg-setup/src/system/useSystem';

const mockUseSystem = jest.spyOn(useSystem, 'default');

describe('useMenu', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    delete window['SHOULD_CHECK_MENU_SERVICES'];
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockMenuItems = [
    {
      code: 'item1',
      codeDescription: 'Item 1',
      target: 'target1',
      dataArea: JSON.stringify({
        securableObjectKey: 'item1',
        securableObjectOperation: 'VIEW',
      }),
      children: [
        {
          code: 'item11',
          target: 'target11',
          dataArea: JSON.stringify({
            securableObjectKey: 'item11',
            securableObjectOperation: 'VIEW',
          }),
        },
      ],
    },
    {
      code: 'item2',
      target: 'target2',
      dataArea: JSON.stringify({
        securableObjectKey: 'item2',
        securableObjectOperation: 'VIEW',
        services: ['SERVICE1', 'SERVICE2'],
      }),
    },
    {
      code: 'adminItem',
      target: 'admin',
      dataArea: JSON.stringify({
        securableObjectKey: 'adminItem',
        securableObjectOperation: 'VIEW',
        isAdmin: true,
      }),
    },
  ];

  const createStoreData = (items = mockMenuItems) => ({
    Menu: { items },
    System: {
      apiUrl: '',
      systemUsed: 'IRM',
    },
  });

  const createMockSystemReturn = (overrides = {}) => ({
    useStaticSchemas: true,
    useDefaultTranslations: true,
    applyPermissions: true,
    applySecObjectPermissions: false,
    apiUrl: 'https://test-api.com',
    allSymbol: '*',
    application: 'IRM',
    getSystemAssets: 'assets-url',
    primaryCurrency: { code: 'USD' },
    primaryLanguage: { code: 'EN' },
    retentionPeriod: 30,
    selectedLanguage: 'EN',
    selectedLocale: {},
    lastUpdate: 1234567890,
    hideInactive: 'N' as 'N' | 'Y' | undefined,
    hideExpired: 'N' as 'N' | 'Y' | undefined,
    sourceCurrencyMode: 'N' as 'N' | 'Y' | undefined,
    isSignReversed: false,
    themes: [],
    authToken: 'mock-token',
    securableObjects: {},
    init: jest.fn(),
    clear: jest.fn(),
    update: jest.fn(),
    ...overrides,
  });

  describe('IRM application', () => {
    beforeEach(() => {
      mockUseSystem.mockReturnValue(
        createMockSystemReturn({
          application: 'IRM',
          applySecObjectPermissions: false,
        }),
      );
    });

    it('should return menu items filtered by securable objects for IRM', () => {
      const storeData = createStoreData();

      mockUserHook({
        item1VIEW: true,
        item11VIEW: true,
      });

      const { wrapper } = getMockWrapperAndStore(storeData);
      const { result } = renderHook(() => useMenu(), { wrapper });

      expect(result.current.items).toEqual([
        {
          code: 'item1',
          codeDescription: 'Item 1',
          target: 'target1',
          dataArea: JSON.stringify({
            securableObjectKey: 'item1',
            securableObjectOperation: 'VIEW',
          }),
          id: 'item1',
          title: 'Item 1',
          path: '/target1',
          children: [
            {
              code: 'item11',
              target: 'target11',
              dataArea: JSON.stringify({
                securableObjectKey: 'item11',
                securableObjectOperation: 'VIEW',
              }),
              id: 'item11',
              title: 'item11',
              path: '/target11',
              children: null,
            },
          ],
        },
      ]);
    });

    it('should filter out items without permissions for IRM', () => {
      const storeData = createStoreData();

      mockUserHook({
        item2VIEW: false,
      });

      const { wrapper } = getMockWrapperAndStore(storeData);
      const { result } = renderHook(() => useMenu(), { wrapper });

      expect(result.current.items).toEqual([]);
    });

    it('should filter out items without dataArea for IRM', () => {
      const itemsWithoutDataArea = [
        {
          code: 'item1',
          target: 'target1',
        },
      ] as any;
      const storeData = createStoreData(itemsWithoutDataArea);

      mockUserHook({});

      const { wrapper } = getMockWrapperAndStore(storeData);
      const { result } = renderHook(() => useMenu(), { wrapper });

      expect(result.current.items).toEqual([]);
    });
  });

  describe('ISS application with applySecObjectPermissions = false', () => {
    beforeEach(() => {
      mockUseSystem.mockReturnValue(
        createMockSystemReturn({
          application: 'ISS',
          applySecObjectPermissions: false,
        }),
      );
    });

    it('should return admin items for admin users', () => {
      const storeData = createStoreData();

      mockUserHook(
        {},
        {
          allowedServices: ['SERVICE1'],
          isAdminUser: true,
        },
      );

      const { wrapper } = getMockWrapperAndStore(storeData);
      const { result } = renderHook(() => useMenu(), { wrapper });

      const adminItem = result.current.items.find((item) => item.code === 'adminItem');
      expect(adminItem).toBeDefined();
    });

    it('should filter out admin items for non-admin users', () => {
      const storeData = createStoreData();

      mockUserHook(
        {},
        {
          allowedServices: ['SERVICE1'],
          isAdminUser: false,
        },
      );

      const { wrapper } = getMockWrapperAndStore(storeData);
      const { result } = renderHook(() => useMenu(), { wrapper });

      const adminItem = result.current.items.find((item) => item.code === 'adminItem');
      expect(adminItem).toBeUndefined();
    });

    it('should return items based on allowed services', () => {
      window['SHOULD_CHECK_MENU_SERVICES'] = 'true';
      const storeData = createStoreData();

      mockUserHook(
        {},
        {
          allowedServices: ['SERVICE1'],
          isAdminUser: false,
        },
      );

      const { wrapper } = getMockWrapperAndStore(storeData);
      const { result } = renderHook(() => useMenu(), { wrapper });

      const serviceItem = result.current.items.find((item) => item.code === 'item2');
      expect(serviceItem).toBeDefined();
    });

    it('should return items regardless of services when SHOULD_CHECK_MENU_SERVICES defaults to false', () => {
      const storeData = createStoreData();

      mockUserHook(
        {},
        {
          allowedServices: ['SERVICE3'],
          isAdminUser: false,
        },
      );

      const { wrapper } = getMockWrapperAndStore(storeData);
      const { result } = renderHook(() => useMenu(), { wrapper });

      const serviceItem = result.current.items.find((item) => item.code === 'item2');
      expect(serviceItem).toBeDefined();
    });

    it('should return all items by default when SHOULD_CHECK_MENU_SERVICES is not explicitly set', () => {
      const storeData = createStoreData();

      mockUserHook(
        {},
        {
          allowedServices: [],
          isAdminUser: false,
        },
      );

      const { wrapper } = getMockWrapperAndStore(storeData);
      const { result } = renderHook(() => useMenu(), { wrapper });

      const serviceItem = result.current.items.find((item) => item.code === 'item2');
      expect(serviceItem).toBeDefined();
    });

    it('should return all items when SHOULD_CHECK_MENU_SERVICES is false', () => {
      window['SHOULD_CHECK_MENU_SERVICES'] = 'false';
      const storeData = createStoreData();

      mockUserHook(
        {},
        {
          allowedServices: [],
          isAdminUser: false,
        },
      );

      const { wrapper } = getMockWrapperAndStore(storeData);
      const { result } = renderHook(() => useMenu(), { wrapper });

      const serviceItem = result.current.items.find((item) => item.code === 'item2');
      expect(serviceItem).toBeDefined();
    });
  });

  describe('ISS application with applySecObjectPermissions = true', () => {
    beforeEach(() => {
      mockUseSystem.mockReturnValue(
        createMockSystemReturn({
          application: 'ISS',
          applySecObjectPermissions: true,
        }),
      );
    });

    it('should check both securable objects and services for non-admin items', () => {
      const storeData = createStoreData();

      mockUserHook(
        {
          item2VIEW: true,
        },
        {
          allowedServices: ['SERVICE1'],
          isAdminUser: false,
        },
      );

      const { wrapper } = getMockWrapperAndStore(storeData);
      const { result } = renderHook(() => useMenu(), { wrapper });

      const serviceItem = result.current.items.find((item) => item.code === 'item2');
      expect(serviceItem).toBeDefined();
    });

    it('should filter out items without securable object permissions', () => {
      const storeData = createStoreData();

      mockUserHook(
        {
          item2VIEW: false,
        },
        {
          allowedServices: ['SERVICE1'],
          isAdminUser: false,
        },
      );

      const { wrapper } = getMockWrapperAndStore(storeData);
      const { result } = renderHook(() => useMenu(), { wrapper });

      const serviceItem = result.current.items.find((item) => item.code === 'item2');
      expect(serviceItem).toBeUndefined();
    });

    it('should check only securable objects for admin items', () => {
      const storeData = createStoreData();

      mockUserHook(
        {
          adminItemVIEW: true,
        },
        {
          allowedServices: [],
          isAdminUser: true,
        },
      );

      const { wrapper } = getMockWrapperAndStore(storeData);
      const { result } = renderHook(() => useMenu(), { wrapper });

      const adminItem = result.current.items.find((item) => item.code === 'adminItem');
      expect(adminItem).toBeDefined();
    });
  });

  describe('item transformation', () => {
    beforeEach(() => {
      mockUseSystem.mockReturnValue(
        createMockSystemReturn({
          application: 'IRM',
          applySecObjectPermissions: false,
        }),
      );
    });

    it('should transform items correctly', () => {
      const storeData = createStoreData();

      mockUserHook({
        item1VIEW: true,
      });

      const { wrapper } = getMockWrapperAndStore(storeData);
      const { result } = renderHook(() => useMenu(), { wrapper });

      const transformedItem = result.current.items[0];
      expect(transformedItem).toMatchObject({
        id: 'item1',
        title: 'Item 1',
        path: '/target1',
      });
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      mockUseSystem.mockReturnValue(
        createMockSystemReturn({
          application: 'IRM',
          applySecObjectPermissions: false,
        }),
      );
    });

    it('should handle invalid JSON in dataArea gracefully', () => {
      const itemsWithInvalidJSON = [
        {
          code: 'item1',
          target: 'target1',
          dataArea: 'invalid json',
        },
      ];
      const storeData = createStoreData(itemsWithInvalidJSON);

      mockUserHook({});

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { wrapper } = getMockWrapperAndStore(storeData);
      const { result } = renderHook(() => useMenu(), { wrapper });

      expect(consoleSpy).toHaveBeenCalled();
      expect(result.current.items).toEqual([]);

      consoleSpy.mockRestore();
    });
  });

  describe('loadMainMenu action', () => {
    it('should dispatch LoadMainMenu when loadMainMenu is called', () => {
      const storeData = createStoreData();

      mockUserHook({});
      mockUseSystem.mockReturnValue(
        createMockSystemReturn({
          application: 'IRM',
          applySecObjectPermissions: false,
        }),
      );

      const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);
      const { result } = renderHook(() => useMenu(), { wrapper });

      result.current.loadMainMenu();

      expect(dispatchStub).toHaveBeenCalledTimes(1);
    });
  });

  describe('unknown application', () => {
    it('should deny access for unknown applications', () => {
      mockUseSystem.mockReturnValue(
        createMockSystemReturn({
          application: 'UNKNOWN',
          applySecObjectPermissions: false,
        }),
      );

      const storeData = createStoreData();
      mockUserHook({});

      const { wrapper } = getMockWrapperAndStore(storeData);
      const { result } = renderHook(() => useMenu(), { wrapper });

      expect(result.current.items).toEqual([]);
    });
  });
});
