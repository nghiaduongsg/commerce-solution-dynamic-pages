import {
  selectAllTableFilters,
  selectedLanguage,
  selectLastSavedCriteria,
  selectLastSavedParsedCriteria,
  selectedProfileImage,
  selectedThemeMode,
  selectedThemeName,
  selectedThemeSource,
  selectedThemeType,
  selectTheme,
  selectGroupsForTable,
  selectLastSavedGroup,
} from './selectors';
import { AnyType } from '@pkg-common/types';

const defaultState = {
  UserSettings: {
    preferredLanguage: 'EN',
    themeMode: 'dark',
    themeName: 'summer-theme',
    themeSource: 'system',
    themeType: 'SLIM',
    applyShortcuts: true,
    profileImage: 'xmlString',
    theme: 'xmlString',
    filters: [
      {
        tableId: 'CaseType',
        latest: 'A',
        groups: [
          {
            groupId: 'DEFAULT',
            criteria: '{"name":"NWCO","description":"DDD"}',
            updatedAt: 1,
          },
          {
            groupId: 'A',
            criteria: '{"name":"A"}',
            updatedAt: 2,
          },
        ],
      },
    ],
  },
} as AnyType;

describe('User Settings Selectors', () => {
  it('selectedLanguage', () => {
    const expected = 'EN';

    expect(selectedLanguage(defaultState)).toEqual(expected);
  });

  it('themeMode', () => {
    const expected = 'dark';
    expect(selectedThemeMode(defaultState)).toEqual(expected);
  });

  it('themeMode - default', () => {
    const expected = 'light';
    expect(
      selectedThemeMode({ UserSettings: { ...defaultState.UserSettings, themeMode: undefined } }),
    ).toEqual(expected);
  });

  it('themeName', () => {
    const expected = 'summer-theme';
    expect(selectedThemeName(defaultState)).toEqual(expected);
  });

  it('themeSource', () => {
    const expected = 'system';
    expect(selectedThemeSource(defaultState)).toEqual(expected);
  });

  it('themeSource - default', () => {
    const expected = 'system';
    expect(
      selectedThemeSource({
        UserSettings: { ...defaultState.UserSettings, themeSource: undefined },
      }),
    ).toEqual(expected);
  });

  it('themeType', () => {
    const expected = 'SLIM';
    expect(selectedThemeType(defaultState)).toEqual(expected);
  });

  it('themeType - default', () => {
    const expected = 'LARGE';
    expect(
      selectedThemeType({ UserSettings: { ...defaultState.UserSettings, themeType: undefined } }),
    ).toEqual(expected);
  });

  it('profileImage', () => {
    const expected = 'xmlString';
    expect(selectedProfileImage(defaultState)).toEqual(expected);
  });

  it('theme', () => {
    const expected = 'xmlString';
    expect(selectTheme(defaultState)).toEqual(expected);
  });

  describe('selectLastSavedCriteria', () => {
    it('should return parsed criteria for DEFAULT group of CaseType', () => {
      const expected = JSON.stringify({ name: 'A' });
      expect(selectLastSavedCriteria('CaseType')(defaultState)).toEqual(expected);
    });

    it('should return empty array if tableId not found', () => {
      expect(selectLastSavedCriteria('NonExisting')(defaultState)).toEqual(undefined);
    });
  });

  describe('selectLastSavedParsedCriteria', () => {
    it('should return parsed criteria for DEFAULT group of CaseType', () => {
      const expected = { name: 'A' };
      expect(selectLastSavedParsedCriteria('CaseType')(defaultState)).toEqual(expected);
    });

    it('should return empty array if tableId not found', () => {
      expect(selectLastSavedCriteria('NonExisting')(defaultState)).toEqual(undefined);
    });
  });

  describe('selectLastSavedGroup', () => {
    it('should return last saved group of filters for a valid tableId', () => {
      expect(selectLastSavedGroup('CaseType')(defaultState)).toEqual('A');
    });

    it('should return empty array if tableId not found', () => {
      expect(selectLastSavedCriteria('NonExisting')(defaultState)).toEqual(undefined);
    });
  });

  describe('selectGroupsForTable', () => {
    it('should return filter groups a valid tableId', () => {
      const expected = [
        {
          groupId: 'DEFAULT',
          criteria: JSON.stringify({ name: 'NWCO', description: 'DDD' }),
          updatedAt: 1,
        },
        {
          groupId: 'A',
          criteria: JSON.stringify({ name: 'A' }),
          updatedAt: 2,
        },
      ];
      expect(selectGroupsForTable('CaseType')(defaultState)).toEqual(expected);
    });

    it('should return empty array for unknown tableId', () => {
      expect(selectGroupsForTable('UnknownTable')(defaultState)).toEqual([]);
    });
  });

  describe('selectAllTableFilters', () => {
    it('should return all saved filters', () => {
      expect(selectAllTableFilters(defaultState)).toEqual(defaultState.UserSettings.filters);
    });
  });
});
