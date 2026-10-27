import { selectDiffs, selectParentDiffs, selectHasDiffs } from './selectors';

const mockState = {
  DataDiffs: {
    parent_field1: ['diff1'],
    parent_field2: ['diff2'],
    other_field: ['diff3'],
  },
};

describe('selectDiffs', () => {
  it('should return the DataDiffs object from state', () => {
    const result = selectDiffs(mockState);
    expect(result).toEqual(mockState.DataDiffs);
  });

  it('should return an empty object if DataDiffs is missing', () => {
    const result = selectDiffs({} as any);
    expect(result).toEqual({});
  });
});

describe('selectParentDiffs', () => {
  it('should return the first unique value for matching keys', () => {
    const selector = selectParentDiffs('parent');
    const result = selector(mockState);
    expect(result).toEqual(['diff1']);
  });

  it('should return undefined if no matching keys are found', () => {
    const selector = selectParentDiffs('notMatchingAnyOfTheKeys');
    const result = selector(mockState);
    expect(result).toBeUndefined();
  });

  it('should return only one value if values are duplicated', () => {
    const mockStateWithDuplicates = {
      DataDiffs: {
        parent_1: ['theSameDiff'],
        parent_2: ['theSameDiff'],
      },
    };
    const selector = selectParentDiffs('parent');
    const result = selector(mockStateWithDuplicates);
    expect(result).toEqual(['theSameDiff']);
    expect(result?.length).toBe(1);
  });

  it('should not recompute if the state has not changed.', () => {
    const selector = selectParentDiffs('parent');

    selector(mockState);
    selector(mockState);
    selector(mockState);

    expect(selector.recomputations()).toBe(1);

    const newState = {
      DataDiffs: { ...mockState.DataDiffs, parent_field1: ['newField'] },
    };
    selector(newState);
    expect(selector.recomputations()).toBe(2);
  });
});

describe('selectHasDiffs', () => {
  it('should return true if at least one of the fields match and does not have empty diffs', () => {
    const selector = selectHasDiffs('parent');
    const result = selector(mockState);
    expect(result).toBe(true);
  });

  it('should return false when fields that match have empty diffs', () => {
    const emptyDiffMockState = {
      DataDiffs: {
        parent_field1: [],
        parent_field2: [],
      },
    };
    const selector = selectHasDiffs('parent');
    const result = selector(emptyDiffMockState as any);
    expect(result).toBe(false);
  });

  it('should return false if no keys match parentField parameter', () => {
    const selector = selectHasDiffs('notAMatchingKey');
    const result = selector(mockState);
    expect(result).toBe(false);
  });
});
