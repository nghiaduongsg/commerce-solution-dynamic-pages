import * as useFormField from '@pkg-entity/hooks/useFormField';

export const mockFormFieldHook = (value?: string | null) => {
  const setFieldValueStub = jest.fn();
  // @ts-ignore
  jest.spyOn(useFormField, 'default').mockImplementation((_: string) => {
    return {
      value,
      storeValue: value,
      dirty: true,
      setFieldValue: setFieldValueStub,
      clearFormValues: jest.fn(),
      reorderItems: jest.fn(),
      addItem: jest.fn(),
      addItems: jest.fn(),
      removeItem: jest.fn(),
      concatToObject: jest.fn(),
    };
  });

  return { setFieldValueStub };
};
