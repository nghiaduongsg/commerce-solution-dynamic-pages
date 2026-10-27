import useCodeList from './useCodeList';
import useMultipleFormData from '@pkg-common/dataResolver/useMultipleFormData';
import { createCodelistKey, getContextValue } from '@pkg-form/validations/utils/widgetUtils';
import { FieldConditionSchema, RelatedSchema } from '@pkg-common/types';
import { useMemo } from 'react';

const useCodeListQuery = (widgetId: string, objConfig: RelatedSchema) => {
  const {
    code,
    replacements = [],
    queryFrom = [],
    // @ts-ignore
    attribute,
    value,
    // @ts-ignore
    performQuery = false,
  } = objConfig || {};
  const replacementValues = useMultipleFormData(widgetId, [
    ...queryFrom,
    ...replacements,
  ] as Array<FieldConditionSchema>);

  const codeList = createCodelistKey(code, {
    ...(replacementValues || {}),
  });

  const { list } = useCodeList(codeList);
  const queryValues = getContextValue(widgetId, list, {
    jsonPath: ['*', 'attributes', `?(@.key=='" ${attribute} "' && @.value=='" ${value}"')`],
    performQuery: true,
  });

  return useMemo(() => {
    return performQuery ? !!queryValues.length : true;
  }, [queryValues, performQuery]);
};

export default useCodeListQuery;
