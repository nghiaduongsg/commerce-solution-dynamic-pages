import {
  isObject as isTypeObject,
  isNumber,
  isEmpty,
  isFunction,
  isString,
  isBoolean,
} from 'lodash';

import { AnyType } from '@pkg-common/types';
import { DynamicFormGroup } from '@pkg-form/types';
import { parse } from 'date-fns';
import jp from 'jsonpath';
import { constructApiUrl } from '@pkg-common/dataResolver/utils';

export const formatMessage = (
  message: AnyType,
  parameters: AnyType,
  translateFn: AnyType,
  selectedLanguage: string,
  namespace?: string | Array<string>,
) => {
  const placeholderRegex = /{([^{}]+)}/g;
  const paramsString = parameters.replace(/'/g, '"'); // eslint-disable-line
  const paramsObj = JSON.parse(paramsString);
  const params = paramsObj.parameters;

  const translatedMessage = translateFn
    ? translateFn(message, { lng: selectedLanguage, ns: namespace })
    : message;
  return translatedMessage.replace(
    placeholderRegex,
    (_: AnyType, index: AnyType) => params[index] || '',
  );
};

export const compareList = (list1: AnyType[], list2: AnyType[]): boolean => {
  const shortestLength = Math.min(list1.length, list2.length);

  for (let i = 0; i < shortestLength; i++) {
    if (!compareNested(list1[i], list2[i])) {
      return false;
    }
  }

  return true;
};

export const compareNestedObjects = (
  entityNestedObject: AnyType,
  formNestedObject: AnyType,
): boolean => {
  if (typeof entityNestedObject !== 'object' || typeof formNestedObject !== 'object') {
    return entityNestedObject === formNestedObject;
  }

  if (Array.isArray(entityNestedObject) && Array.isArray(formNestedObject)) {
    return compareList(entityNestedObject, formNestedObject);
  }

  if (isObjectWithList(entityNestedObject, formNestedObject)) {
    const list1 = entityNestedObject.list || [];
    const list2 = formNestedObject.list || [];
    return compareList(list1, list2);
  }

  return compareNested(entityNestedObject, formNestedObject);
};

export const isObjectWithList = (
  entityNestedObject: AnyType,
  formNestedObject: AnyType,
): boolean => {
  return (
    Array.isArray(entityNestedObject) &&
    Array.isArray(formNestedObject) &&
    Object.prototype.hasOwnProperty.call(entityNestedObject, 'list') &&
    Object.prototype.hasOwnProperty.call(formNestedObject, 'list')
  );
};

export const compareNested = (entityNestedObject: AnyType, formNestedObject: AnyType): boolean => {
  if (typeof entityNestedObject !== 'object' || typeof formNestedObject !== 'object') {
    return entityNestedObject === formNestedObject;
  }

  if (Array.isArray(entityNestedObject) && Array.isArray(formNestedObject)) {
    return compareList(entityNestedObject, formNestedObject);
  }

  const entity1Keys = entityNestedObject ? Object.keys(entityNestedObject) : [];
  const entity2Keys = formNestedObject ? Object.keys(formNestedObject) : [];

  if (entity1Keys.length !== entity2Keys.length) {
    return false;
  }

  for (const key of entity1Keys) {
    if (!Object.prototype.hasOwnProperty.call(formNestedObject, key)) {
      return false;
    }

    if (!compareNestedObjects(entityNestedObject[key], formNestedObject[key])) {
      return false;
    }
  }

  return true;
};

export const isEqualRecursive = (entityValue: AnyType, formValue: AnyType): boolean => {
  if (typeof entityValue !== typeof formValue) {
    return false;
  }

  if (typeof entityValue !== 'object' || entityValue === null || formValue === null) {
    return entityValue === formValue;
  }

  if (Array.isArray(entityValue) !== Array.isArray(formValue)) {
    return false;
  }

  if (Array.isArray(entityValue) && Array.isArray(formValue)) {
    if (entityValue.length !== formValue.length) {
      return false;
    }

    for (let i = 0; i < entityValue.length; i++) {
      if (!isEqualRecursive(entityValue[i], formValue[i])) {
        return false;
      }
    }

    return true;
  }

  const keys1 = Object.keys(entityValue);
  const keys2 = Object.keys(formValue);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const hasKey = Object.prototype.hasOwnProperty.call(formValue, key);
    const val1 = entityValue[key];
    const val2 = formValue[key];

    if (!hasKey || !isEqualRecursive(val1, val2)) {
      return false;
    }
  }

  return true;
};

