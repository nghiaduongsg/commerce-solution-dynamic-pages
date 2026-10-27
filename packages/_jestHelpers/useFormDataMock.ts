import * as useFormData from '../common/src/dataResolver/useFormData';

export const mockFormDataHook = (value) => {
  jest.spyOn(useFormData, 'default').mockImplementation(() => {
    return {
      value,
      apply: true,
    };
  });
};

export const mockFormDataHookWithManyCalls = (values) => {
  const multipleEntityHookMock = jest.spyOn(useFormData, 'default');
  //   @ts-ignore
  values.forEach((v) => multipleEntityHookMock.mockReturnValueOnce({ value: v, apply: true }));
};
