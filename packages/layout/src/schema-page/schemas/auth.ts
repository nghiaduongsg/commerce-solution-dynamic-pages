export type AuthData = {
  mode: 'login' | 'signup';
  alternatePath: string;
  brand: string;
  eyebrow: string;
  featureKeys: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isInternalPath = (value: unknown): value is string =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//');

export function isAuthData(value: unknown): value is AuthData {
  return (
    isRecord(value) &&
    (value.mode === 'login' || value.mode === 'signup') &&
    isInternalPath(value.alternatePath) &&
    typeof value.brand === 'string' &&
    typeof value.eyebrow === 'string' &&
    Array.isArray(value.featureKeys) &&
    value.featureKeys.length > 0 &&
    value.featureKeys.length <= 4 &&
    value.featureKeys.every((key) => typeof key === 'string' && key.length > 0)
  );
}
