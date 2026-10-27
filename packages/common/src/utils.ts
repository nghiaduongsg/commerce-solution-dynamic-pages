import React from 'react';
import { AnyType } from './types';
import { isObject as isTypeObject, isNumber, isEmpty, isFunction, isNull } from 'lodash';
import { format, isDate, isValid } from 'date-fns';

export const joinWith = (strings: Array<string | undefined | null>, separator = '_') => {
  return (strings || []).filter((item) => !!item).join(separator);
};

export const truncateDecimalPlaces = (numValue, numDecimalPlaces) => {
  try {
    const regex = new RegExp(`^-?\\d+(?:\\.\\d{0,${numDecimalPlaces}})?`, 'i');
    return numValue?.toString().match(regex)[0];
  } catch {
    return numValue;
  }
};

export const replaceInObjectRegex = <T>(obj: T, from: string, to: string): T => {
  try {
    const regex = new RegExp(`"${from}"`, 'g');
    const json = JSON.stringify(obj);
    const replaced = json.replace(regex, `"${to}"`);
    return JSON.parse(replaced);
  } catch {
    return obj;
  }
};

export const enumeratedOptions = (values, namespace, selectedLanguage, translate) => {
  const enums = values?.enum || [];
  const enumNames = values?.enumNames?.length ? values.enumNames : enums;

  return enumNames?.map((name: string, index: number) => ({
    code: enums?.[index].toString(),
    label: translate(name || '', { ns: namespace, lng: selectedLanguage }),
  }));
};

export const hasValue = (v: AnyType) => {
  if (isTypeObject(v)) {
    return isFunction(v) || !isEmpty(v);
  }

  if (isNumber(v)) {
    return true;
  }

  if (v === false) {
    return true;
  }

  return !!v;
};

export const hasCorrectValue = (
  left?: Array<string | boolean | number | null>,
  right?: string | boolean | number | null | Array<string | boolean | number | null>,
) => {
  if (!hasValue(left) || !(hasValue(right) || isNull(right))) {
    return false;
  }

  if (Array.isArray(right)) {
    return right.some((r) => left?.includes(r));
  }

  return left?.includes(right!);
};

export const hasValidDate = (value: string) => {
  if (value && !isValid(new Date(value))) {
    return false;
  }
  return true;
};

export const formatDate = (date: Date | null, dateFormat = 'dd/MM/yyyy') => {
  if (isDate(date) && isValid(date)) {
    return format(date as Date, dateFormat);
  }

  return date?.toString();
};

export const getFormIdFromWidgetId = (widgetId: string) => {
  return widgetId?.split('_')[0];
};

export const createResourceKey = (code: string, queries: AnyType) => {
  let key = code;
  if (queries && typeof queries === 'object' && Object.keys(queries).length) {
    key = `${key}|${JSON.stringify(queries)}`;
  }
  return key;
};

export const createCodelistKey = (code: string, queries: AnyType) => {
  let key = code;
  if (queries && typeof queries === 'object' && Object.keys(queries).length) {
    key = `${key}|${JSON.stringify(queries)}`;
  }
  return key;
};

export const encodeText = (txt: string) => {
  const str = txt?.toString();
  if (str?.indexOf('/') >= 0 || str?.indexOf('&') >= 0) {
    return encodeURIComponent(encodeURIComponent(txt));
  }

  return encodeURIComponent(txt);
};

const objectToString = (item: AnyType) => {
  return Object.values(item)
    .map((value) => {
      if (typeof value === 'object' && value !== null) {
        return objectToString(value);
      }
      return value?.toString().toLowerCase();
    })
    .join(' ');
};

export const filterItems = (items: Array<AnyType> = [], searchKey: string, keepAll = false) => {
  if (keepAll) {
    return items?.map((item, index) => {
      return {
        ...item,
        __INDEX__: item?.__INDEX__ ?? index,
        __HIDDEN__: objectToString(item).indexOf(searchKey?.toLowerCase()) === -1,
      };
    });
  }
  return items
    ?.map((item, index) => ({ ...item, __INDEX__: item?.__INDEX__ ?? index }))
    ?.filter((item) => {
      return objectToString(item).indexOf(searchKey?.toLowerCase()) !== -1;
    });
};

export const isExpired = (endDate?: string) => {
  if (!endDate) return false;
  const today = formatDate(new Date(), 'yyyy-MM-dd') ?? '';
  return endDate < today;
};

export const focusTrap = (e: React.KeyboardEvent<HTMLDivElement>) => {
  if (e.key === 'Tab') {
    const drawer = e.currentTarget;
    const focusableElements = drawer.querySelectorAll(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length > 0) {
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const activeElement = document.activeElement as HTMLElement;

      if (!e.shiftKey && activeElement === lastElement) {
        e.preventDefault();
        return firstElement.focus();
      } else if (e.shiftKey && activeElement === firstElement) {
        e.preventDefault();
        return lastElement.focus();
      }
    }
  }
};

export const appendQueryParams = (baseUrl: string, params: Record<string, AnyType>) => {
  const [path, qs] = baseUrl.split('?');
  const sp = new URLSearchParams(qs || '');
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    sp.set(k, String(v));
  });
  const q = sp.toString();
  return q ? `${path}?${q}` : path;
};

export const getQueryParamFromUrl = (url: string, param: string): string | null => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get(param);
  } catch (e) {
    const searchParams = new URLSearchParams(url.split('?').slice(1).join('?'));
    return searchParams.get(param);
  }
};

export const disableSidePanelMainButton = (uiSchema: Record<string, unknown> | undefined) => {
  if (!uiSchema) {
    return uiSchema;
  }
  return {
    ...uiSchema,
    'ui:mainButton': {
      ...(uiSchema['ui:mainButton'] || {}),
      enabled: false,
    },
  };
};

export const humanizeKey = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_\-\d[\]]/g, ' ')
    .replace(/^\s*\d+\s*/, '')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};
