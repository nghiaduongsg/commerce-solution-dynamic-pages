import { BOOLEAN_CODELIST_ATTRIBUTES, VALID_CODE_LIST } from '@pkg-constants/codeListVariables';
import { isArray } from 'lodash';

export const getDisabledValues = (
  list,
  disableOptionWhen,
  ignoreInactive,
  disabledOptions = [],
) => {
  const { key, value: val, type } = disableOptionWhen || {};
  const disableValues = disabledOptions as Array<string>;
  list?.forEach((item) => {
    const inactive = item.attributes?.find((attr) => attr.key === 'inactive')?.value;

    if (item.expired || (inactive === BOOLEAN_CODELIST_ATTRIBUTES.YES && !ignoreInactive)) {
      disableValues.push(item.code);
      return;
    }

    if (type === 'ATTRIBUTE') {
      const attributeValue = item.attributes?.find((attr) => attr.key === key)?.value;
      if (attributeValue === val) {
        disableValues.push(item.code);
      }
    }

    if (key && item.relatedObject && item.relatedObject[key] === val) {
      disableValues.push(item.code);
    }
  });
  return disableValues;
};

const getAttribute = (list, itemCode: string, attribute) => {
  const item = list.find((listItem) => listItem.code === itemCode);
  if (!item) {
    return;
  }

  return (item.attributes || []).filter((attr) => attr.key === attribute).map((attr) => attr.value);
};

export const filterByAnotherCodelist = (list, filterFromList, filterFrom, filterValues) => {
  if (!filterFrom || !filterFrom.source || filterFrom.attribute === VALID_CODE_LIST) {
    return list;
  }

  if (filterFrom && filterFrom.codelist && filterFrom.attribute && !isArray(filterValues)) {
    const attributeValues = getAttribute(filterFromList, filterValues, filterFrom.attribute);

    return list.filter((item) => (attributeValues || []).indexOf(item.code) >= 0);
  }

  if (!filterFrom.attribute) {
    // @ts-ignore
    return list.filter((item) => (filterValues || []).indexOf(item.code) >= 0);
  }

  if (isArray(filterValues)) {
    return list.filter(
      (item) =>
        (filterValues || [])
          .map((filterValue) => filterValue[filterFrom.attribute || ''])
          // @ts-ignore
          .indexOf(item?.code) >= 0,
    );
  }

  return list;
};
