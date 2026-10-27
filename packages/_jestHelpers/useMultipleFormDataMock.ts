import * as useMultipleFormData from '@pkg-common/dataResolver/useMultipleFormData';

export const mockMultipleFormDataHook = (values) => {
  jest.spyOn(useMultipleFormData, 'default').mockImplementation(() => {
    return values;
  });
};

export const mockMultipleFormDataHookWithManyCalls = (values) => {
  const multipleFormDataHookMock = jest.spyOn(useMultipleFormData, 'default');
  values.forEach((v) => multipleFormDataHookMock.mockReturnValueOnce(v));

  return multipleFormDataHookMock;
};
