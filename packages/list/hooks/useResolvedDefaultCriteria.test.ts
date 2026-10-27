import { renderHook } from '@testing-library/react';
import { getMockWrapper } from '@_jestHelpers/reactMockStore';
import useResolvedDefaultCriteria from './useResolvedDefaultCriteria';

describe('useResolvedDefaultCriteria', () => {
  const tableId = 'TABLE';

  it('should resolve store-sourced values from the redux state', () => {
    const storeData = {
      Entities: {},
      LoggedInUser: { user: { ownerId: 'user-1' } },
    };
    const wrapper = getMockWrapper(storeData);

    const defaultCriteria = {
      ownerId: {
        source: { type: 'STORE', code: 'LoggedInUser', jsonPath: ['user', 'ownerId'] },
      },
    };

    const { result } = renderHook(() => useResolvedDefaultCriteria(tableId, defaultCriteria), {
      wrapper,
    });

    expect(result.current).toEqual({ ownerId: 'user-1' });
  });

  it('should keep static values unchanged alongside store-sourced ones', () => {
    const storeData = {
      Entities: {},
      LoggedInUser: { user: { ownerId: 'user-1' } },
    };
    const wrapper = getMockWrapper(storeData);

    const defaultCriteria = {
      state: 'ACTIVE',
      ownerId: {
        source: { type: 'STORE', code: 'LoggedInUser', jsonPath: ['user', 'ownerId'] },
      },
    };

    const { result } = renderHook(() => useResolvedDefaultCriteria(tableId, defaultCriteria), {
      wrapper,
    });

    expect(result.current).toEqual({ state: 'ACTIVE', ownerId: 'user-1' });
  });

  it('should resolve boolean/number store values correctly', () => {
    const storeData = {
      Entities: {},
      LoggedInUser: { user: { active: true, code: 5 } },
    };
    const wrapper = getMockWrapper(storeData);

    const defaultCriteria = {
      active: { source: { type: 'STORE', code: 'LoggedInUser', jsonPath: ['user', 'active'] } },
      code: { source: { type: 'STORE', code: 'LoggedInUser', jsonPath: ['user', 'code'] } },
    };

    const { result } = renderHook(() => useResolvedDefaultCriteria(tableId, defaultCriteria), {
      wrapper,
    });

    expect(result.current).toEqual({ active: true, code: 5 });
  });

  it('should omit keys whose store value is unavailable', () => {
    const storeData = {
      Entities: {},
      LoggedInUser: {},
    };
    const wrapper = getMockWrapper(storeData);

    const defaultCriteria = {
      ownerId: {
        source: { type: 'STORE', code: 'LoggedInUser', jsonPath: ['user', 'ownerId'] },
      },
    };

    const { result } = renderHook(() => useResolvedDefaultCriteria(tableId, defaultCriteria), {
      wrapper,
    });

    expect(result.current).toEqual({});
  });
});
