import * as useUserSettings from '@pkg-setup/src/userSettings/useUserSettings';

export const mockUserSettingsHook = (savedGroups, lastSavedGroup = 'NEW_GROUP') => {
  const setUserPreferencesStub = jest.fn();
  // @ts-ignore
  jest.spyOn(useUserSettings, 'default').mockImplementation((_: string) => {
    const groups = savedGroups ?? [
      { groupId: 'DEFAULT', criteria: { cr1: 'A', cr2: 'B' }, updatedAt: 1 },
      { groupId: 'A', criteria: { cr1: 'K' }, updatedAt: 2 },
      { groupId: 'B', criteria: { cr1: 'K', cr2: 'B', cr3: 56 }, updatedAt: 3 },
    ];

    return {
      savedGroups: groups,
      lastSavedGroup,
      setUserPreferences: setUserPreferencesStub,
      getSavedCriteria: (groupId) => {
        return groups.filter((id) => groupId === id);
      },
    };
  });

  return { setUserPreferencesStub };
};
