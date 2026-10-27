import reducer, { SetUserProfile, getAll, LoadUserRoleSecurableObjects } from './reducers';
import { Init } from '../system/reducers';
import axios from 'axios';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../system/reducers', () => ({
  Init: { type: '@SYSTEM/INIT' },
}));

describe('User reducers', () => {
  describe('LoggedInUser reducer', () => {
    const initialState = {
      profile: null,
      error: null,
      securableObjects: {},
      loading: false,
    };

    it('should return the initial state', () => {
      expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle SetUserProfile', () => {
      const state = reducer(initialState, SetUserProfile({ username: 'john' }));

      expect(state.profile).toEqual({ username: 'john' });
    });

    it('should handle SetUserProfile with null payload', () => {
      const state = reducer(initialState, SetUserProfile(null));

      expect(state.profile).toBeNull();
    });

    it('should handle SetUserProfile with complex profile object', () => {
      const complexProfile = {
        username: 'john',
        email: 'john@example.com',
        roles: ['admin', 'user'],
        preferences: { theme: 'dark' },
      };
      const state = reducer(initialState, SetUserProfile(complexProfile));

      expect(state.profile).toEqual(complexProfile);
    });

    it('should handle LoadUserSecurableObjects.pending', () => {
      const state = reducer(initialState, { type: LoadUserRoleSecurableObjects.pending.type });

      expect(state.loading).toBe(true);
      expect(state.securableObjects).toEqual({});
    });

    it('should handle LoadUserSecurableObjects.fulfilled', () => {
      const payload = [
        { securableObjectKey: 'CONNECT', securableObjectOperationKeys: ['WITHTHIS'] },
      ];
      const state = reducer(
        { ...initialState, loading: true },
        { type: LoadUserRoleSecurableObjects.fulfilled.type, payload },
      );

      expect(state.loading).toBe(false);
      expect(state.securableObjects).toEqual({ CONNECTWITHTHIS: true });
    });

    it('should handle LoadUserSecurableObjects.fulfilled with empty payload', () => {
      const state = reducer(
        { ...initialState, loading: true },
        { type: LoadUserRoleSecurableObjects.fulfilled.type, payload: [] },
      );

      expect(state.loading).toBe(false);
      expect(state.securableObjects).toEqual({});
    });

    it('should handle LoadUserSecurableObjects.fulfilled with multiple objects', () => {
      const payload = [
        { securableObjectKey: 'USER', securableObjectOperationKeys: ['READ', 'WRITE'] },
        { securableObjectKey: 'ADMIN', securableObjectOperationKeys: ['DELETE'] },
      ];
      const state = reducer(
        { ...initialState, loading: true },
        { type: LoadUserRoleSecurableObjects.fulfilled.type, payload },
      );

      expect(state.loading).toBe(false);
      expect(state.securableObjects).toEqual({
        USERREAD: true,
        USERWRITE: true,
        ADMINDELETE: true,
      });
    });

    it('should handle LoadUserRoleSecurableObjects.rejected', () => {
      const prevState = { ...initialState, loading: true, securableObjects: { something: true } };
      const state = reducer(prevState, { type: LoadUserRoleSecurableObjects.rejected.type });

      expect(state.loading).toBe(false);
      expect(state.securableObjects).toEqual({});
    });

    it('should handle LoadUserRoleSecurableObjects.rejected and preserve other state', () => {
      const prevState = {
        ...initialState,
        loading: true,
        securableObjects: { something: true },
        profile: null,
        error: 'previous error',
      };
      const state = reducer(prevState, { type: LoadUserRoleSecurableObjects.rejected.type });

      expect(state.loading).toBe(false);
      expect(state.securableObjects).toEqual({});
      expect(state.profile).toBeNull();
      expect(state.error).toBe('previous error');
    });

    it('should handle Init', () => {
      const action = {
        type: Init.type,
        payload: {
          LoggedInUser: {
            user: { username: 'initUser' },
            securableObjects: [
              { securableObjectKey: 'TEST', securableObjectOperationKeys: ['THIS'] },
            ],
          },
        },
      };

      const state = reducer(initialState, action);

      expect(state.profile).toEqual({ username: 'initUser' });
      expect(state.securableObjects).toEqual({ TESTTHIS: true });
    });

    it('should handle Init with missing LoggedInUser payload', () => {
      const action = {
        type: Init.type,
        payload: {},
      };

      const state = reducer(initialState, action);

      expect(state.profile).toBeUndefined();
      expect(state.securableObjects).toEqual({});
    });

    it('should handle Init with null payload', () => {
      const action = {
        type: Init.type,
        payload: null,
      };

      const state = reducer(initialState, action);

      expect(state.profile).toBeUndefined();
      expect(state.securableObjects).toEqual({});
    });

    it('should handle Init with empty LoggedInUser object', () => {
      const action = {
        type: Init.type,
        payload: {
          LoggedInUser: {},
        },
      };

      const state = reducer(initialState, action);

      expect(state.profile).toBeUndefined();
      expect(state.securableObjects).toEqual({});
    });

    it('should handle Init with LoggedInUser having null securableObjects', () => {
      const action = {
        type: Init.type,
        payload: {
          LoggedInUser: {
            user: { username: 'testUser' },
            securableObjects: null,
          },
        },
      };

      const state = reducer(initialState, action);

      expect(state.profile).toEqual({ username: 'testUser' });
      expect(state.securableObjects).toEqual({});
    });
  });

  describe('LoadUserRoleSecurableObjects async thunk', () => {
    let store: any;

    beforeEach(() => {
      store = configureStore({
        reducer: {
          LoggedInUser: reducer,
          System: (state = { apiUrl: 'https://test-api.com' }) => state,
        },
      });
      jest.clearAllMocks();
    });

    it('should create correct action types', () => {
      expect(LoadUserRoleSecurableObjects.pending.type).toBe(
        'LoggedInUser/fetchUserRoleSecurableObjects/pending',
      );
      expect(LoadUserRoleSecurableObjects.fulfilled.type).toBe(
        'LoggedInUser/fetchUserRoleSecurableObjects/fulfilled',
      );
      expect(LoadUserRoleSecurableObjects.rejected.type).toBe(
        'LoggedInUser/fetchUserRoleSecurableObjects/rejected',
      );
    });

    it('should fetch user role securable objects successfully', async () => {
      const mockResponse = {
        data: [{ securableObjectKey: 'USER', securableObjectOperationKeys: ['READ', 'WRITE'] }],
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await store.dispatch(LoadUserRoleSecurableObjects('test-role-id'));

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test-api.com/authorization-management/user-roles/test-role-id/securable-objects',
      );
      expect(result.type).toBe('LoggedInUser/fetchUserRoleSecurableObjects/fulfilled');
      expect(result.payload).toEqual(mockResponse.data);
    });

    it('should handle API error', async () => {
      const mockError = new Error('API Error');
      mockedAxios.get.mockRejectedValueOnce(mockError);

      const result = await store.dispatch(LoadUserRoleSecurableObjects('test-role-id'));

      expect(result.type).toBe('LoggedInUser/fetchUserRoleSecurableObjects/rejected');
    });

    it('should use correct API URL from system state', async () => {
      const customStore = configureStore({
        reducer: {
          LoggedInUser: reducer,
          System: (state = { apiUrl: 'https://custom-api.com' }) => state,
        },
      });

      const mockResponse = { data: [] };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await customStore.dispatch(LoadUserRoleSecurableObjects('role-123'));

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://custom-api.com/authorization-management/user-roles/role-123/securable-objects',
      );
    });
  });

  describe('getAll', () => {
    it('transforms securableObject into a map', () => {
      const input = [
        { securableObjectKey: 'TEST', securableObjectOperationKeys: ['WITHTHIS', 'ANDTHIS'] },
      ];

      expect(getAll(input)).toEqual({
        TESTWITHTHIS: true,
        TESTANDTHIS: true,
      });
    });

    it('returns empty object if input is null', () => {
      expect(getAll(null)).toEqual({});
    });

    it('returns empty object if input is undefined', () => {
      expect(getAll(undefined)).toEqual({});
    });

    it('returns empty object if input is empty array', () => {
      expect(getAll([])).toEqual({});
    });

    it('handles objects with empty securableObjectOperationKeys', () => {
      const input = [{ securableObjectKey: 'TEST', securableObjectOperationKeys: [] }];

      expect(getAll(input)).toEqual({});
    });

    it('handles objects with null securableObjectOperationKeys', () => {
      const input = [{ securableObjectKey: 'TEST', securableObjectOperationKeys: null }];

      expect(getAll(input)).toEqual({});
    });

    it('handles objects with undefined securableObjectOperationKeys', () => {
      const input = [{ securableObjectKey: 'TEST', securableObjectOperationKeys: undefined }];

      expect(getAll(input)).toEqual({});
    });

    it('handles multiple objects with mixed operation keys', () => {
      const input = [
        { securableObjectKey: 'USER', securableObjectOperationKeys: ['READ', 'WRITE'] },
        { securableObjectKey: 'ADMIN', securableObjectOperationKeys: ['DELETE'] },
        { securableObjectKey: 'GUEST', securableObjectOperationKeys: [] },
      ];

      expect(getAll(input)).toEqual({
        USERREAD: true,
        USERWRITE: true,
        ADMINDELETE: true,
      });
    });

    it('handles objects with missing securableObjectKey', () => {
      const input = [{ securableObjectOperationKeys: ['READ'] }];

      expect(getAll(input)).toEqual({
        undefinedREAD: true,
      });
    });

    it('handles complex scenario with various edge cases', () => {
      const input = [
        { securableObjectKey: 'VALID', securableObjectOperationKeys: ['READ', 'WRITE'] },
        { securableObjectKey: 'EMPTY', securableObjectOperationKeys: [] },
        { securableObjectKey: 'NULL_OPS', securableObjectOperationKeys: null },
        { securableObjectOperationKeys: ['ORPHAN'] },
      ];

      expect(getAll(input)).toEqual({
        VALIDREAD: true,
        VALIDWRITE: true,
        undefinedORPHAN: true,
      });
    });
  });
});
