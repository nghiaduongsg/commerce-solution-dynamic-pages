import * as useDate from '@pkg-common/hooks/useDate';

export const mockUseDateHook = (format?: string) => {
  // @ts-ignore
  jest.spyOn(useDate, 'default').mockImplementation(() => {
    return format ?? 'yyyy-MM-dd';
  });
};
