import { act, renderHook } from '@testing-library/react';
import useDiffs from './useDiffs';
import { ClearDiffs } from './reducers';
import { getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';

jest.mock('@pkg-common/utils/utils', () => ({
  equalityCheck: jest.fn((a, b) => JSON.stringify(a) === JSON.stringify(b)),
}));
const storeData = {
  DataDiffs: {
    fieldA: ['diff1'],
    fieldB: ['diff2'],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useDiffs', () => {
  it('should return diffs from Redux state', () => {
    const { wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useDiffs(), { wrapper });
    expect(result.current.diffs).toEqual(storeData.DataDiffs);
  });

  it('should dispatch SetDiffs and ClearDiffs actions', () => {
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useDiffs(), { wrapper });
    const diffsPayload = { fieldC: ['newDiff'] };
    act(() => {
      result.current.setFieldDiffs(diffsPayload);
    });
    expect(dispatchStub).toHaveBeenCalledWith({
      type: 'DataDiffs/SetDiffs',
      payload: { diffs: diffsPayload },
    });
    act(() => {
      result.current.clearDiffs();
    });
    expect(dispatchStub).toHaveBeenCalledWith(ClearDiffs());
  });

  it('should return stable references for setFieldDiffs and clearDiffs across rerenders', () => {
    const storeData = { DataDiffs: { fieldA: ['diff1'] } };
    const { wrapper } = getMockWrapperAndStore(storeData);
    const { result, rerender } = renderHook(() => useDiffs(), { wrapper });
    const firstSet = result.current.setFieldDiffs;
    const firstClear = result.current.clearDiffs;
    rerender();
    const secondSet = result.current.setFieldDiffs;
    const secondClear = result.current.clearDiffs;
    expect(firstSet).toBe(secondSet);
    expect(firstClear).toBe(secondClear);
  });
});