export const procStringToObj = (json: string) => {
  try {
    return json ? JSON.parse(json) : null;
  } catch (e) {
    return null;
  }
};

export const getDynamicQueryCode = (url: string) => {
  return (url || '').indexOf('query-management/queries/') >= 0;
};

export const isJSON = (text: AnyType) => {
  try {
    if (
      !isString(text) ||
      'number' === typeof text ||
      'boolean' === typeof text ||
      Array.isArray(text)
    ) {
      return false;
    }

    const parsed = JSON.parse(text);

    if (parsed && typeof parsed === 'object') {
      return parsed;
    }

    return false;
  } catch (error) {
    return false;
  }
};

export const objectHasValues = (obj: { [key: string]: AnyType }) => {
  return Object.values(obj).filter((v) => v && v.length > 0).length > 0;
};

export function sortArrayWithArray(
  target: Array<Record<string, AnyType>>,
  source: Array<Record<string, AnyType>>,
  targetKey: string,
  sourceKey: string,
) {
  try {
    if (!target || !target.length || !source || !source.length || !targetKey || !sourceKey) {
      throw new Error();
    }
    return source.map((i) => i[targetKey]).map((i) => target.find((j) => j[sourceKey] === i));
  } catch (error) {
    // Could not sort Target!, falling back to original
    return target;
  }
}

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

export const urlHasAllParams = (url: string) => url?.indexOf('{') < 0;

export const isExternal = (url: string) => url?.indexOf('http') >= 0;

export const jpValueFirstLevel = (data: AnyType, path: string) => {
  try {
    return jp.value(data, path);
  } catch {
    return data[path];
  }
};

export const arrayToMap = (array: Array<AnyType>, codeProperty: string) => {
  const mapObj: AnyType = {};

  array?.forEach((item: AnyType) => {
    mapObj[jpValueFirstLevel(item, codeProperty)] = item;
  });
  return mapObj;
};

export const equalityCheck = (left, right) => {
  if (isNumber(left) || isNumber(right)) {
    return left === right;
  }
  if (isString(left) || isString(right)) {
    return left === right;
  }
  if (isBoolean(left) || isBoolean(right)) {
    return left === right;
  }
  return JSON.stringify(left || {}) === JSON.stringify(right || {});
};

var isShift = false;
var isAlt = false;
var isControl = false;

const keys = {
  a: 'add-btn',
  l: 'load-btn',
  c: 'column-select-btn',
  f: 'filter-btn',
  k: 'filters-clear-btn',
  v: 'menu',
  enter: 'filters-apply-btn',
  s: 'form-btn',
  arrowleft: 'previous-page-btn',
  arrowright: 'next-page-btn',
  arrowup: 'last-page-btn',
  arrowdown: 'first-page-btn',
};

const secondaryKeys = {
  v: 'edit_list_item-btn',
  r: 'delete_list_item-btn',
  z: 'duplicate_list_item-btn',
  j: 'edit_list_item-btn',
};

const clickElementById = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.click();
  }
};

const keyboardCallback = (event) => {
  const key = event.key;

  if (!isShift) {
    isShift = event.shiftKey;
  }
  if (!isAlt) {
    isAlt = event.altKey;
  }
  if (!isControl) {
    isControl = event.ctrlKey;
  }

  if (event.key === 'Escape') {
    clickElementById(`${window['LIST']}-column-selector-close-btn`);
    clickElementById(`${window['LIST']}-filter-close-btn`);
    clickElementById(`quickView-close-btn`);
    clickElementById('close-info-panel-btn');
    return;
  }

  if (isShift && isAlt) {
    isShift = false;
    isAlt = false;
    switch (key) {
      case 'a':
      case 'A':
      case 'l':
      case 'L':
      case 'c':
      case 'C':
      case 'f':
      case 'F':
      case 'k':
      case 'K':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
      case 'Enter':
        clickElementById(`${window['LIST']}-${keys[key.toLowerCase()]}`);
        break;
      case 'z':
      case 'Z':
      case 'r':
      case 'R':
      case 'v':
      case 'V':
        clickElementById(`${window['LIST']}-${window['ROW']}-${secondaryKeys[key.toLowerCase()]}`);
        break;
      case 'j':
      case 'J':
        const url = document.getElementById(
          `${window['LIST']}-${window['ROW']}-${secondaryKeys[key.toLowerCase()]}`,
        )?.baseURI;
        if (url?.includes('list')) {
          window.open(`${url.slice(0, -4)}${window['ROW']}`);
        }
        break;
      case 'b':
      case 'B':
        clickElementById('menu-action-profile-menu-IRM-SETTINGS');
        break;
      case 'g':
      case 'G':
        clickElementById('menu-action-profile-menu-IRM-HELP');
        break;
    }
  }

  if (isControl && isAlt) {
    isShift = false;
    isAlt = false;
    isControl = false;
    switch (key) {
      case 's':
      case 'S':
        clickElementById(`${window['FORM']}-${keys[key.toLowerCase()]}`);
        break;
      case 'Backspace':
        clickElementById('back-btn');
        break;
    }
  }
};

