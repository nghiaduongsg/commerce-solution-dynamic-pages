import { useMemo } from 'react';

import useFormData from '@pkg-common/dataResolver/useFormData';

import { CodeListItem } from '@pkg-core/codeList/redux/types';
import { NOT_FOUND_KEY } from '@pkg-constants/formCommon';
import {
  getFormIdFromWidgetId,
  getJsonPathFromWidgetId,
} from '@pkg-form/validations/utils/widgetUtils';

const getDescriptionPart = (lastPart: string): string => {
  if (lastPart?.endsWith('Code')) {
    return lastPart?.replace(/Code$/, 'Description');
  }
  return `${lastPart}Description`; //'CL' and other cases by default
};

const getItemLabel = (list, code: string) => {
  const item = list.find((li) => li.code === code);

  return item ? item.label : NOT_FOUND_KEY;
};

const renderValue = (list, selected: string | Array<string>, multiple: boolean) => {
  if (multiple && Array.isArray(selected)) {
    return ((selected || []) as Array<string>).map((s) => getItemLabel(list, s)).join(', ');
  }

  return getItemLabel(list, selected as string);
};

const useCodeListDisplayValue = (
  widgetId: string,
  multiple: boolean,
  list: Array<CodeListItem>,
  selected,
) => {
  const jsonPathParts = useMemo(() => {
    const parts = getJsonPathFromWidgetId(widgetId, false);
    const lastPart = parts[parts.length - 1];
    parts[parts.length - 1] = getDescriptionPart(lastPart);
    return parts;
  }, [widgetId]);

  const { value: widgetValue } = useFormData(widgetId, {
    type: 'SELF',
    code: getFormIdFromWidgetId(widgetId),
    jsonPath: jsonPathParts,
  }) || { value: '' };

  const { value: widgetValueSaved } = useFormData(widgetId, {
    type: 'ENTITY',
    code: getFormIdFromWidgetId(widgetId),
    jsonPath: jsonPathParts,
  }) || { value: '' };

  return useMemo(() => {
    if (!list?.length) {
      return widgetValue || widgetValueSaved || NOT_FOUND_KEY;
    }
    return renderValue(list, selected, multiple);
  }, [list, selected, multiple, widgetValue, widgetValueSaved]);
};

export default useCodeListDisplayValue;
