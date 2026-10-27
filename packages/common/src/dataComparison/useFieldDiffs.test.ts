import { renderHook } from '@testing-library/react';
import useFieldDiffs from './useFieldDiffs';
import { getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';

const storeData = { DataDiffs: { fieldA: 'a', fieldB: 'b' } };
beforeEach(() => jest.clearAllMocks());
describe('useFieldDiffs', () => {
  it('should return field value of fieldA and hasDiffs to true', () => {
    const { wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useFieldDiffs('fieldA'), { wrapper });
    expect(result.current).toEqual({ diffs: 'a', hasDiffs: true });
  });
  it('should return the hasDiffs boolean with falsy param', () => {
    const { wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useFieldDiffs(undefined), { wrapper });
    expect(result.current).toEqual({ diffs: undefined, hasDiffs: true });
  });
});
