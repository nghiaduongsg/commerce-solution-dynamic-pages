import { renderHook } from '@testing-library/react';
import useFilterSettings from './useFilterSettings';
import { getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';
import { mockUserSettingsHook } from '@_jestHelpers/useUserSettingsHookMock';
import { SetLatestFilterGroup } from '@pkg-setup/src/userSettings/reducers';

const settings = {
  loading: false,
  themeMode: 'light',
  themeSource: 'remote',
  themeName: 'My-Theme',
  themeType: 'LARGE',
  applyShortcuts: true,
  preferredLanguage: 'EL',
  userPreferencesSavedLanguage: 'EN',
  theme: undefined,
  profileImage: 'image',
  userLogo: 'image',
  userHomeImage: 'image',
  filters: [
    {
      tableId: 'A',
      latest: '2',
      groups: [
        {
          groupId: '1',
          criteria: JSON.stringify({ a: 'a' }),
          updatedAt: '123',
        },
        {
          groupId: '2',
          criteria: JSON.stringify({ b: 'b' }),
          updatedAt: '123',
        },
      ],
    },
    {
      tableId: 'C',
      latest: '1',
      groups: [
        {
          groupId: '1',
          criteria: 'hdsfj',
          updatedAt: '123',
        },
      ],
    },
    {
      tableId: 'D',
      groups: [
        {
          groupId: '1',
          criteria: JSON.stringify({ x: 'x' }),
          updatedAt: '123',
        },
        {
          groupId: '2',
          criteria: JSON.stringify({ y: 'y' }),
          updatedAt: '123',
        },
      ],
    },
    {
      tableId: 'E',
    },
  ],
};

const storeData = {
  UserSettings: settings,
  Tables: { A: { id: 'id', criteria: { cr1: 'A', cr2: 'B' } } },
  System: {
    apiUrl: '',
    systemUsed: 'IRM',
  },
};

describe('useFilterSettings', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should return all saved filter groups for table A ', () => {
    const { wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useFilterSettings('A'), { wrapper });

    expect(result.current.savedGroups).toEqual([
      {
        groupId: '1',
        criteria: JSON.stringify({ a: 'a' }),
        updatedAt: '123',
      },
      {
        groupId: '2',
        criteria: JSON.stringify({ b: 'b' }),
        updatedAt: '123',
      },
    ]);
  });

  it('should return last saved group for table A ', () => {
    const { wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useFilterSettings('A'), { wrapper });

    expect(result.current.lastSavedGroup).toEqual('2');
  });

  describe('should return saved criteria', () => {
    const { wrapper } = getMockWrapperAndStore(storeData);

    it('should return empty criteria when no filter have been saved for the requested table id', () => {
      const { result } = renderHook(() => useFilterSettings('B'), { wrapper });
      const { lastSavedCriteria } = result.current;

      expect(lastSavedCriteria).toEqual(undefined);
    });

    it('should return criteria for the requested table id', () => {
      const { result } = renderHook(() => useFilterSettings('A'), { wrapper });
      const { lastSavedCriteria } = result.current;

      expect(lastSavedCriteria).toEqual(JSON.stringify({ b: 'b' }));
    });

    it('should return parsed criteria for the requested table id', () => {
      const { result } = renderHook(() => useFilterSettings('A'), { wrapper });
      const { lastSavedParsedCriteria } = result.current;

      expect(lastSavedParsedCriteria).toEqual({ b: 'b' });
    });

    it('should return empty criteria when stringified filters are invalid for the requested table id', () => {
      const { result } = renderHook(() => useFilterSettings('C'), { wrapper });
      const { lastSavedParsedCriteria } = result.current;

      expect(lastSavedParsedCriteria).toEqual({});
    });

    it('should return empty criteria when no groups exist for the requested table id', () => {
      const { result } = renderHook(() => useFilterSettings('E'), { wrapper });
      const { lastSavedParsedCriteria } = result.current;

      expect(lastSavedParsedCriteria).toEqual({});
    });

    it('should return the last item of criteria when no latest group is found for the requested table id', () => {
      const { result } = renderHook(() => useFilterSettings('D'), { wrapper });
      const { lastSavedParsedCriteria } = result.current;
      expect(lastSavedParsedCriteria).toEqual({});
    });

    it('should test saveFilterGroup', () => {
      const newGroup = 'NEW_GROUP';
      const { setUserPreferencesStub } = mockUserSettingsHook(undefined, newGroup);
      const { wrapper } = getMockWrapperAndStore(storeData);

      const { result } = renderHook(() => useFilterSettings('A'), { wrapper });
      const { saveFilterGroup } = result.current;

      saveFilterGroup(newGroup);

      expect(setUserPreferencesStub).toHaveBeenCalledWith('A', 'UPDATE', 'NEW_GROUP');
    });

    it('should test deleteFilterGroup', () => {
      const { setUserPreferencesStub } = mockUserSettingsHook(undefined);
      const { wrapper } = getMockWrapperAndStore(storeData);

      const { result } = renderHook(() => useFilterSettings('A'), { wrapper });
      const { deleteFilterGroup, lastSavedGroup } = result.current;

      deleteFilterGroup();

      expect(setUserPreferencesStub).toHaveBeenCalledWith('A', 'DELETE', lastSavedGroup);
    });

    it('should test setLatest', () => {
      const { setUserPreferencesStub } = mockUserSettingsHook(undefined);
      const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);

      const { result } = renderHook(() => useFilterSettings('A'), { wrapper });
      const { setLatest } = result.current;

      setLatest('1');

      expect(dispatchStub).toHaveBeenCalledWith(
        SetLatestFilterGroup({ tableId: 'A', groupId: '1' }),
      );
    });
  });
});
