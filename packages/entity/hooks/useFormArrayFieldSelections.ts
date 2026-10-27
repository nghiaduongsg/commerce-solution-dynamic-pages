import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';

import { selectFieldSelectedItems } from '@pkg-entity/redux/selectors';

import { SelectArrayItems, DeselectArrayItems } from '@pkg-entity/redux/actions';
import { getFormIdFromWidgetId } from '@pkg-form/validations/utils/widgetUtils';
import { equalityCheck } from '@pkg-common/utils/utils';

const useFormArrayFieldSelections = (fieldId = '') => {
  const dispatch = useDispatch();

  const entityId = getFormIdFromWidgetId(fieldId);

  const fieldSelectedItems = useSelector(
    selectFieldSelectedItems(entityId, fieldId),
    equalityCheck,
  );

  const fieldSelectedIndices = fieldSelectedItems?.map((item) => item.__index);

  return {
    fieldSelectedItems,
    fieldSelectedIndices,
    selectArrayItems: useCallback(
      (indices: Array<number>, multiple: boolean) =>
        dispatch(SelectArrayItems({ entityId, fieldId, indices, multiple })),
      [dispatch, entityId, fieldId],
    ),
    deselectArrayItems: useCallback(
      (indices: Array<number>) => dispatch(DeselectArrayItems({ entityId, fieldId, indices })),
      [dispatch, entityId, fieldId],
    ),
  };
};

export default useFormArrayFieldSelections;
