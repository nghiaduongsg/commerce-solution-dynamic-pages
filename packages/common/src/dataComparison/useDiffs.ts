import { selectDiffs } from './selectors';
import { SetDiffs, ClearDiffs } from './reducers';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { equalityCheck } from '@pkg-common/utils/utils';
import { SetDiffsAction } from '@pkg-common/dataComparison/types';

const useDiffs = () => {
  const dispatch = useDispatch();
  return {
    diffs: useSelector(selectDiffs, equalityCheck),
    setFieldDiffs: useCallback(
      (diffs: SetDiffsAction['diffs']) => dispatch(SetDiffs({ diffs })),
      [dispatch],
    ),
    clearDiffs: useCallback(() => dispatch(ClearDiffs()), [dispatch]),
  };
};

export default useDiffs;
