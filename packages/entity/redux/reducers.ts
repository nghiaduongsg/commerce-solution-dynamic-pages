import {
  SAVE_ENTITY,
  SAVE_ENTITY_SUCCESS,
  SET_ENTITY,
  CLEAR_ENTITY,
  DELETE_ENTITY_ERROR,
  SAVE_ENTITY_ERROR,
  SET_ENTITY_FORM_DATA,
  APPEND_ENTITY_FORM_DATA,
  CLEAR_ENTITY_FORM_DATA,
  UPDATE_FORM_VALUE,
  CLEAR_FORM_VALUES,
  ADD_ARRAY_FIELD_ITEM,
  REMOVE_ARRAY_FIELD_ITEM,
  REORDER_ARRAY_FIELDS,
  SELECT_ARRAY_ITEMS,
  DESELECT_ARRAY_ITEMS,
  CLEAR_ENTITY_ERROR,
  CLEAR_ALL_ENTITIES,
  CONCAT_TO_OBJECT,
  ADD_ARRAY_FIELD_ITEMS,
  SET_TEMPORARY_ATTACHMENT,
  SET_VALID_ON_DATE,
  CLEAR_STEPPER_FORM,
} from './actions';

import {
  SAVE_TABLE_ROW,
  SAVE_TABLE_ROW_ERROR,
  SAVE_TABLE_ROW_SUCCESS,
} from '@pkg-list/src/actions';

import { EntityState } from './types';
import { defaultActionType } from '@pkg-common/types.d';
import {
  getContextValue,
  getJsonPathFromWidgetId,
  getWidgetArrayPosition,
  getWidgetIdFromJsonPath,
  getWidgetImmediateParentId,
  getWidgetNameFromWidgetId,
} from '@pkg-form/validations/utils/widgetUtils';
import jp from 'jsonpath';
import { isEqual, orderBy } from 'lodash';
import { AnyType } from '@pkg-common/types';
import { REPORTED_FORM_DATA_KEY } from '@pkg-constants/formCommon';
import {
  unwrapEntityDataArea,
  unwrapEntityDataAreaWithSkipKeys,
  clearFormStepperFieldsOnly,
  processValueAndCleanMetadata,
} from '@pkg-entity/utils/utils';
import { DSS_VALIDATION_REPORT_WIDGET } from '@pkg-form/components/FileWidget/DssValidationReportWidget';
import { CALL_API_FULFILLED, CALL_API_REJECTED } from '@pkg-core/apiData/redux/reducers';
import { SYSTEM_CLEAR } from '@pkg-setup/src/system/useSystem';
import { getQueriesFromUrl, jpValue } from '@pkg-common/dataResolver/utils';
import { clearData } from '@pkg-list/utils/tableRowUtils';
import { hasValue } from '@pkg-common/utils';

const defaultEntityState: EntityState = {
  id: '',
  url: '',
  entity: {},
  error: { message: '', innerViolations: [] },
  loading: false,
  entityIdKey: '',
  isNew: false,
  entityStoreId: '',
  formData: {},
  entityDataAreaKey: '',
  diffs: {},
  extras: {},
  selectedItems: {},
  hookUpdates: {},
  lastClearUpdate: 0,
  groupedDiffs: {},
};

const defaultAction: defaultActionType = {
  type: '',
  payload: {},
};

const defaultState: { [_: string]: EntityState } = {};

export default (state: { [_: string]: EntityState } = defaultState, action = defaultAction) => {
  const { type, payload } = action;
  const { metadata, entityId, pageId } = payload || {};
  const { resourceToEntity = undefined, resourceToFormFields = undefined, saveAs } = metadata || {};

  if (type === CLEAR_ALL_ENTITIES || type === SYSTEM_CLEAR) {
    return defaultState;
  }

  if (type === CALL_API_FULFILLED && saveAs === 'DATA_COMPARISON') {
    return apiResponseAsEntityComparison(state, payload);
  }

  if (type === CALL_API_FULFILLED && resourceToFormFields) {
    return apiResponseToFormFields(state, payload);
  }

  if (type === CALL_API_FULFILLED && !resourceToEntity) {
    return state;
  }

  const sliceId =
    type === CALL_API_FULFILLED && resourceToEntity ? resourceToEntity : entityId || pageId;

  if (!sliceId) {
    return state;
  }

  const sliceContent = {
    ...(state[sliceId] || { entityStoreId: sliceId, isNew: true }),
    ...pageReducer(sliceId, state[sliceId] || { entityStoreId: sliceId, isNew: true }, action),
  };

  return {
    ...state,
    [sliceId]: sliceContent,
  };
};