export const registerKeyboardShortcuts = (applyShortcuts: boolean) => {
  if (!applyShortcuts) {
    document.removeEventListener('keydown', keyboardCallback, false);
  } else {
    document.addEventListener('keydown', keyboardCallback, false);
  }
};

export const isActionAllowed = (
  code: string = '',
  allowedCodes: Array<string>,
  allSymbol: string,
) => {
  if (!code) {
    return true;
  }
  const allowAll = allowedCodes?.find((action) => action === allSymbol);
  if (allowAll) {
    return true;
  }
  return allowedCodes?.find((action) => action === code);
};

export const isActionAllowedBasedOnSecurableObjects = (
  replacementValues: { [key: string]: AnyType },
  permissionKey: AnyType,
  securableObjects: { [_: string]: boolean },
  applyPermissions: boolean,
) => {
  // TODO: this is the permission for all the default array items (tree and card) to always be enabled.
  // We need to find a more proper solution here for this otherwise we need to add all the actions
  // (EDIT, DELETE, DUPLICATE, etc) in all schemas in all entities using arrays in order to define
  // specific permissions for all items.
  if (permissionKey === 'defaultItemActions') {
    return true;
  }

  if (!applyPermissions) {
    return true;
  }

  let finalPermissionKey = permissionKey;

  if (hasValue(replacementValues)) {
    finalPermissionKey = constructApiUrl(permissionKey, replacementValues);
  }

  if (!finalPermissionKey) {
    return true;
  }

  return !!securableObjects[finalPermissionKey];
};

export const focusElement = (id: string) => {
  const timeout = setTimeout(() => {
    const element = document.getElementById(id);
    if (element) {
      element.focus();
    }
    clearTimeout(timeout);
  });
};

export const escapeOnlyQlFormulaSpan = (html?: string) => {
  if (!html) return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const spans = doc.querySelectorAll('span.ql-formula');

  spans.forEach((span) => {
    const escaped = span.outerHTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const p = doc.createElement('p');
    p.innerHTML = escaped;

    span.replaceWith(p);
  });

  return doc.body.innerHTML;
};
export const getTabKeys = (tab: DynamicFormGroup): string => {
  const groupKeys = tab.groups?.flatMap((group) => group.key.toLowerCase()) ?? [];
  return [tab.key.toLowerCase(), ...groupKeys].join('_');
};

export const hasErrorsInsideTab = (tabKeys: string, tabKeysWithErrors: string[]): boolean => {
  return tabKeysWithErrors.some((errorKey) => {
    return tabKeys.includes(errorKey.toLowerCase());
  });
};

export const parseDate = (value?: string | Date | null): Date | undefined => {
  if (!value) {
    return undefined;
  }

  return typeof value === 'string' ? parse(value, 'yyyy-MM-dd', new Date()) : value;
};

const DATE = /\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])/;
const TIME = /(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?/;
const TIMEZONE_HOUR = /(?:Z|-0[1-9]|-1\d|-2[0-3]|-00:?(?:0[1-9]|[1-5]\d)|\+[01]\d|\+2[0-3])?/;
const TIMEZONE_MINUTE = /(?::?[0-5]\d)?/;

export const ISO_DATETIME_REGEX = new RegExp(
  `^${DATE.source}T${TIME.source}${TIMEZONE_HOUR.source}${TIMEZONE_MINUTE.source}$`,
);
