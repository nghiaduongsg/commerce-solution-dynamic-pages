import {
  AnyType,
  CodeListItem,
  DataSourceSchema,
  FieldConditionSchema,
  StoreTypesSchema,
  ApiValuesSchema,
  CheckFromSchema,
} from '../types';
import jp from 'jsonpath';
import {
  NAVIGATION_STATE_KEY,
  TYPE_API_DATA,
  TYPE_EDITED_NODE,
  TYPE_ENTITY,
  TYPE_FILTERS,
  TYPE_LIST,
  TYPE_SELF,
  TYPE_STORE,
} from '../../../constants/formCommon';
import {
  createResourceKey,
  encodeText,
  formatDate,
  hasCorrectValue,
  hasValidDate,
  hasValue,
} from '../utils';
import { cloneDeep, isArray, isNull, isUndefined } from 'lodash';
import { useLocation } from 'react-router';
import {
  getFormIdFromWidgetId,
  getJsonPathFromWidgetId,
  getFinalJsonPath,
} from '@pkg-form/validations/utils/widgetUtils';

const getStoreSlice = (storeState: AnyType, sourceKey: string, sourceType?: StoreTypesSchema) => {
  if (!sourceKey || !storeState || !hasValue(storeState)) {
    return {};
  }

  if (!storeState?.Entities) {
    return {};
  }

  switch (sourceType) {
    case TYPE_API_DATA:
      return storeState.ApiData[sourceKey]?.data || {};

    case TYPE_STORE:
      return storeState[sourceKey];

    case TYPE_EDITED_NODE:
      return storeState.CurrentEditedItem;

    case TYPE_LIST:
      return storeState?.Tables[sourceKey]?.pageData;

    case TYPE_FILTERS:
      return storeState?.Tables[sourceKey]?.filterData;

    case TYPE_ENTITY:
      return storeState?.Entities[sourceKey]?.entity;

    case TYPE_SELF:
      return storeState?.Entities[sourceKey]?.formData;

    default:
      return storeState?.Entities[sourceKey]?.formData;
  }
};
export const deepEqual = (a: any, b: any) => {
  if (a === b) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }
  if (typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }

  const aKeys = Object.keys(a).filter((k) => a[k] !== undefined);
  const bKeys = Object.keys(b).filter((k) => b[k] !== undefined);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  return aKeys.every((key) => deepEqual(a[key], b[key]));
};