const pageReducer = (_: string, state: EntityState, action = defaultAction) => {
  const { type, payload } = action;

  if (!payload) {
    return state;
  }

  switch (type) {
    case SAVE_TABLE_ROW:
    case SAVE_ENTITY:
      return {
        ...state,
        loading: true,
      };

    case SAVE_TABLE_ROW_SUCCESS:
    case SAVE_ENTITY_SUCCESS:
      const timestamp = new Date().getTime();
      return {
        ...state,
        entity: {
          ...payload.entity,
          [REPORTED_FORM_DATA_KEY]: payload.entity?.reportedFormData
            ? JSON.parse(payload.entity.reportedFormData)
            : {},
        },
        formData: {
          ...payload.entity,
          [REPORTED_FORM_DATA_KEY]: payload.entity?.reportedFormData
            ? JSON.parse(payload.entity.reportedFormData)
            : {},
        },
        error: defaultState.error,
        loading: false,
        isNew: false,
        lastUpdate: timestamp,
        serverUpdate: hasValue(state?.serverUpdate) ? timestamp : 0,
        diffs: {},
        groupedDiffs: {},
      };
    case SAVE_TABLE_ROW_ERROR:
    case DELETE_ENTITY_ERROR:
    case SAVE_ENTITY_ERROR:
      return {
        ...state,
        error: payload.error,
        loading: false,
        isNew: payload.isNew || state.isNew,
        lastUpdate: new Date().getTime(),
      };
    case CALL_API_FULFILLED:
      return apiResponseAsEntity(state, payload);

    case CALL_API_REJECTED:
      return {
        ...state,
        error: payload.error,
        loading: false,
      };
    case SET_ENTITY:
      return {
        ...state,
        entity: {
          ...payload.initialEntityData,
          [REPORTED_FORM_DATA_KEY]: payload.initialEntityData?.reportedFormData
            ? JSON.parse(payload.initialEntityData.reportedFormData)
            : {},
        },
        formData: {
          ...payload.initialEntityData,
          [REPORTED_FORM_DATA_KEY]: payload.initialEntityData?.reportedFormData
            ? JSON.parse(payload.initialEntityData.reportedFormData)
            : {},
        },
        lastUpdate: new Date().getTime(),
        ...getExtraData(state, payload.extraData),
      };

    case SET_TEMPORARY_ATTACHMENT:
      return {
        ...state,
        attachment: payload.attachment,
        lastUpdate: new Date().getTime(),
      };

    case CLEAR_ENTITY_ERROR:
      return {
        ...state,
        error: {},
      };

    case CLEAR_ENTITY:
      return {
        ...state,
        entity: {},
        formData: {},
        diffs: {},
        groupedDiffs: {},
        lastUpdate: new Date().getTime(),
        lastClearUpdate: new Date().getTime(),
      };

    case SET_ENTITY_FORM_DATA:
      const { customFieldsKey } = payload;
      return state.loading
        ? state
        : {
            ...state,
            formData: customFieldsKey ? unwrapEntityDataArea(payload.data) : payload.data,
            lastUpdate: new Date().getTime(),
          };

    case APPEND_ENTITY_FORM_DATA:
      return state.loading
        ? state
        : {
            ...state,
            formData: { ...state.formData, ...payload.data },
            lastUpdate: new Date().getTime(),
          };

    case CLEAR_ENTITY_FORM_DATA:
      return {
        ...state,
        formData: {},
        diffs: {},
        groupedDiffs: {},
        lastUpdate: new Date().getTime(),
        lastClearUpdate: new Date().getTime(),
      };

    case SELECT_ARRAY_ITEMS:
      return {
        ...state,
        selectedItems: selectItems(
          payload.fieldId,
          state.formData,
          state.selectedItems || {},
          payload.indices,
          payload.multiple,
        ),
      };

    case DESELECT_ARRAY_ITEMS:
      return {
        ...state,
        selectedItems: deselectItems(payload.fieldId, state.selectedItems, payload.indices),
      };

    case REORDER_ARRAY_FIELDS:
      return {
        ...state,
        formData: reorderItems(payload.fieldId, state.formData, payload.sortBy),
      };

    case UPDATE_FORM_VALUE:
      const { fieldId, value, hookName, metadata } = payload || {};

      if (!hookName) {
        const { newDiffs, newGroupedDiffs } = setupDiffs(fieldId, value, state, metadata);
        return {
          ...state,
          formData: setFieldValue(fieldId, state.formData, value),
          lastUpdate: new Date().getTime(),
          hookUpdates: { ...state.hookUpdates, [fieldId]: hookName ? new Date().getTime() : 0 },
          diffs: newDiffs,
          groupedDiffs: newGroupedDiffs,
        };
      }
      return {
        ...state,
        formData: setFieldValue(fieldId, state.formData, value),
        lastUpdate: new Date().getTime(),
        hookUpdates: { ...state.hookUpdates, [fieldId]: hookName ? new Date().getTime() : 0 },
      };

    case CLEAR_FORM_VALUES:
      return {
        ...state,
        formData: setFieldValues(payload.fieldIds, state.formData),
        lastClearUpdate: new Date().getTime(),
      };

    case ADD_ARRAY_FIELD_ITEM:
      return {
        ...state,
        formData: addItem(payload.fieldId, state.formData, payload.item),
        lastUpdate: new Date().getTime(),
      };
    case ADD_ARRAY_FIELD_ITEMS:
      return {
        ...state,
        formData: addItems(payload.fieldId, state.formData, payload.items),
        lastUpdate: new Date().getTime(),
      };

    case REMOVE_ARRAY_FIELD_ITEM:
      const newGroupedDiffs = { ...state.groupedDiffs };
      if (state.groupedDiffs?.[`${payload.fieldId}_${payload.index}`]) {
        delete newGroupedDiffs[`${payload.fieldId}_${payload.index}`];
      }
      return {
        ...state,
        formData: removeItem(payload.fieldId, state.formData, payload.index),
        lastUpdate: new Date().getTime(),
        groupedDiffs: newGroupedDiffs,
      };

    case CONCAT_TO_OBJECT:
      return {
        ...state,
        formData: concatToObject(
          payload.fieldId,
          state.formData,
          payload.property,
          payload.value,
          payload.stringify,
        ),
        lastUpdate: new Date().getTime(),
      };
    case SET_VALID_ON_DATE:
      return {
        ...state,
        validOnDate: action.payload?.date,
      };
    case CLEAR_STEPPER_FORM:
      let clonedFormData = structuredClone(state.formData || {});
      clonedFormData = clearFormStepperFieldsOnly(
        payload.parentId,
        payload.groups,
        clonedFormData,
        payload.readOnlyWidgets,
      );

      return {
        ...state,
        formData: clonedFormData,
        lastUpdate: new Date().getTime(),
        lastClearUpdate: new Date().getTime(),
      };

    default:
      return state;
  }
};

