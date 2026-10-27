import * as useCodeList from '@pkg-core/codeList/hooks/useCodeList';

export const mockCodeListHook = (list) => {
  // @ts-ignore
  jest.spyOn(useCodeList, 'default').mockImplementation(() => {
    return {
      list,
      loading: false,
    };
  });
};
