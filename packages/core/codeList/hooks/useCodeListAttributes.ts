import { useCallback } from 'react';

import useCodeList from './useCodeList';
import { AnyType } from '@pkg-common/types';

const useCodeListAttributes = (code: string) => {
  const { list } = useCodeList(code);

  return {
    getItem: (itemCode: string) => {
      return list.find((item) => item.code === itemCode);
    },
    getItemByAttribute: (attributeCode: string, attributeValue: AnyType) => {
      return list.find((item) => {
        const attributes = item.attributes || [];
        const attribute = attributes.find(
          (attr) => attr.key === attributeCode && attr.value === attributeValue,
        );
        return !!attribute;
      });
    },
    getAllItemsByAttribute: useCallback(
      (attributeCode: string, attributeValues: Array<string>) => {
        return list.filter((item) => {
          const attributes = item.attributes || [];
          const attribute = attributes.find(
            (attr) => attr.key === attributeCode && attributeValues.indexOf(attr.value) >= 0,
          );
          return !!attribute;
        });
      },
      [list],
    ),
    getAttribute: useCallback(
      (itemCode: string, attribute) => {
        const item = list.find((listItem) => listItem.code === itemCode);
        if (!item) {
          return;
        }

        return (item.attributes || [])
          .filter((attr) => attr.key === attribute)
          .map((attr) => attr.value);
      },
      [list],
    ),
  };
};

export default useCodeListAttributes;