export const jpValue = (
  data: AnyType = {},
  jsonPath: Array<string>,
  jpFunction: 'query' | 'value' = 'value',
) => {
  try {
    if (jpFunction === 'query') {
      return jp.query(data, jp.stringify(jsonPath).replace(/"/g, ''));
    } else if (jsonPath.length === 1) {
      return data[jsonPath[0]];
    } else if (jsonPath.length === 2) {
      if (data[jsonPath[0]]) {
        return data[jsonPath[0]][jsonPath[1]];
      } else {
        return undefined;
      }
    } else if (jsonPath.length === 3) {
      if (data[jsonPath[0]] && data[jsonPath[0]][jsonPath[1]]) {
        return data[jsonPath[0]][jsonPath[1]][jsonPath[2]];
      } else {
        return undefined;
      }
    } else {
      return jp.value(
        data[jsonPath[0]][jsonPath[1]],
        jp.stringify(jsonPath?.slice(2)).replace(/"/g, ''),
      );
    }
  } catch {
    return null;
  }
};

const getLocalStorageData = (key: string) => {
  const localStorageData = localStorage.getItem(key);
  try {
    if (localStorageData) {
      return JSON.parse(localStorageData);
    }
  } catch {
    return localStorageData;
  }
};

const hasValidValue = (type: string, value: AnyType, returnFalsyValues: boolean = false) => {
  if (type === 'date') {
    return hasValidDate(value);
  }

  if (!hasValue(value) && !returnFalsyValues) {
    return false;
  }

  return true;
};

const getContextValue = (
  widgetId: string,
  formData,
  source: Partial<DataSourceSchema>,
): AnyType => {
  const jpFunction = source?.performQuery ? 'query' : 'value';
  const jsonPath = getFinalJsonPath(
    source?.__JSON_PATH__ || widgetId,
    source?.jsonPath ?? [],
    false,
    source?.reverse,
  );

  const operator = source?.operator;

  const finalFormData =
    source?.transformToArray && !Array.isArray(formData) ? [formData] : formData;

  try {
    const value = jp[jpFunction](finalFormData, jp.stringify(jsonPath).replace(/"/g, ''));
    if (operator === 'keys' && hasValue(value)) {
      // @ts-ignore
      return Object.entries(value)
        .filter((entry) => entry[1])
        .map((entry) => entry[0]);
    }
    return value;
  } catch {
    if (source?.performQuery) {
      return [];
    }
    if (source.type === 'API_DATA') {
      return formData;
    }
    return '';
  }
};

const getFinalSource = (state, source: DataSourceSchema, widgetId: string) => {
  const newSource: DataSourceSchema = cloneDeep(source);

  if (source?.jsonPathReplacement) {
    const replacementData = getStoreSlice(
      state,
      source.jsonPathReplacement?.code ?? '',
      source.jsonPathReplacement?.type,
    );

    const keyValue = getContextValue(widgetId, replacementData, source.jsonPathReplacement);

    newSource.jsonPath = [];
    const jsonPath = source.jsonPath || [];

    Object.keys(jsonPath).forEach((key) => {
      if (keyValue !== undefined) {
        const newPath = jsonPath[key].replace('JSON_PATH_PARAM', keyValue);
        newSource.jsonPath?.push(newPath);
      }
    });
  }

  return newSource;
};

const getProperty = (widgetId, data, source, itemCode) => {
  const { relatedObject, relatedCodeList } = source;
  const objConfig = relatedObject || relatedCodeList;

  const { state = {} } = data || {};

  const {
    code = '',
    // @ts-ignore
    property = '',
    // @ts-ignore
    attribute = '',
    replacements = [],
    queryFrom = [],
    value,
  } = objConfig || {};
  const replacementValues = resolveData(widgetId, data, [...queryFrom, ...replacements]);
  const codeList = createResourceKey(code, replacementValues || {});

  // @ts-ignore
  const list: Array<CodeListItem> = state?.CodeList?.lists[codeList] || [];

  // @ts-ignore
  const item = list.find((listItem) => listItem.code === itemCode);

  if (!item) {
    return;
  }

  if (property) {
    return item.relatedObject && item.relatedObject[property];
  }
  if (attribute) {
    const attributeValue = (item.attributes || [])
      .filter((attr) => attr.key === attribute)
      .map((attr) => attr.value);

    const temporaryValue = value
      ? attributeValue?.filter((v) => v.includes(value)).length > 0
      : attributeValue;

    if (Array.isArray(temporaryValue) && temporaryValue.length === 1) {
      return temporaryValue[0];
    }

    return temporaryValue;
  }
};

const getFinalSourceCode = (source, widgetId) => {
  if (source?.codePath) {
    const finalJsonPath = getFinalJsonPath(widgetId, source?.codePath);
    const formId = getFormIdFromWidgetId(widgetId);
    return `${formId}_${finalJsonPath.join('_')}`;
  }
  return source?.code ?? widgetId;
};

export const getValue = (operator, value, calculationOutputIfEmpty: 0 | null = 0) => {
  if (operator === 'sum' && Array.isArray(value)) {
    if (value.length === 0) {
      return calculationOutputIfEmpty;
    }
    return value?.filter((v) => v).reduce((a, b) => a + b, 0);
  }
  if (operator === 'join' && Array.isArray(value)) {
    const txt = value?.filter((v) => v)?.join(',');
    if (txt === '') {
      return undefined;
    }
    return txt;
  }
  if (operator === 'array' && !Array.isArray(value) && hasValue(value)) {
    return [value];
  }
  if (operator === 'multiline' && Array.isArray(value)) {
    return value?.filter((v) => v)?.join('\n');
  }
  if (operator === 'concat' && Array.isArray(value)) {
    return value?.filter((v) => v)?.join(',');
  } else if (operator === 'first' && Array.isArray(value)) {
    return value[0];
  } else {
    return value;
  }
};

const isValueCorrect = (
  value: AnyType,
  checkWhen: Array<string> = [],
  operator = 'equals',
  defaultValue = false,
) => {
  if (operator === 'isNull') {
    return isNull(value);
  }
  if (operator === 'isUndefined') {
    return isUndefined(value);
  }

  if (operator === 'isEmpty') {
    return isUndefined(value) || isNull(value) || !value?.length;
  }

  if (operator === 'equalsOrNull') {
    return hasCorrectValue(checkWhen || [], value) || isNull(value);
  }

  if (operator === 'equalsOrUndefined') {
    return hasCorrectValue(checkWhen || [], value) || isUndefined(value);
  }

  if (!hasValue(value)) {
    return defaultValue ?? false;
  }

  if (!checkWhen.length && hasValue(value)) {
    return true;
  }

  if (operator === 'equals') {
    return hasCorrectValue(checkWhen || [], value);
  }

  if (operator === 'greaterEquals') {
    return checkWhen.every((v) => v <= value);
  }

  if (operator === 'greater') {
    return checkWhen.every((v) => v < value);
  }

  if (operator === 'lowerEquals') {
    return checkWhen.every((v) => v >= value);
  }

  if (operator === 'lower') {
    return checkWhen.every((v) => v > value);
  }

  if (operator === 'not') {
    return hasValue(value) && !hasCorrectValue(checkWhen || [], value);
  }

  if (operator === 'length' && Array.isArray(value) && checkWhen?.length && value?.length) {
    const exactLength = +checkWhen[0];
    return value?.length === exactLength;
  }

  if (operator === 'lengthGreaterEquals' && Array.isArray(value) && checkWhen?.length) {
    return value.length >= +checkWhen[0];
  }

  return true;
};

export const checkIfValueCorrect = (
  key: AnyType,
  fieldOperator: AnyType,
  checkWhen: Array<string>,
  user: string,
  values: AnyType,
  defaultValue: AnyType,
) => {
  if (!key) {
    return false;
  }

  if (key === 'isExpired') {
    const today = formatDate(new Date(), 'yyyy-MM-dd') ?? '';
    checkWhen = [today];
    fieldOperator = 'lower';
  }

  if (fieldOperator === 'isNotLoggedInUser') {
    checkWhen = [user];
    fieldOperator = 'not';
  }

  if (fieldOperator === 'isLoggedInUser') {
    checkWhen = [user];
    fieldOperator = 'equalsOrNull';
  }

  const value = values[key];
  return isValueCorrect(value, checkWhen, fieldOperator, defaultValue);
};

const checkEqualStates = (operator: string, fields: AnyType, values: AnyType) => {
  const fieldValues = fields.map((field: AnyType) => values[field.key]);
  const result = fieldValues.every((v) => deepEqual(v, fieldValues[0]));

  return operator === 'equalStates' ? result : !result;
};

const checkFieldCondition = (
  field: AnyType,
  { id, state, user, values }: { id: string; state: AnyType; user: string; values: AnyType },
) => {
  const {
    key,
    checkWhen,
    checkWhenSource,
    operator: fieldOperator = 'equals',
    defaultValue,
  } = field;

  const { value } = checkWhenSource
    ? resolveSourceData(
        id,
        { state, routeParams: {}, routerData: {} },
        { key: 'KEY', source: checkWhenSource },
      )
    : { value: undefined };

  return checkIfValueCorrect(
    key,
    fieldOperator,
    value && checkWhenSource ? [value] : checkWhen,
    user,
    values,
    defaultValue,
  );
};

export const computeCheck = ({ operator = 'every', fields, values, state, user, id }: AnyType) => {
  if (!fields?.length) {
    return false;
  }

  if (operator === 'equalStates' || operator === 'notEqualStates') {
    return checkEqualStates(operator, fields, values);
  }

  const reverseLogic = operator === 'none';
  const result = fields[reverseLogic ? 'some' : operator]((field: AnyType) =>
    checkFieldCondition(field, { id, state, user, values }),
  );

  return reverseLogic ? !result : result;
};

export const resolveSourceData = (
  widgetId: string,
  input,
  inputSource: AnyType,
  returnFalsyValues?: boolean,
  resourceData?: AnyType,
) => {
  const { state = {}, routeParams, routerData } = input;

  const source: DataSourceSchema = inputSource?.source || {};
  const { code: sourceCode, type: sourceType, operator, calculationOutputIfEmpty } = source;

  if (sourceType === 'WIDGET_PATH') {
    return { value: `${getJsonPathFromWidgetId(widgetId).join('.')}`, apply: true };
  }

  if (sourceType === 'ROUTER' && sourceCode) {
    const value = routeParams[sourceCode]
      ? routeParams[sourceCode]?.replace(/%2F/gi, '/')
      : getLocalStorageData('CURRENT_ITEM_ID');

    return { value: getValue(operator, value, calculationOutputIfEmpty), apply: true };
  }

  if (sourceType === 'ROUTER_DATA' && sourceCode) {
    const value = getContextValue(
      widgetId,
      routerData || getLocalStorageData(NAVIGATION_STATE_KEY),
      source,
    );
    return { value, apply: true };
  }

  if (sourceType === 'ROUTER_QUERY' && sourceCode) {
    // @ts-ignore
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    return { value: query.get(sourceCode), apply: true };
  }
  const hardCodedValue = inputSource?.defaultValue;
  if (inputSource?.defaultValue) {
    return {
      value:
        hardCodedValue === '__TODAY__' ? new Date().toISOString().split('T')[0] : hardCodedValue,
      apply: true,
    };
  }

  const finalSource = getFinalSource(state, source, widgetId);
  const data =
    resourceData && !finalSource?.type
      ? resourceData
      : getStoreSlice(state, getFinalSourceCode(finalSource, widgetId), finalSource?.type);

  const keyValue = getContextValue(
    source?.type === 'NODE' ? '' : resourceData?.__JSON_PATH__ || widgetId,
    data,
    finalSource,
  );

  let finalValue: AnyType;

  const { relatedObject, relatedCodeList } = finalSource || {};
  if (relatedObject || relatedCodeList) {
    finalValue = getProperty(widgetId, input, finalSource, keyValue);
  } else {
    finalValue = keyValue;
  }

  const valueType = inputSource?.type;

  const shouldApplyValue =
    (keyValue && (!valueType || (valueType && hasValidValue(valueType, keyValue)))) ||
    returnFalsyValues;

  return {
    value: getValue(operator, finalValue, calculationOutputIfEmpty),
    apply: shouldApplyValue,
  };
};

export const resolveData = (
  widgetId: string,
  input: {
    state: AnyType;
    routeParams: AnyType;
    routerData: AnyType;
    user?: string;
    dateFormat?: string;
  },
  sources?: Array<FieldConditionSchema>,
  returnFalsyValues?: boolean,
  resourceData?: AnyType,
) => {
  const finalValue = {};

  if (!sources || !sources?.length) {
    return finalValue;
  }

  sources?.forEach((source) => {
    const { applyWhen, jsonPath } = source;

    const applyOnCondition = applyWhen ? shouldBeApplied(applyWhen, widgetId, input) : true;

    const { value, apply } = resolveSourceData(
      widgetId,
      input,
      source,
      returnFalsyValues,
      resourceData,
    );
    if (apply && applyOnCondition) {
      if (jsonPath) {
        jp?.value(finalValue, jp.stringify(jsonPath).replace(/"/g, ''), value);
      } else {
        finalValue[source.key] = value;
      }
    }
  });

  return finalValue;
};

export const getQueriesFromUrl = (url: string) => {
  const urlQueriesStr = url?.split('?')[1];
  if (!urlQueriesStr) {
    return {};
  }

  let urlHardCodedQueries = {};
  if (urlQueriesStr) {
    try {
      urlHardCodedQueries = JSON.parse(
        `{"${urlQueriesStr.replace(/&/g, '","').replace(/=/g, '":"')}"}`,
        (key, value) => (key === '' ? value : decodeURIComponent(value)),
      );
    } catch {}
  }

  return urlHardCodedQueries;
};

export const constructApiUrl = (
  apiValues: ApiValuesSchema,
  replacementValues: { [key: string]: AnyType },
): string => {
  let finalApiUrl = apiValues.url;

  (apiValues?.replacements || [])
    .filter((replacement: AnyType) => !!replacementValues[replacement.key])
    .forEach((replacement: AnyType) => {
      if (isArray(replacementValues[replacement.key])) {
        const enumerate = replacement.enumerate;
        const param = replacement.key.replace('{', '').replace('}', '');
        const items = replacementValues[replacement.key].map(
          (item: AnyType, idx) => `${param}${enumerate ? idx + 1 : ''}=${encodeText(item)}`,
        );
        finalApiUrl = finalApiUrl?.replace(`${param}=${replacement.key}`, items.join('&'));
      } else {
        // In case of urlRelation, we are skipping the encoding because there are backslashes in the url
        //do not delete double encoding, issue with special characters
        const replacementValue =
          replacement.key !== '{urlRelation}' &&
          replacement.key !== '{camundaUrl}' &&
          replacement.key !== '{camunda7RuntimeUrl}' &&
          replacement.key !== '{camunda7HistoryUrl}' &&
          replacement.key !== '{tenantId}'
            ? encodeText(replacementValues[replacement.key])
            : replacementValues[replacement.key];

        // This will be replaced after route will be the same as the entityCL
        if (replacement.key === '{entityCL}') {
          finalApiUrl = finalApiUrl?.replace(replacement.key, `/page/${replacementValue}`);
        } else {
          finalApiUrl = finalApiUrl?.replace(replacement.key, replacementValue);
        }
      }
    });

  // replace the last character if it is & or ?
  const lastCharacter = finalApiUrl?.charAt(finalApiUrl?.length - 1);
  if (lastCharacter === '&' || lastCharacter === '?') {
    return finalApiUrl?.slice(0, -1);
  }
  return finalApiUrl;
};

export const shouldBeApplied = (
  from: CheckFromSchema,
  id: string,
  extraData: { user?: string; state: AnyType; routeParams: AnyType; routerData: AnyType },
  row?: AnyType,
) => {
  const { operator = 'every', fields = [] } = from || {};

  const values = resolveData(id, extraData, fields, true, row) || {};

  const reverseLogic = operator === 'none';

  const result = fields[reverseLogic ? 'some' : operator](
    ({ key, checkWhen, operator: fieldOperator = 'equals', defaultValue }: AnyType) => {
      return checkIfValueCorrect(
        key,
        fieldOperator,
        checkWhen,
        extraData?.user || '',
        values,
        defaultValue,
      );
    },
  );

  return reverseLogic ? !result : result;
};
