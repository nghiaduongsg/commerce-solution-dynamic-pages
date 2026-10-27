import React from 'react';
import { renderHook } from '@testing-library/react';
import useCodeList from './useCodeList';
import { getMockWrapper } from '@_jestHelpers/reactMockStore';

const storeData = {
  CodeList: {
    lists: {
      LIST1: [
        {
          code: 'A',
          label: 'A',
          attributes: [{ key: 'keyA', value: 'value-keyA' }],
        },
      ],
      'LIST2|INCLUDES_SUFFIX': [
        {
          code: 'B',
          label: 'B',
          attributes: [{ key: 'keyB', value: 'value-keyB' }],
        },
      ],
    },
  },
};

describe('useCodeList', () => {
  const wrapper = getMockWrapper(storeData);

  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('useCodeList', () => {
    const expected = storeData.CodeList.lists.LIST1;
    const { result } = renderHook(() => useCodeList('LIST1'), { wrapper });
    expect(result.current.list).toEqual(expected);
  });

  it('useCodeList with include parameter is used', () => {
    const expected = storeData.CodeList.lists['LIST2|INCLUDES_SUFFIX'];
    const { result } = renderHook(() => useCodeList('LIST2'), { wrapper });
    expect(result.current.list).toEqual(expected);
  });
});
