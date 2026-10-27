import * as useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';

export const mockCheckFromHook = (check, values = {}) => {
  jest.spyOn(useCheckFrom, 'default').mockImplementation(() => {
    return {
      check,
      values,
    };
  });
};
