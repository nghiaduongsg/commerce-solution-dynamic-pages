import jp from 'jsonpath';
import omit from 'lodash/omit';

import { hasValidDate } from '@pkg-form/validations/utils/dateValidationUtils';
import { hasValue } from '@pkg-common/utils/utils';
import { isArray, isObject } from 'lodash';
import { AnyType, DataSourceSchema } from '@pkg-common/types';
import { ValidateFromSchema } from '@pkg-form/types';
import { FILTER_FORM_DEBOUNCE_MS } from '@pkg-constants/formCommon';

export const getFormIdFromWidgetId = (widgetId: string) => {
  return widgetId?.split('_')[0];
};

export const getWidgetNameFromWidgetId = (widgetId: string) => {
  const parts = widgetId?.split('_');
  return parts[parts?.length - 1];
};

export const isValidWidgetId = (text?: string) => {
  if (!text) {
    return false;
  }
  if (text?.indexOf('undefined') >= 0) {
    return false;
  }
  return text.search(/.-\d/) < 0;
};

export const getJsonPathFromWidgetId = (widgetId: string, withBrackets = true) => {
  let id = widgetId;

  const openingBracket = withBrackets ? '[' : '';
  const closingBracket = withBrackets ? ']' : '';

  (widgetId?.match(/\d+/g) || []).forEach((m) => {
    id = id
      .replace(`_${m}_`, `_${openingBracket}${m}${closingBracket}_`)
      .replace(`_${m}`, `_${openingBracket}${m}${closingBracket}`);
  });

  const jsonPath = id.split('_');
  jsonPath.shift();
  return jsonPath;
};

export const getFinalJsonPath = (
  widgetId: string,
  jsonPath: Array<string>,
  markIndexPositions = false,
  reverse = false,
) => {
  const propertyPath = JSON.parse(JSON.stringify(jsonPath));

  if (reverse) {
    const reversedPath = propertyPath.reverse();
    for (let i = reversedPath.length - 1; i >= 0; i--) {
      const item = reversedPath[i];
      if (item === 'INDEX_PARAM') {
        const fieldToFilter = widgetId.split('_').reverse();
        propertyPath[i] = markIndexPositions ? `[${fieldToFilter[i]}]` : fieldToFilter[i];
      }
    }
    return propertyPath.reverse();
  } else {
    jsonPath.forEach((item, index) => {
      /**
       * INDEX_PARAM will exist only in the case of array items. We need to replace it with the index of the specific item.
       * The widgetId is for example Parties_identifiers_1_identifierTypeCL and matches the json path of the property.
       * After splitting the widgetId we get the following array: ['Parties', 'identifiers', '1', 'identifierTypeCL'].
       * The jsonPath coming from the uiSchema would be the following: ['identifiers', 'INDEX_PARAM', 'identifierTypeCL']
       * and matches the widgetId with the exception of the prefix and the specific index
       */
      if (item === 'INDEX_PARAM') {
        const fieldToFilter = widgetId.split('_');
        propertyPath[index] = markIndexPositions
          ? `[${fieldToFilter[index + 1]}]`
          : fieldToFilter[index + 1];
      }
    });

    return propertyPath;
  }
};

export const getJsonPathStringFromJsonPath = (widgetId: string, jsonPath: Array<string>) => {
  return getFinalJsonPath(widgetId, jsonPath, true).reduce((accumulator, currentValue) => {
    if (currentValue.startsWith('[')) {
      return accumulator.concat(currentValue);
    } else {
      return accumulator.concat('.', currentValue);
    }
  });
};

export const getWidgetIdFromJsonPath = (formId, widgetId, jsonPath: Array<string>) => {
  const finalJsonPath = getFinalJsonPath(widgetId, jsonPath, true);
  return `${formId}_${finalJsonPath
    .join('_')
    .replaceAll('[', '')
    .replaceAll('].', '')
    .replaceAll(']', '')}`;
};

export const getWidgetArrayPosition = (fieldId: string) => {
  if (typeof fieldId !== 'string') {
    return false;
  }

  const idParts = fieldId.split('_');

  return idParts.find((part) => {
    try {
      parseInt(part, 10);
      return !Number.isNaN(parseInt(part, 10));
    } catch {
      return false;
    }
  });
};

export const getWidgetImmediateParentId = (fieldId: string) => {
  const parts = fieldId.split('_');
  parts.pop();
  return parts.join('_');
};

export const getWidgetArrayParentId = (fieldId: string) => {
  return fieldId.split(`_${getWidgetArrayPosition(fieldId)}_`)[0];
};

export const getWidgetPropertyId = (fieldId: string) => {
  return fieldId.split(`_${getWidgetArrayPosition(fieldId)}_`)[1];
};

export const getObjectFromJsonQueryPath = (parts: Array<string>, value: AnyType) => {
  let finalValue: AnyType;
  if (typeof value === 'string') {
    finalValue = `"${value}"`;
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    finalValue = value;
  } else if (isObject(value) || isArray(value)) {
    finalValue = JSON.stringify(value);
  }

  const convert = (current, next, index: number) => {
    if (current === '[') {
      return null;
    }
    return `"${current}":${index === parts.length - 1 ? '' : next === '[' ? '[{' : '{'}`;
  };

  const opening = parts
    .map((p, index) => convert(p, parts[index + 1], index))
    .filter((p) => !!p)
    .join('');

  const closing = [...parts]
    .reverse()
    .map((p) => (p === '[' ? ']' : '}'))
    .join('')
    .replace(/.$/, '');

  return JSON.parse(`{${opening}${finalValue}${closing}}`);
};

