import { renderHook } from '@testing-library/react';
import usePermissions from './usePermissions';
import useUser from './useUser';
import useSystem from '@pkg-setup/src/system/useSystem';

jest.mock('./useUser');
jest.mock('@pkg-setup/src/system/useSystem');

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockUseSystem = useSystem as jest.MockedFunction<typeof useSystem>;
const testHook = (callback: () => any) => renderHook(callback).result.current;

describe('usePermissions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return true for defaultItemActions', () => {
    mockUseUser.mockReturnValue({ securableObjects: {} } as any);
    mockUseSystem.mockReturnValue({ application: 'RM', applyPermissions: true } as any);
    const result = testHook(() => usePermissions('defaultItemActions'));
    expect(result).toBe(true);
  });

  it('should return permission value when applyPermissions is true', () => {
    mockUseUser.mockReturnValue({
      securableObjects: { testPermission: true },
    } as any);
    mockUseSystem.mockReturnValue({ application: 'RM', applyPermissions: true } as any);
    const result = testHook(() => usePermissions('testPermission'));
    expect(result).toBe(true);
  });

  it('should return false for missing permission when applyPermissions is true', () => {
    mockUseUser.mockReturnValue({ securableObjects: {} } as any);
    mockUseSystem.mockReturnValue({ application: 'RM', applyPermissions: true } as any);
    const result = testHook(() => usePermissions('missingPermission'));
    expect(result).toBe(false);
  });

  it('should return true when applyPermissions is false', () => {
    mockUseUser.mockReturnValue({
      securableObjects: { testPermission: false },
    } as any);
    mockUseSystem.mockReturnValue({ application: 'RM', applyPermissions: false } as any);
    const result = testHook(() => usePermissions('testPermission'));
    expect(result).toBe(true);
  });

  it('should handle undefined permissionKey', () => {
    mockUseUser.mockReturnValue({ securableObjects: {} } as any);
    mockUseSystem.mockReturnValue({ application: 'RM', applyPermissions: true } as any);
    const result = testHook(() => usePermissions());
    expect(result).toBe(true);
  });

  it('should use applySecObjectPermissions for ISS application', () => {
    mockUseUser.mockReturnValue({
      securableObjects: { testPermission: false },
    } as any);
    mockUseSystem.mockReturnValue({
      application: 'ISS',
      applyPermissions: true,
      applySecObjectPermissions: false,
    } as any);
    const result = testHook(() => usePermissions('testPermission'));
    expect(result).toBe(true);
  });

  it('should enforce securable object permission when ISS sec object permissions are enabled', () => {
    mockUseUser.mockReturnValue({
      securableObjects: { testPermission: false },
    } as any);
    mockUseSystem.mockReturnValue({
      application: 'ISS',
      applyPermissions: false,
      applySecObjectPermissions: true,
    } as any);
    const result = testHook(() => usePermissions('testPermission'));
    expect(result).toBe(false);
  });

  it('should use replacementValues to construct permission key (allowed)', () => {
    mockUseUser.mockReturnValue({
      securableObjects: { 'api/123/action': true },
    } as any);
    mockUseSystem.mockReturnValue({ application: 'RM', applyPermissions: true } as any);
    const result = testHook(() =>
      usePermissions(
        { url: 'api/{id}/action', replacements: [{ key: '{id}' }] },
        { '{id}': '123' },
      ),
    );
    expect(result).toBe(true);
  });

  it('should use replacementValues to construct permission key (not allowed)', () => {
    mockUseUser.mockReturnValue({
      securableObjects: { 'api/123/action': false },
    } as any);
    mockUseSystem.mockReturnValue({ application: 'RM', applyPermissions: true } as any);
    const result = testHook(() =>
      usePermissions(
        { url: 'api/{id}/action', replacements: [{ key: '{id}' }] },
        { '{id}': '123' },
      ),
    );
    expect(result).toBe(false);
  });

  it('should use replacementValues to construct permission key (missing in securableObjects)', () => {
    mockUseUser.mockReturnValue({ securableObjects: {} } as any);
    mockUseSystem.mockReturnValue({ application: 'RM', applyPermissions: true } as any);
    const result = testHook(() =>
      usePermissions(
        { url: 'api/{id}/action', replacements: [{ key: '{id}' }] },
        { '{id}': '123' },
      ),
    );
    expect(result).toBe(false);
  });

  it('should behave the same as no replacementValues when replacementValues is empty object', () => {
    mockUseUser.mockReturnValue({
      securableObjects: { testPermission: true },
    } as any);
    mockUseSystem.mockReturnValue({ application: 'RM', applyPermissions: true } as any);
    const result = testHook(() => usePermissions('testPermission', {}));
    expect(result).toBe(true);
  });

  it('should return true when replacementValues are provided but applyPermissions is false', () => {
    mockUseUser.mockReturnValue({ securableObjects: {} } as any);
    mockUseSystem.mockReturnValue({ application: 'RM', applyPermissions: false } as any);
    const result = testHook(() =>
      usePermissions(
        { url: 'api/{id}/action', replacements: [{ key: '{id}' }] },
        { '{id}': '123' },
      ),
    );
    expect(result).toBe(true);
  });

  it('should use replacementValues with ISS application and applySecObjectPermissions', () => {
    mockUseUser.mockReturnValue({
      securableObjects: { 'api/123/action': false },
    } as any);
    mockUseSystem.mockReturnValue({
      application: 'ISS',
      applyPermissions: true,
      applySecObjectPermissions: true,
    } as any);
    const result = testHook(() =>
      usePermissions(
        { url: 'api/{id}/action', replacements: [{ key: '{id}' }] },
        { '{id}': '123' },
      ),
    );
    expect(result).toBe(false);
  });
});
