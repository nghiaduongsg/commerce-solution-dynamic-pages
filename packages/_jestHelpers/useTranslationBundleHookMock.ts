import * as useAppTranslationsHook from '../setup/src/system/setupTranslations';

export const mockTranslationBundleHook = () => {
  const translateStub = jest.fn((key) => key);
  const loadBundleStub = jest.fn();
  // @ts-ignore
  jest.spyOn(useAppTranslationsHook, 'default').mockImplementation(() => {
    return translateStub;
  });

  return { translateStub, loadBundleStub };
};