const setFieldValues = (widgetIds: Array<string>, data) => {
  (widgetIds || []).forEach((widgetId) =>
    jp.value(
      data,
      jp.stringify(getJsonPathFromWidgetId(widgetId, false)).replace(/"/g, ''),
      undefined,
    ),
  );
  return data;
};

const setFieldValue = (widgetId: string, data, value) => {
  const formData = JSON.parse(JSON.stringify(data || {}));
  try {
    const jsonPath = jp.stringify(getJsonPathFromWidgetId(widgetId, false)).replace(/"/g, '');

    try {
      const arrayItemMatch = jsonPath.match(/^(.+)\[(\d+)\]\.(.+)$/);
      if (arrayItemMatch) {
        const [, arrayPath, index, property] = arrayItemMatch;
        const arrayItems = jp.value(formData, arrayPath);

        if (arrayItems?.length > 0 && arrayItems[index]) {
          const item = arrayItems[index];
          if (item?.__STATUS__ !== 'ADDED' && item[property] !== value) {
            item.__STATUS__ = 'EDITED';
          }
        }
      }
    } catch {}

    jp.value(formData, jsonPath, value);
    return formData;
  } catch {
    return data;
  }
};

const reorderItems = (widgetId: string, data, orderByAttribute?: string) => {
  const items = jpValue(data || {}, getJsonPathFromWidgetId(widgetId, false));
  const orderedItems = orderBy(items, [orderByAttribute || 'order', 'asc']);
  return setFieldValue(widgetId, data || {}, orderedItems);
};

const addItem = (widgetId: string, data, item) => {
  try {
    const items = jpValue(data, getJsonPathFromWidgetId(widgetId, false));
    return setFieldValue(widgetId, data, [...(items || []), { ...item, __STATUS__: 'ADDED' }]);
  } catch {
    return data;
  }
};

const addItems = (widgetId: string, data, items = []) => {
  try {
    const oldItems = jpValue(data, getJsonPathFromWidgetId(widgetId, false));
    return setFieldValue(widgetId, data, [...(oldItems || []), ...items]);
  } catch {
    return data;
  }
};

const removeItem = (widgetId: string, data, index) => {
  try {
    const items = jp.value(
      data,
      jp.stringify(getJsonPathFromWidgetId(widgetId, false)).replace(/"/g, ''),
    );

    return setFieldValue(
      widgetId,
      data,
      (items || []).filter((item, idx) => item && idx !== index),
    );
  } catch {
    // Failed to remove item!
    return data;
  }
};

const concatToObject = (
  widgetId: string,
  data,
  property: string,
  value: AnyType,
  stringify = false,
) => {
  try {
    const obj = jpValue(data, getJsonPathFromWidgetId(widgetId, false));

    const oldValue = stringify ? JSON.parse(obj || '{}') : obj;
    const newValue = { ...oldValue, [property]: value };

    return setFieldValue(widgetId, data, stringify ? JSON.stringify(newValue) : newValue);
  } catch {
    // Failed to remove item!
    return data;
  }
};

const selectItems = (
  widgetId: string,
  data,
  currentSelectedItems: { [_: string]: Array<AnyType> },
  selectedIndices: Array<number>,
  multiple: boolean,
) => {
  try {
    const currentSelectedIndices = (currentSelectedItems[widgetId] || []).map(
      (item) => item.__index,
    );

    const items = jpValue(data, getJsonPathFromWidgetId(widgetId, false))
      ?.map((item, index) => ({ ...item, __index: index }))
      ?.filter(
        (item) =>
          selectedIndices.indexOf(item.__index) >= 0 &&
          currentSelectedIndices.indexOf(item.__index) < 0,
      );

    return {
      ...currentSelectedItems,
      [widgetId]: multiple ? [...(currentSelectedItems[widgetId] || []), ...items] : [...items],
    };
  } catch {
    return currentSelectedItems;
  }
};

const deselectItems = (
  widgetId: string,
  currentSelectedItems: { [_: string]: Array<AnyType> },
  deselectedIndices: Array<number>,
) => {
  return {
    ...currentSelectedItems,
    [widgetId]: (currentSelectedItems[widgetId] || []).filter(
      (item) => deselectedIndices.indexOf(item.__index) < 0,
    ),
  };
};

const getExtraData = (state, extraData) => {
  const isNew = typeof extraData?.isNew === 'undefined' ? state.isNew : extraData?.isNew;
  const entityIdKey =
    typeof extraData?.idKey === 'undefined' ? state.entityIdKey : extraData?.idKey;
  const url = typeof extraData?.url === 'undefined' ? state.url : extraData?.url;
  const entityDataAreaKey =
    typeof extraData?.customFieldsKey === 'undefined'
      ? state.entityDataAreaKey
      : extraData?.customFieldsKey;

  return { isNew, entityIdKey, url, entityDataAreaKey };
};

const apiResponseAsEntityComparison = (state, payload) => {
  const { data } = payload;
  const pageId = 'FormDefinition';

  try {
    let v1;
    if (Array.isArray(data?.content)) {
      const forms = data.content;
      const queries = getQueriesFromUrl(window.location.href);
      const formId = queries['formId'];

      const currentForm = forms.find((f) => f?.id === formId) || forms[0];
      v1 = unwrapEntityDataArea(currentForm);
    } else {
      const versions = Object.values(data);

      // @ts-ignore
      const v1Timestamp = new Date(versions[0]?.lastUpdateTimestamp).getTime();
      // @ts-ignore
      const v2Timestamp = new Date(versions[1]?.lastUpdateTimestamp).getTime();

      v1 = unwrapEntityDataArea(v2Timestamp > v1Timestamp ? versions[1] : versions[0]);
    }

    return {
      ...state,
      [pageId]: {
        ...defaultEntityState,
        entityStoreId: pageId,
        isNew: false,
        entity: v1,
        formData: v1,
      },
    };
  } catch {
    return state;
  }
};

/**
 * Returns the names of all fields in the given uiSchema that use a specific
 * widget (matched by `ui:widget` value).
 */
const getFieldsByWidget = (uiSchema: AnyType, widgetName: string): string[] => {
  if (!uiSchema || typeof uiSchema !== 'object') return [];
  return Object.keys(uiSchema).filter((key) => uiSchema[key]?.['ui:widget'] === widgetName);
};

/**
 * Looks up the uiSchema for a page from the global FALLBACK_SCHEMAS registry.
 * Returns `pageUiSchema` when available (detail/edit pages), falling back to
 * the top-level `uiSchema`.
 */
const getPageUiSchema = (pageId: string): AnyType => {
  const schemas = window['FALLBACK_SCHEMAS'];
  if (!schemas?.[pageId]) return null;
  return schemas[pageId].pageUiSchema ?? schemas[pageId].uiSchema ?? null;
};

const stringifyMessageViewerFields = (data: AnyType, messageFields: string[]): AnyType => {
  if (!data || typeof data !== 'object' || !messageFields?.length) {
    return data;
  }

  const result = { ...data };
  messageFields.forEach((field) => {
    const value = result[field];
    if (value !== null && value !== undefined && typeof value === 'object') {
      try {
        result[field] = JSON.stringify(value);
      } catch (error) {
        console.warn(`Failed to stringify field "${field}":`, error);
      }
    }
  });
  return result;
};

const MESSAGE_VIEWER_WIDGET = 'MessageViewerWidget';

const apiResponseAsEntity = (state, payload) => {
  const { data, metadata, jsonPath, performQuery, pageId } = payload;
  const finalData = jsonPath
    ? getContextValue(pageId, data, {
        code: pageId,
        jsonPath,
        performQuery,
      })
    : data;
  const { resourceToEntity = undefined, type, resourceExtras } = metadata || {};

  if (resourceToEntity) {
    const transformDataFromServer = window['transformDataFromServer'];

    const { clearProperties } = resourceExtras || {};
    const isSaved = state.entityIdKey ? !!data[state.entityIdKey] : true;
    const extraData = getExtraData(state, { isNew: !isSaved, ...resourceExtras });

    if (type === '__DUPLICATE__') {
      const final = clearData(finalData, clearProperties);
      return {
        ...state,
        formData: {
          ...unwrapEntityDataArea(final),
          code: null,
          id: undefined,
        },
      };
    } else {
      const pageUiSchema = getPageUiSchema(resourceToEntity);
      const dssFields = getFieldsByWidget(pageUiSchema, DSS_VALIDATION_REPORT_WIDGET);

      const messageFields = getFieldsByWidget(pageUiSchema, MESSAGE_VIEWER_WIDGET);
      const skipFields = [...dssFields, ...messageFields];

      try {
        const final = {
          ...finalData,
          [REPORTED_FORM_DATA_KEY]: finalData?.reportedFormData
            ? JSON.parse(finalData?.reportedFormData || {})
            : {},
        };

        // Fields declared with DSS_VALIDATION_REPORT_WIDGET & MessageViewerWidget fields hold an opaque
        // JSON (string or object) that must NOT be unwrapped (otherwise parsed keys are
        // promoted to the root and the original field key is removed).
        const unwrapped = unwrapEntityDataAreaWithSkipKeys(final, skipFields);

        const transformedData = transformDataFromServer(resourceToEntity, unwrapped);
        const normalizedData = stringifyMessageViewerFields(transformedData, messageFields);

        const timestamp = new Date().getTime();

        return {
          ...state,
          entity: normalizedData,
          formData: normalizedData,
          lastUpdate: timestamp,
          serverUpdate: hasValue(state?.serverUpdate) ? timestamp : 0,
          ...extraData,
        };
      } catch {
        const timestamp = new Date().getTime();
        const normalizedData = stringifyMessageViewerFields(finalData, messageFields);

        return {
          ...state,
          entity: normalizedData,
          formData: normalizedData,
          lastUpdate: timestamp,
          serverUpdate: hasValue(state?.serverUpdate) ? timestamp : 0,
          ...extraData,
        };
      }
    }
  } else {
    return state;
  }
};

const apiResponseToFormFields = (state, payload) => {
  const { data, metadata } = payload;
  const { resourceToFormFields, parentId } = metadata || {};

  if (!resourceToFormFields || !parentId) {
    return state;
  }

  let newState = { ...state };

  resourceToFormFields.forEach(({ dataPath, fieldPath }) => {
    const sliceId = fieldPath.code;
    const sliceData = newState[sliceId];

    if (!sliceData) return;

    const widgetId = getWidgetIdFromJsonPath(sliceId, parentId, fieldPath.jsonPath);

    const subData = jpValue(data, dataPath);

    newState[sliceId] = {
      ...sliceData,
      formData: setFieldValue(widgetId, sliceData.formData, subData),
      lastUpdate: new Date().getTime(),
      hookUpdates: {
        ...sliceData.hookUpdates,
        [widgetId]: 0,
      },
    };
  });

  return newState;
};

const setupDiffs = (fieldId: string, value: AnyType, state: EntityState, metadata) => {
  const newDiffs = { ...state.diffs };
  const newGroupedDiffs = { ...state.groupedDiffs };
  const { type } = metadata ?? {};

  try {
    if (type !== 'CANCEL') {
      const jsonPathFlat = jp.stringify(getJsonPathFromWidgetId(fieldId, false)).replace(/"/g, '');
      const prevFlat = newDiffs[fieldId]
        ? newDiffs[fieldId].prev
        : jp.value(state.entity, jsonPathFlat);
      if (isEqual(value, prevFlat)) {
        delete newDiffs[fieldId];
      } else {
        newDiffs[fieldId] = { prev: prevFlat, current: value };
      }
    }

    addToGroup(fieldId, value, newGroupedDiffs, state.entity, type);

    return { newGroupedDiffs, newDiffs };
  } catch {
    return { newGroupedDiffs, newDiffs };
  }
};

const addToGroup = (
  fieldId: string,
  inputValue: AnyType,
  grouped: Record<string, { prev: AnyType; current: AnyType }> | Record<string, never>,
  entity: AnyType,
  type: string,
) => {
  const value = processValueAndCleanMetadata(inputValue);
  const widgetName = getWidgetNameFromWidgetId(fieldId);
  const parentFieldName = getWidgetImmediateParentId(fieldId);
  const hasArrayIndex = getWidgetArrayPosition(fieldId);

  const groupKey =
    type === 'CANCEL' ? fieldId : hasValue(hasArrayIndex) ? parentFieldName : fieldId;

  const jsonPathGrouped = jp.stringify(getJsonPathFromWidgetId(groupKey, false)).replace(/"/g, '');

  const prevValue = grouped[groupKey] ? grouped[groupKey].prev : jp.value(entity, jsonPathGrouped);

  const currentValue =
    type === 'CANCEL'
      ? value
      : hasValue(hasArrayIndex)
        ? {
            ...(grouped[groupKey]?.current ?? prevValue ?? {}),
            [widgetName]: value,
          }
        : value;

  if (isEqual(currentValue, prevValue)) {
    delete grouped[groupKey];
  } else {
    grouped[groupKey] = {
      prev: prevValue,
      current: currentValue,
    };
  }
};
