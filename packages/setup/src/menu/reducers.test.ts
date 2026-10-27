import reducer, { LoadMainMenu, MENU_ITEMS_API } from './reducers';
import { Init } from '@pkg-setup/src/system/reducers';
import { MenuState, MenuItem } from '@pkg-setup/src/menu/types';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Menu reducer', () => {
  const initialState: MenuState = {
    loading: false,
    items: [],
    error: null,
  };

  const createMenuItem = (overrides: Partial<MenuItem> = {}): MenuItem => ({
    code: 'TEST_CODE',
    codeDescription: 'Test Description',
    target: 'test-target',
    order: 1,
    securableObjectKey: 'TEST_OBJECT',
    securableObjectOperationsKey: 'READ',
    children: null,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('LoadMainMenu async thunk', () => {
    let store: any;

    beforeEach(() => {
      store = configureStore({
        reducer: {
          Menu: reducer,
          System: (state = { apiUrl: 'https://test-api.com', systemUsed: 'IRM' }) => state,
        },
      });
    });

    it('should create correct action types', () => {
      expect(LoadMainMenu.pending.type).toBe('Menu/LoadMainMenu/pending');
      expect(LoadMainMenu.fulfilled.type).toBe('Menu/LoadMainMenu/fulfilled');
      expect(LoadMainMenu.rejected.type).toBe('Menu/LoadMainMenu/rejected');
    });

    it('should fetch menu items successfully for IRM application', async () => {
      const mockMenuItems: MenuItem[] = [
        createMenuItem({
          code: 'DASHBOARD',
          codeDescription: 'Dashboard',
          target: 'dashboard',
          order: 1,
          securableObjectKey: 'DASHBOARD_ACCESS',
          securableObjectOperationsKey: 'READ',
        }),
        createMenuItem({
          code: 'USERS',
          codeDescription: 'Users',
          target: 'users',
          order: 2,
          securableObjectKey: 'USER_MANAGEMENT',
          securableObjectOperationsKey: 'READ',
        }),
      ];
      const mockResponse = { data: mockMenuItems };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await store.dispatch(LoadMainMenu());

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://test-api.com/${MENU_ITEMS_API}?menuTypeCL=INTERNAL`,
      );
      expect(result.type).toBe('Menu/LoadMainMenu/fulfilled');
      expect(result.payload).toEqual(mockMenuItems);
    });

    it('should fetch menu items successfully for ISS application', async () => {
      const issStore = configureStore({
        reducer: {
          Menu: reducer,
          System: (state = { apiUrl: 'https://iss-api.com', systemUsed: 'ISS' }) => state,
        },
      });

      const mockMenuItems: MenuItem[] = [
        createMenuItem({
          code: 'SELF_SERVICE',
          codeDescription: 'Self Service',
          target: 'self-service',
          order: 1,
          securableObjectKey: 'SELF_SERVICE_ACCESS',
          securableObjectOperationsKey: 'READ',
        }),
      ];
      const mockResponse = { data: mockMenuItems };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await issStore.dispatch(LoadMainMenu());

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://iss-api.com/${MENU_ITEMS_API}?menuTypeCL=ISS_INTERNAL`,
      );
      expect(result.type).toBe('Menu/LoadMainMenu/fulfilled');
      expect(result.payload).toEqual(mockMenuItems);
    });

    it('should handle API error', async () => {
      const mockError = new Error('Network Error');
      mockedAxios.get.mockRejectedValueOnce(mockError);

      const result = await store.dispatch(LoadMainMenu());

      expect(result.type).toBe('Menu/LoadMainMenu/rejected');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://test-api.com/${MENU_ITEMS_API}?menuTypeCL=INTERNAL`,
      );
    });
  });

  describe('LoadMainMenu.pending', () => {
    it('should handle LoadMainMenu.pending', () => {
      const action = { type: LoadMainMenu.pending.type };
      const existingItem = createMenuItem({
        code: 'EXISTING',
        codeDescription: 'Existing Item',
        target: 'existing',
      });

      const state: MenuState = {
        loading: false,
        items: [existingItem],
        error: 'previous error' as any,
      };

      const expected: MenuState = {
        loading: true,
        items: [existingItem],
        error: 'previous error' as any,
      };

      expect(reducer(state, action)).toEqual(expected);
    });

    it('should set loading to true from initial state', () => {
      const action = { type: LoadMainMenu.pending.type };
      const expected: MenuState = {
        ...initialState,
        loading: true,
      };

      expect(reducer(initialState, action)).toEqual(expected);
    });
  });

  describe('LoadMainMenu.fulfilled', () => {
    it('should handle LoadMainMenu.fulfilled with menu items', () => {
      const payload: MenuItem[] = [
        createMenuItem({
          code: 'DASHBOARD',
          codeDescription: 'Dashboard',
          target: 'dashboard',
          order: 1,
          securableObjectKey: 'DASHBOARD_ACCESS',
          securableObjectOperationsKey: 'READ',
        }),
        createMenuItem({
          code: 'USERS',
          codeDescription: 'Users',
          target: 'users',
          order: 2,
          securableObjectKey: 'USER_MANAGEMENT',
          securableObjectOperationsKey: 'WRITE',
        }),
      ];

      const action = {
        type: LoadMainMenu.fulfilled.type,
        payload,
      };

      const state: MenuState = {
        loading: true,
        items: [],
        error: 'previous error' as any,
      };

      const expected: MenuState = {
        loading: false,
        items: payload,
        error: null,
      };

      expect(reducer(state, action)).toEqual(expected);
    });
  });

  describe('LoadMainMenu.rejected', () => {
    it('should handle LoadMainMenu.rejected with error message', () => {
      const mockError = { error: { message: 'Failed to load menu items' } };
      const action = {
        type: LoadMainMenu.rejected.type,
        payload: mockError,
      };

      const existingItem = createMenuItem({
        code: 'EXISTING',
        codeDescription: 'Existing Item',
        target: 'existing',
      });

      const state: MenuState = {
        loading: true,
        items: [existingItem],
        error: null,
      };

      const expected: MenuState = {
        loading: false,
        items: [],
        error: 'Failed to load menu items' as any,
      };

      expect(reducer(state, action)).toEqual(expected);
    });

    it('should handle LoadMainMenu.rejected with no error message', () => {
      const action = {
        type: LoadMainMenu.rejected.type,
        payload: {},
      };

      const testItem = createMenuItem({
        code: 'TEST',
        codeDescription: 'Test',
        target: 'test',
      });

      const state: MenuState = {
        loading: true,
        items: [testItem],
        error: null,
      };

      const expected: MenuState = {
        loading: false,
        items: [],
        error: undefined as any,
      };

      expect(reducer(state, action)).toEqual(expected);
    });
  });

  describe('Init action', () => {
    it('should handle Init action with Menu payload', () => {
      const menuItems: MenuItem[] = [
        createMenuItem({
          code: 'INIT_ITEM',
          codeDescription: 'Init Item',
          target: 'init',
          order: 1,
          securableObjectKey: 'INIT_ACCESS',
          securableObjectOperationsKey: 'READ',
        }),
      ];

      const action = {
        type: Init.type,
        payload: {
          Menu: menuItems,
          System: { apiUrl: 'test' },
        },
      };

      const state: MenuState = {
        loading: true,
        items: [],
        error: 'some error' as any,
      };

      const expected: MenuState = {
        loading: false,
        items: menuItems,
        error: 'some error' as any,
      };

      expect(reducer(state, action)).toEqual(expected);
    });

    it('should handle Init action with empty Menu payload', () => {
      const action = {
        type: Init.type,
        payload: {
          Menu: [],
          System: { apiUrl: 'test' },
        },
      };

      const oldItem = createMenuItem({
        code: 'OLD',
        codeDescription: 'Old Item',
        target: 'old',
      });

      const state: MenuState = {
        loading: true,
        items: [oldItem],
        error: null,
      };

      const expected: MenuState = {
        loading: false,
        items: [],
        error: null,
      };

      expect(reducer(state, action)).toEqual(expected);
    });

    it('should handle Init action with undefined payload', () => {
      const action = {
        type: Init.type,
        payload: undefined,
      };

      const testItem = createMenuItem({
        code: 'TEST',
        codeDescription: 'Test',
        target: 'test',
      });

      const state: MenuState = {
        loading: true,
        items: [testItem],
        error: 'some error' as any,
      };

      const expected: MenuState = {
        loading: false,
        items: [],
        error: 'some error' as any,
      };

      expect(reducer(state, action)).toEqual(expected);
    });
  });
});
