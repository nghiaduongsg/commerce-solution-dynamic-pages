import { hasValue, jpValueFirstLevel, urlHasAllParams } from '@pkg-common/utils/utils';
import { isObject } from 'lodash';
import { AnyType } from '@pkg-common/types';
import { INVALID_REDIRECT_IDS } from '@pkg-constants/formCommon';
import jp from 'jsonpath';

export const getFieldLabel = (
  value,
  isFlat: boolean,
  fields: Array<string>,
  excludeFromLabel: Array<string> = [],
  idKey: string,
) => {
  if (!hasValue(value)) {
    return undefined;
  }

  if (isFlat) {
    return value;
  }

  return (
    fields
      ?.filter((field) => excludeFromLabel.indexOf(field) < 0)
      ?.map((field) => value[getProperty(field)] ?? '')
      .filter((field) => !!field)
      .join(' - ') || value?.[idKey]
  );
};

export const getFieldValue = (
  isFlat: boolean,
  entity: AnyType,
  entityIdKey: string,
  entityFields?: Array<string>,
  idKeyAs?: string | undefined,
  fieldKeyAs?: string | undefined,
) => {
  if (isFlat) {
    return jpValueFirstLevel(entity, entityIdKey);
  }

  const keyName = idKeyAs || getProperty(entityIdKey);
  const fieldValue = { [keyName]: jpValueFirstLevel(entity, entityIdKey) };

  entityFields?.forEach((field) => {
    const property = getProperty(fieldKeyAs || field);
    fieldValue[property] = resolveValueFromPath(field, entity);
  });
  return fieldValue;
};

export const getRawValue = (isFlat, value, entityIdKey) => {
  if (isFlat) {
    return value;
  }

  return value ? jpValueFirstLevel(value, entityIdKey) : '';
};

export const getLinkRoute = (id, entitySource, redirectUrl, value) => {
  const url = entitySource ? `/page/${id}` : redirectUrl;

  if (!url || !hasValue(value) || !urlHasAllParams(url) || INVALID_REDIRECT_IDS.includes(id)) {
    return undefined;
  }

  return {
    url: `${url}/${value}`,
    replacements: [],
  };
};

// TODO: Check if this function is necessary. It is possible that the "hasValue" function coming from the common
// utilities can cover this case as well. So this function can possibly be removed.
export const widgetHasValue = (selectedValue, isFlat, entityIdKey, multiple) => {
  if (isObject(selectedValue) && Object.keys(selectedValue).every((k) => !selectedValue[k])) {
    return false;
  }

  if (!selectedValue) {
    return false;
  }

  if (isFlat) {
    return !!selectedValue;
  }

  if (!selectedValue[entityIdKey] && !multiple) {
    return false;
  }

  if (!selectedValue.length && multiple) {
    return false;
  }

  return true;
};

const resolveValueFromPath = (propertyPath: string, entity) => {
  try {
    return jp.value(entity, propertyPath);
  } catch (error) {
    return '';
  }
};

const getProperty = (propertyPath: string) => {
  const parts = propertyPath.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : parts[0];
};
