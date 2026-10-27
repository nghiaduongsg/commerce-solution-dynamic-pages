import * as useFieldApplicability from '@pkg-form/hooks/useFieldApplicability';

export const mockFieldApplicabityHook = (applicable) => {
  jest.spyOn(useFieldApplicability, 'default').mockImplementation(() => {
    return {
      applicable,
    };
  });
};
