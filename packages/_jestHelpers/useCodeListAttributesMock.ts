import * as useCodeListAttributes from '@pkg-core/codeList/hooks/useCodeListAttributes';

export const mockCodeListAttributesHook = () => {
  const getItemStub = jest.fn();
  const getItemByAttributeStub = jest.fn();
  const getAttributeStub = jest.fn();

  // @ts-ignore
  jest.spyOn(useCodeListAttributes, 'default').mockImplementation(() => {
    return {
      getItem: getItemStub,
      getItemByAttribute: getItemByAttributeStub,
      getAttribute: getAttributeStub,
    };
  });

  return {
    getItemStub,
    getItemByAttributeStub,
    getAttributeStub,
    mockGetItem: (mock) => getItemStub.mockReturnValue(mock),
    mockGetItemByAttribute: (mock) => getItemByAttributeStub.mockReturnValue(mock),
    mockGetAttribute: (mock) => getAttributeStub.mockReturnValue(mock),
  };
};
