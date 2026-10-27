import { EntityReduxState } from './types';
import { EntityState } from './types';
import { createSelector } from 'reselect';
import { getJsonPathFromWidgetId } from '@pkg-form/validations/utils/widgetUtils';
import { compareNested, isEqualRecursive } from '@pkg-common/utils/utils';
import { isEmpty } from 'lodash';
import { hasValue } from '@pkg-common/utils';
import { jpValue } from '@pkg-common/dataResolver/utils';

export const selectSlice =
  (id: string) =>
  (state: EntityReduxState): EntityState =>
    state.Entities[id] || {};

export const selectUserHasMadeChanges = (id: string) => (state: EntityReduxState) => {
  const { entity, formData, entityIdKey, isNew } = selectSlice(id)(state);

  if (selectLoading(id)) {
    return false;
  }

  if (isNew) {
    return !isEmpty(formData);
  }

  if (!formData || !formData[entityIdKey] || !entity || !entity[entityIdKey]) {
    return false;
  }

  const entityKeys = Object.keys(entity);

  return entityKeys.some((key) => {
    const entityValue = entity[key];
    const formValue = formData[key];

    if (!isEqualRecursive(entityValue, formValue)) {
      if (typeof entityValue === 'object' && typeof formValue === 'object') {
        return !compareNested(entityValue, formValue);
      } else {
        return true;
      }
    }

    return false;
  });
};

export const selectDiffsData = (id: string) => (state: EntityReduxState) =>
  selectSlice(id)(state).diffs || {};

export const selectGroupedDiffsData = (id: string) => (state: EntityReduxState) =>
  selectSlice(id)(state).groupedDiffs || {};

export const selectHasChanges = (id: string) => (state: EntityReduxState) =>
  Object.keys(selectSlice(id)(state).groupedDiffs || {}).length > 0;

export const selectEntityId = (id: string) => (state: EntityReduxState) => {
  const slice = selectSlice(id)(state);
  const { entity, entityIdKey } = slice;
  if (!entity) {
    return '';
  }
  return entity[entityIdKey] || '';
};

export const selectSliceExists = (id: string) => (state: EntityReduxState) => {
  return hasValue(selectSlice(id)(state));
};

export const selectValidOnDate = (id: string) => (state: EntityReduxState) =>
  selectSlice(id)(state).validOnDate;

export const selectEntity = (id: string) => (state: EntityReduxState) =>
  selectSlice(id)(state).entity || {};
export const selectExtras = (id: string) => (state: EntityReduxState) =>
  selectSlice(id)(state).extras || {};
export const selectIsNewEntity = (id: string) => (state: EntityReduxState) =>
  selectSlice(id)(state).isNew;
export const selectLoading = (id: string) => (state: EntityReduxState) =>
  selectSlice(id)(state).loading;
export const selectFormData = (id: string) => (state: EntityReduxState) =>
  selectSlice(id)(state).formData || {};

export const selectHookUpdates = (id: string) => (state: EntityReduxState) =>
  selectSlice(id)(state).hookUpdates || {};

export const selectDataExists = (id: string) => (state: EntityReduxState) => {
  return hasValue(selectSlice(id)(state).formData || {});
};

export const selectFormDataForCodeInjection = (id: string) => (state: EntityReduxState) =>
  JSON.parse(JSON.stringify(selectSlice(id)(state).formData || {}));
export const selectUrl = (id: string) => (state: EntityReduxState) => selectSlice(id)(state).url;
export const selectEntityIdKey = (id: string) => (state: EntityReduxState) =>
  selectSlice(id)(state).entityIdKey;
export const selectDataAreaKey = (id: string) => (state: EntityReduxState) =>
  selectSlice(id)(state).entityDataAreaKey;
export const selectLastUpdate = (id: string) => (state: EntityReduxState) =>
  selectSlice(id)(state).lastUpdate;
export const selectServerUpdate = (id: string) => (state: EntityReduxState) =>
  selectSlice(id)(state).serverUpdate;
export const selectLastClearUpdate = (id: string) => (state: EntityReduxState) =>
  selectSlice(id)(state).lastClearUpdate;

export const selectError = (id: string) => (state: EntityReduxState) =>
  selectSlice(id)(state).error;

export const selectErrorMessage = (id: string) => (state: EntityReduxState) => {
  const error = selectSlice(id)(state).error;
  if (error) {
    const { errorCode, message } = error;
    const errorMessage = message || '';
    const formattedErrorCode = errorCode ? `${errorCode}: ` : '';
    return `${formattedErrorCode}${errorMessage}`;
  }
  return '';
};

export const selectSelectedItems = (id: string) => (state: EntityReduxState) =>
  selectSlice(id)(state).selectedItems || {};

export const selectFieldValue = (id: string, fieldId: string) =>
  createSelector(selectFormData(id), (data) => {
    return getFieldValue(fieldId, data);
  });

export const selectFieldSelectedItems = (id: string, fieldId: string) =>
  createSelector(selectSelectedItems(id), (selectedItems) => {
    return selectedItems[fieldId];
  });

export const selectFieldUpdate = (id: string, fieldId: string) =>
  createSelector(selectHookUpdates(id), (data) => {
    return (data ?? {})[fieldId] ?? 0;
  });

const getFieldValue = (widgetId: string, data) => {
  try {
    return jpValue(data, getJsonPathFromWidgetId(widgetId, false));
  } catch {
    // Failed to apply value to form data property
    return null;
  }
};
