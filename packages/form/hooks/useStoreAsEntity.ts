import { useEffect, useMemo } from 'react';
import useEntity from '@pkg-entity/hooks/useEntity';
import useFormData from '@pkg-common/dataResolver/useFormData';
import { SortSource } from '@pkg-form/types';
import { jpValueFirstLevel, sortArrayWithArray } from '@pkg-common/utils/utils';
import { AnyType } from '@pkg-common/types';

const useStoreAsEntity = (
  _widgetId: string,
  value: AnyType,
  list: Array<AnyType>,
  storeAsEntity?: {
    code: string;
    entityIdKey?: string;
    sort?: SortSource;
  },
) => {
  const { code, entityIdKey = 'code', sort } = storeAsEntity || {};

  const { setEntity, entity, clearEntity } = useEntity(code);
  const { value: sortFromValue } = useFormData(sort?.source?.code || '', sort?.source);

  const shouldLoadEntity = useMemo(() => {
    return code && value !== jpValueFirstLevel(entity || {}, entityIdKey) && (list || []).length;
  }, [code, value, entity, entityIdKey, list]);

  const shouldClearEntity = useMemo(() => {
    return (
      (code && jpValueFirstLevel(entity || {}, entityIdKey) && !value) ||
      (code && !jpValueFirstLevel(entity || {}, entityIdKey) && value)
    );
  }, [code, value, entity, entityIdKey, list]);

  useEffect(() => {
    if (shouldClearEntity) {
      clearEntity();
    }
  }, [shouldClearEntity]);

  useEffect(() => {
    if (shouldLoadEntity) {
      const listItem = list.find((item) => item.code === value);
      if (listItem) {
        const shouldSort =
          sortFromValue &&
          Array.isArray(sortFromValue) &&
          sort &&
          listItem.relatedObject[sort?.propertyArray] &&
          Array.isArray(listItem.relatedObject[sort?.propertyArray]);

        if (shouldSort && sort && sort.propertyArray) {
          const sortedList = sortArrayWithArray(
            listItem.relatedObject[sort.propertyArray],
            sortFromValue,
            sort?.sourceKey,
            sort?.propertyArrayItemKey,
          ).filter((item) => !!item);

          setEntity(
            {
              ...listItem.relatedObject,
              [sort.propertyArray]: sortedList.length
                ? sortedList
                : listItem.relatedObject[sort.propertyArray],
            },
            { idKey: entityIdKey },
          );
        } else {
          setEntity(listItem.relatedObject || {}, { idKey: entityIdKey });
        }
      }
      if (Array.isArray(value)) {
        const codes = new Set(value.map((v) => jpValueFirstLevel(v, entityIdKey)));
        const selectedItems = list.filter((item) =>
          codes.has(jpValueFirstLevel(item, entityIdKey)),
        );
        setEntity({ selectedItems }, { idKey: entityIdKey });
      }
    }
  }, [value, list, entityIdKey, sortFromValue, sort, setEntity, shouldLoadEntity]);
};

export default useStoreAsEntity;
