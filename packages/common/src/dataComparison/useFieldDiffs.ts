import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectHasDiffs, selectParentDiffs } from './selectors';
import { AnyType } from '@pkg-common/types';
import { equalityCheck } from '@pkg-common/utils/utils';

const useFieldDiffs = (parentField: AnyType) => {
  const hasDiffs = useSelector(selectHasDiffs(parentField || ''));
  const diffs = useSelector(selectParentDiffs(parentField), equalityCheck);

  return useMemo(() => {
    return {
      hasDiffs,
      diffs,
    };
  }, [hasDiffs, diffs]);
};

export default useFieldDiffs;
