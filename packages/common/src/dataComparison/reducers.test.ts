import DataComparison from './reducers';
import { SYSTEM_CLEAR } from '@pkg-setup/src/system/useSystem';
import { CallApi } from '@pkg-core/apiData/redux/reducers';
import * as utils from '@pkg-entity/utils/utils';
import * as comparisonUtils from '@pkg-entity/utils/comparisonUtils';

jest.mock('@pkg-entity/utils/utils', () => ({
  unwrapEntityDataArea: jest.fn(),
}));

jest.mock('@pkg-entity/utils/comparisonUtils', () => ({
  compareForms: jest.fn(),
}));

describe('Data Comparison Reducer', () => {
  const defaultState = {};

  describe('SetDiffs', () => {
    it('when default state is empty object', () => {
      const action = {
        type: 'DataDiffs/SetDiffs',
        payload: {
          diffs: {
            a: ['a1'],
            b: ['b1', 'b2'],
          },
        },
      };

      expect(DataComparison(defaultState, action)).toEqual({
        a: ['a1'],
        b: ['b1', 'b2'],
      });
    });

    it('when default state contains diffs', () => {
      const initialState = {
        c: ['c1'],
      };

      const action = {
        type: 'DataDiffs/SetDiffs',
        payload: {
          diffs: {
            a: ['a1'],
            b: ['b1', 'b2'],
          },
        },
      };

      expect(DataComparison(initialState, action)).toEqual({
        c: ['c1'],
        a: ['a1'],
        b: ['b1', 'b2'],
      });
    });

    it('when default state contains diffs with a common key', () => {
      const initialState = {
        a: ['a1', 'a2', 'a3'],
      };

      const action = {
        type: 'DataDiffs/SetDiffs',
        payload: {
          diffs: {
            a: ['a1'],
            b: ['b1', 'b2'],
          },
        },
      };

      expect(DataComparison(initialState, action)).toEqual({
        a: ['a1'],
        b: ['b1', 'b2'],
      });
    });

    it('should return the defaultState when no payload is given', () => {
      const initialState = {
        a: ['a1', 'a2', 'a3'],
      };

      const action = {
        type: 'DataDiffs/SetDiffs',
      };

      expect(DataComparison(initialState, action)).toEqual(initialState);
    });
  });

  describe('CallApi.fulfilled', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('when saveAs equals DATA_COMPARISON, it should compute and set diffs', () => {
      const v1 = { lastUpdateTimestamp: '2024-01-01' };
      const v2 = { lastUpdateTimestamp: '2024-01-02' };

      const unwrappedV1 = { field1: 'old' };
      const unwrappedV2 = { field1: 'new' };

      (utils.unwrapEntityDataArea as jest.Mock)
        .mockReturnValueOnce(unwrappedV1)
        .mockReturnValueOnce(unwrappedV2);

      const expectedDiffs = { field1: ['field1.diff'] };
      (comparisonUtils.compareForms as jest.Mock).mockReturnValue({ diffs: expectedDiffs });

      const action = {
        type: CallApi.fulfilled,
        payload: {
          data: { a: v1, b: v2 },
          metadata: { saveAs: 'DATA_COMPARISON' },
        },
      };

      expect(DataComparison(defaultState, action)).toEqual(expectedDiffs);
      expect(utils.unwrapEntityDataArea).toHaveBeenCalledTimes(2);
      expect(comparisonUtils.compareForms).toHaveBeenCalledWith(
        unwrappedV1,
        unwrappedV2,
        'FormDefinition',
      );
    });

    it('when saveAs equals DATA_COMPARISON with reversed timestamps, it should order versions correctly', () => {
      const v1 = { lastUpdateTimestamp: '2024-01-05' };
      const v2 = { lastUpdateTimestamp: '2024-01-02' };

      const unwrappedV1 = { field1: 'newer' };
      const unwrappedV2 = { field1: 'older' };

      (utils.unwrapEntityDataArea as jest.Mock)
        .mockReturnValueOnce(unwrappedV1)
        .mockReturnValueOnce(unwrappedV2);

      const expectedDiffs = { field1: ['field1.diff'] };
      (comparisonUtils.compareForms as jest.Mock).mockReturnValue({ diffs: expectedDiffs });

      const action = {
        type: CallApi.fulfilled,
        payload: {
          data: { a: v1, b: v2 },
          metadata: { saveAs: 'DATA_COMPARISON' },
        },
      };

      expect(DataComparison(defaultState, action)).toEqual(expectedDiffs);
      expect(comparisonUtils.compareForms).toHaveBeenCalledWith(
        unwrappedV2,
        unwrappedV1,
        'FormDefinition',
      );
    });

    it('when saveAs equals DATA_COMPARISON with paged content shape, it should order forms by formId/relatedFormsId', () => {
      const relatedForm = { id: 'related-1', lastUpdateTimestamp: '2024-01-01' };
      const currentForm = { id: 'current-1', lastUpdateTimestamp: '2024-01-02' };

      const unwrappedRelated = { field1: 'old' };
      const unwrappedCurrent = { field1: 'new' };

      (utils.unwrapEntityDataArea as jest.Mock)
        .mockReturnValueOnce(unwrappedRelated)
        .mockReturnValueOnce(unwrappedCurrent);

      const expectedDiffs = { field1: ['field1.diff'] };
      (comparisonUtils.compareForms as jest.Mock).mockReturnValue({ diffs: expectedDiffs });

      const action = {
        type: CallApi.fulfilled,
        payload: {
          data: { content: [relatedForm, currentForm], pageMetadata: {} },
          metadata: {
            saveAs: 'DATA_COMPARISON',
            replacementValues: { formId: 'current-1', comparedFormId: 'compared-1' },
          },
        },
      };

      expect(DataComparison(defaultState, action)).toEqual(expectedDiffs);
      expect(utils.unwrapEntityDataArea).toHaveBeenCalledTimes(2);
      expect(comparisonUtils.compareForms).toHaveBeenCalledWith(
        unwrappedRelated,
        unwrappedCurrent,
        'FormDefinition',
      );
    });

    it('when saveAs is not DATA_COMPARISON, it should return unchanged state', () => {
      const initialState = { existing: ['diff'] };

      const action = {
        type: CallApi.fulfilled,
        payload: {
          data: { a: {}, b: {} },
          metadata: { saveAs: 'SOMETHING_ELSE' },
        },
      };

      expect(DataComparison(initialState, action)).toEqual(initialState);
      expect(utils.unwrapEntityDataArea).not.toHaveBeenCalled();
      expect(comparisonUtils.compareForms).not.toHaveBeenCalled();
    });

    it('when metadata is missing, it should return unchanged state', () => {
      const initialState = { existing: ['diff'] };

      const action = {
        type: CallApi.fulfilled,
        payload: {
          data: { a: {}, b: {} },
        },
      };

      expect(DataComparison(initialState, action)).toEqual(initialState);
      expect(utils.unwrapEntityDataArea).not.toHaveBeenCalled();
      expect(comparisonUtils.compareForms).not.toHaveBeenCalled();
    });

    it('when default state is empty object and saveAs is DATA_COMPARISON, it should set diffs', () => {
      const v1 = { lastUpdateTimestamp: '2024-01-01' };
      const v2 = { lastUpdateTimestamp: '2024-01-02' };

      (utils.unwrapEntityDataArea as jest.Mock).mockReturnValueOnce({}).mockReturnValueOnce({});

      const expectedDiffs = { a: ['1'], b: ['2'] };
      (comparisonUtils.compareForms as jest.Mock).mockReturnValue({ diffs: expectedDiffs });

      const action = {
        type: CallApi.fulfilled,
        payload: {
          data: { a: v1, b: v2 },
          metadata: { saveAs: 'DATA_COMPARISON' },
        },
      };

      expect(DataComparison(defaultState, action)).toEqual(expectedDiffs);
    });
  });

  it('ClearDiffs', () => {
    const initialState = {
      a: ['a1', 'a2', 'a3'],
    };
    const action = {
      type: 'DataDiffs/ClearDiffs',
    };

    expect(DataComparison(initialState, action)).toEqual({});
  });

  it(SYSTEM_CLEAR, () => {
    const initialState = {
      a: ['a1', 'a2', 'a3'],
    };
    const action = {
      type: SYSTEM_CLEAR,
    };

    expect(DataComparison(initialState, action)).toEqual({});
  });
});
