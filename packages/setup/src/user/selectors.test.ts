import {
  selectUserProfile,
  selectUserPartyRoleId,
  selectUsername,
  selectUserId,
  selectUserError,
  selectUserSecurableObjects,
  selectUserAllowedServices,
  selectIsAdminUser,
  selectLoading,
} from './selectors';
import { AnyType } from '@pkg-common/types';

describe('User selectors', () => {
  describe('selectUserProfile', () => {
    it('returns profile when present', () => {
      const state = {
        LoggedInUser: { profile: { username: 'john' } },
      } as AnyType;

      const result = selectUserProfile()(state);

      expect(result).toEqual({ username: 'john' });
    });

    it('returns empty object when profile is missing', () => {
      const state = {
        LoggedInUser: { profile: undefined },
      } as AnyType;

      const result = selectUserProfile()(state);

      expect(result).toEqual({});
    });
  });

  describe('selectUserPartyRoleId', () => {
    it('returns partyRoleId when present', () => {
      const state = {
        LoggedInUser: { profile: { partyRoleId: 'role1' } },
      } as AnyType;

      const result = selectUserPartyRoleId()(state);

      expect(result).toBe('role1');
    });

    it('returns undefined when partyRoleId is missing', () => {
      const state = {
        LoggedInUser: { profile: {} },
      } as AnyType;

      const result = selectUserPartyRoleId()(state);

      expect(result).toBeUndefined();
    });
  });

  describe('selectUsername', () => {
    it('returns username when present', () => {
      const state = {
        LoggedInUser: { profile: { username: 'john_doe' } },
      } as AnyType;

      const result = selectUsername()(state);

      expect(result).toBe('john_doe');
    });

    it('returns empty string when username is missing', () => {
      const state = {
        LoggedInUser: { profile: {} },
      } as AnyType;

      const result = selectUsername()(state);

      expect(result).toBe('');
    });

    it('returns empty string when username is null', () => {
      const state = {
        LoggedInUser: { profile: { username: null } },
      } as AnyType;

      const result = selectUsername()(state);

      expect(result).toBe('');
    });

    it('returns empty string when username is empty string', () => {
      const state = {
        LoggedInUser: { profile: { username: '' } },
      } as AnyType;

      const result = selectUsername()(state);

      expect(result).toBe('');
    });
  });

  describe('selectUserId', () => {
    it('returns userId when present', () => {
      const state = {
        LoggedInUser: { profile: { userId: '123', id: 'abc' } },
      } as AnyType;

      const result = selectUserId()(state);

      expect(result).toBe('123');
    });

    it('return id when userId is missing', () => {
      const state = {
        LoggedInUser: { profile: { id: 'abc' } },
      } as AnyType;

      const result = selectUserId()(state);

      expect(result).toBe('abc');
    });

    it('returns undefined when neither userId nor id exist', () => {
      const state = {
        LoggedInUser: { profile: {} },
      } as AnyType;

      const result = selectUserId()(state);

      expect(result).toBeUndefined();
    });
  });

  describe('selectUserError', () => {
    it('returns error when present', () => {
      const state = {
        LoggedInUser: { error: 'Something went wrong' },
      } as AnyType;

      const result = selectUserError()(state);

      expect(result).toBe('Something went wrong');
    });

    it('returns undefined when error is missing', () => {
      const state = {
        LoggedInUser: {},
      } as AnyType;

      const result = selectUserError()(state);

      expect(result).toBeUndefined();
    });
  });

  describe('selectUserSecurableObjects', () => {
    it('returns securableObjects when present', () => {
      const state = {
        LoggedInUser: { securableObjects: { dashboard: true } },
      } as AnyType;

      const result = selectUserSecurableObjects()(state);

      expect(result).toEqual({ dashboard: true });
    });

    it('returns empty object when securableObjects missing', () => {
      const state = {
        LoggedInUser: {},
      } as AnyType;

      const result = selectUserSecurableObjects()(state);

      expect(result).toEqual({});
    });
  });

  describe('selectUserAllowedServices', () => {
    it('returns allowedServices when present', () => {
      const state = {
        LoggedInUser: { profile: { allowedServices: ['test1', 'test2'] } },
      } as AnyType;

      const result = selectUserAllowedServices()(state);

      expect(result).toEqual(['test1', 'test2']);
    });

    it('return empty array when allowedServices is missing', () => {
      const state = {
        LoggedInUser: { profile: {} },
      } as AnyType;

      const result = selectUserAllowedServices()(state);

      expect(result).toEqual([]);
    });
  });

  describe('selectIsAdminUser', () => {
    it('returns true when isAdminUser is true', () => {
      const state = {
        LoggedInUser: { profile: { isAdminUser: true } },
      } as AnyType;

      const result = selectIsAdminUser()(state);

      expect(result).toBe(true);
    });

    it('returns false when isAdminUser is false', () => {
      const state = {
        LoggedInUser: { profile: { isAdminUser: false } },
      } as AnyType;

      const result = selectIsAdminUser()(state);

      expect(result).toBe(false);
    });

    it('returns false when isAdminUser is missing', () => {
      const state = {
        LoggedInUser: { profile: {} },
      } as AnyType;

      const result = selectIsAdminUser()(state);

      expect(result).toBe(false);
    });
  });

  describe('selectLoading', () => {
    it('returns true when loading is true', () => {
      const state = {
        LoggedInUser: { loading: true },
      } as AnyType;

      const result = selectLoading()(state);

      expect(result).toBe(true);
    });

    it('returns false when loading is false', () => {
      const state = {
        LoggedInUser: { loading: false },
      } as AnyType;

      const result = selectLoading()(state);

      expect(result).toBe(false);
    });

    it('returns false when loading is missing', () => {
      const state = {
        LoggedInUser: {},
      } as AnyType;

      const result = selectLoading()(state);

      expect(result).toBe(false);
    });
  });
});
