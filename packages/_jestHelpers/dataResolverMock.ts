import * as dataResolverUtils from '@pkg-common/dataResolver/utils';

export const mockDataResolver = (value = {}) => {
  jest.spyOn(dataResolverUtils, 'resolveSourceData').mockImplementation(() => {
    return {
      value,
      apply: true,
    };
  });
};

export const mockDataResolverShouldBeApplied = (values: Array<boolean>) => {
  const multipleEntityHookMock = jest.spyOn(dataResolverUtils, 'shouldBeApplied');

  values.forEach((v) => multipleEntityHookMock.mockReturnValueOnce(v));
};
