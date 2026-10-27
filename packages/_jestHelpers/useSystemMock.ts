import * as useSystem from '@pkg-setup/src/system/useSystem';

export const mockSystemHook = () => {
  // @ts-ignore
  jest.spyOn(useSystem, 'default').mockImplementation(() => {
    return {
      selectedLanguage: 'EN',
      allSymbol: '*',
    };
  });
};
