import * as useFieldReady from '@pkg-form//hooks/useFieldReady';

export const mockFieldReadyHook = (value: boolean) => {
  jest.spyOn(useFieldReady, 'default').mockImplementation((_: string) => {
    return value;
  });
};
