export const getLogo = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window['LOGO'] ?? null;
};

export const getHomeImage = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window['HOME'] ?? null;
};

export const getBanner = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window['BANNER'] ?? null;
};
