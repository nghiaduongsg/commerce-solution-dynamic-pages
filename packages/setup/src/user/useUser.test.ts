import { renderHook, act } from '@testing-library/react';
import useUser from './useUser';
import { getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';

const storeData = {
  Actions: {},
  LoggedInUser: {
    profile: {
      partyRoleId: 'testUser',
      id: 'testUser',
      securableObjects: {},
      username: 'tester the 1st',
    },
    SetUserProfile: {},
    LoadSecurableObjects: {},
  },
  System: {
    apiUrl: 'http://localhost:3001',
    useStaticSchemas: true,
  },
};

describe('useUser hook', () => {
  beforeEach(() => jest.clearAllMocks());
  const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
  it('should return expected structure', () => {
    const { result } = renderHook(() => useUser(), { wrapper });
    expect(result.current).toHaveProperty('profile');
    expect(result.current).toHaveProperty('loadSecurableObjects');
    expect(result.current).toHaveProperty('setUserProfile');
    expect(typeof result.current.loadSecurableObjects).toBe('function');
    expect(typeof result.current.setUserProfile).toBe('function');
  });
  it('should trigger loadSecurableObjects function', async () => {
    const { result } = renderHook(() => useUser(), { wrapper });
    act(() => {
      result.current.loadSecurableObjects('testUser');
    });
    expect(dispatchStub).toHaveBeenCalled();
  });
  it('should trigger setUserProfile function', () => {
    const { result } = renderHook(() => useUser(), { wrapper });
    const testProfile = { name: 'Test User', email: 'test@example.com' };
    act(() => {
      result.current.setUserProfile(testProfile);
    });
    expect(dispatchStub).toHaveBeenCalled();
  });
});
