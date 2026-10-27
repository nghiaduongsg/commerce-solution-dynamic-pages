import { AnyType } from '@pkg-common/types';
import { diff } from 'jsondiffpatch';

const transformDiffToValidations = (tableId: string, delta: AnyType) => {
  const result = {};
  for (const key of Object.keys(delta)) {
    if (delta[key][1] && delta[key][0] !== null) {
      if (key.endsWith('CL') && delta[key + 'Description']) {
        result[`${tableId}_${key}`] = [
          `INFO_PrevValueDiff#{"prev": "${delta[key + 'Description'][0]}"}`,
        ];
      } else {
        result[`${tableId}_${key}`] = [`INFO_PrevValueDiff#{"prev": "${delta[key][0]}"}`];
      }
    } else {
      result[`${tableId}_${key}`] = ['INFO_PrevValueEmpty'];
    }
  }
  return result;
};

const fixJsonArrayInString = (str: string) => {
  let obj: AnyType = [];
  const keys = str.split('.');
  for (const key of keys) {
    if (isNaN(+key)) {
      obj.push(key);
    } else {
      if (typeof obj === 'string') {
        obj = obj.split('');
      }
      obj.push(obj.pop() + `[${key}]`);
    }
  }
  return obj.join('.');
};

const removed: AnyType = [];

const flatten = (obj, prefix: AnyType = [], current = {}) => {
  if (typeof obj === 'object' && obj !== null && !(obj instanceof Array)) {
    for (const key of Object.keys(obj)) {
      if (!key.startsWith('_')) {
        flatten(obj[key], prefix.concat(key), current);
      } else {
        if (!key.startsWith('_t') && obj[key][2] !== 3) {
          removed.push(prefix.concat(key.substring(1)).join('.'));
        }
      }
    }
  } else {
    current[prefix.join('_')] = obj;
  }
  return current;
};

export const compareForms = (formVersion1: string, formVersion2: string, tableId = '') => {
  const clearVersion1 = formVersion1;
  const clearVersion2 = formVersion2;
  const delta = diff(clearVersion1, clearVersion2);

  removed.splice(0);

  const resultArray = Object.keys(flatten(delta));
  const jsonResult: AnyType = [];
  const jsonResultRemoved: AnyType = [];
  for (const str of resultArray) {
    jsonResult.push(fixJsonArrayInString(str));
  }
  for (const str of removed) {
    jsonResultRemoved.push(fixJsonArrayInString(str));
  }
  return {
    diffs: transformDiffToValidations(tableId, flatten(delta)),
    delta,
    jsonResultRemoved,
    jsonResult,
  };
};
