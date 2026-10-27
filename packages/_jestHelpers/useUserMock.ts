import * as useUser from '@pkg-setup/src/user/useUser';

export const mockUserHook = (
  securableObjects,
  options: { allowedServices?: string[]; isAdminUser?: boolean } = {},
) => {
  const { allowedServices = [], isAdminUser = false } = options;

  // @ts-ignore
  jest.spyOn(useUser, 'default').mockImplementation(() => {
    return {
      profile: {},
      partyRoleId: 'partyRoleId',
      userId: 'id',
      username: 'username',
      securableObjects,
      allowedServices,
      isAdminUser,
      loading: false,
      error: null,
      loadSecurableObjects: jest.fn(),
      setUserProfile: jest.fn(),
    };
  });
};