export const createCodelistKey = (code: string, queries: AnyType) => {
  let key = code;
  if (queries && typeof queries === 'object' && Object.keys(queries).length) {
    key = `${key}|${JSON.stringify(queries)}`;
  }
  return key;
};

export const getContextValue = (
  widgetId: string,
  formData,
  source: Partial<DataSourceSchema>,
): AnyType => {
  const jpFunction = source?.performQuery ? 'query' : 'value';
  const jsonPath = !widgetId
    ? source?.jsonPath ?? []
    : getFinalJsonPath(widgetId, source?.jsonPath ?? [], false, source?.reverse);

  const operator = source?.operator;

  const finalFormData =
    source?.transformToArray && !Array.isArray(formData) ? [formData] : formData;

  try {
    const value = jp[jpFunction](finalFormData, jp.stringify(jsonPath).replace(/"/g, ''));
    if (operator === 'keys' && hasValue(value)) {
      return Object.entries(value)
        .filter((entry) => entry[1])
        .map((entry) => entry[0]);
    }
    return value;
  } catch {
    return source?.performQuery ? [] : undefined;
  }
};

export const setFieldValue = (widgetId: string, formData, value) => {
  if (formData && hasValue(value)) {
    const data = JSON.parse(JSON.stringify(formData));
    try {
      jp.value(
        data,
        jp.stringify(getJsonPathFromWidgetId(widgetId, false)).replace(/"/g, ''),
        value,
      );
      return data;
    } catch {
      // Failed to apply value to form data property
      return formData;
    }
  }
  return formData;
};

export const deleteObjProp = (widgetId, formData, jsonPath) => {
  if (formData && jsonPath && jsonPath.length) {
    const data = JSON.parse(JSON.stringify(formData));
    try {
      return omit(data, getJsonPathStringFromJsonPath(widgetId, jsonPath));
    } catch {
      // Failed to delete property from form data
      return formData;
    }
  }
  return formData;
};

export const hasValidValue = (type: string, value: AnyType, returnFalsyValues = false) => {
  if (type === 'date') {
    return hasValidDate(value);
  }

  return !(!hasValue(value) && !returnFalsyValues);
};

export const getTranslationParts = (text: AnyType) => {
  if (text.indexOf('#') < 0 && !isArray(text)) {
    return { msg: text };
  }

  const finalText = isArray(text) ? text[0] : text;
  const parts = finalText.split('#');

  try {
    return {
      msg: parts[0],
      options: JSON.parse(parts[1]),
    };
  } catch {
    return {
      msg: parts[0],
      options: {},
    };
  }
};

export function compareValues(valuesRef, values, propertyNumberEquality = false) {
  return propertyNumberEquality
    ? valuesRef !== values &&
        Object.keys(JSON.parse(valuesRef)).length === Object.keys(JSON.parse(values)).length
    : valuesRef !== values;
}

export const extractKeyArrayFromErrors = (errorsArray, separator, elementPosition) => {
  const keysWithErrors = Object.keys(errorsArray || {}).filter(
    (key) => errorsArray[key] && errorsArray[key].length > 0,
  );

  const tabKeys = keysWithErrors.map((item) =>
    item.split(separator)[elementPosition]?.toLowerCase(),
  );

  return [...new Set(tabKeys)];
};

export const isParent = (childId: string, parentId: string) => {
  if (childId === parentId) {
    return true;
  }
  const startsWith = childId.startsWith(parentId);
  if (!startsWith) {
    return false;
  }

  try {
    const parts = childId.split(parentId);
    return parts?.length >= 2 && (parts[1][0] === '' || parts[1][0] === '_' || parts[1][0] === '#');
  } catch {
    return startsWith;
  }
};

export const getAccessibilityErrorProps = (id: string, invalid: boolean) => {
  if (invalid) {
    return {
      'aria-invalid': true,
      'aria-errormessage': `${id}-error-container`,
    };
  }
  return {
    'aria-invalid': false,
  };
};

export const getAccessibilityInfoId = (id: string) => {
  return `${id}-info-tooltip`;
};

export const getFinalValidateFromStructure = (
  validateFrom: ValidateFromSchema | Array<ValidateFromSchema> | undefined,
) => {
  return Array.isArray(validateFrom) ? validateFrom : validateFrom ? [validateFrom] : [];
};

const SIZE_MAP: Record<string, { width?: string; minWidth?: string; maxWidth?: string }> = {
  xs: { width: '50%' },
  sm: { width: '70%' },
  md: { minWidth: '267px', width: 'fit-content', maxWidth: '100%' },
  lg: { minWidth: '500px', width: 'fit-content', maxWidth: '100%' },
  xl: { minWidth: '550px', width: 'fit-content', maxWidth: '100%' },
  fullWidth: { width: '100%' },
};

export const getWidgetSize = (
  widthSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  fullWidth?: boolean,
): (typeof SIZE_MAP)[string] => {
  const key: string = fullWidth ? 'fullWidth' : widthSize ?? 'md';
  return SIZE_MAP[key];
};

export const getDebounceDelay = (filterMode: boolean, multiline = false): number => {
  if (filterMode) return FILTER_FORM_DEBOUNCE_MS;
  if (multiline) return 200;
  return 600;
};
