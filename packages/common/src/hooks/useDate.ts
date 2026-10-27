import { useMemo } from 'react';
import useCodeListAttributes from '@pkg-core/codeList/hooks/useCodeListAttributes';
import { DATE_CODES, SYSTEM_PARAMETERS } from '@pkg-constants/codeListVariables';

// TODO: Refactor this hook. Maybe create a selector instead of custom hook.
const useDate = (type: string) => {
  const { getAttribute } = useCodeListAttributes(SYSTEM_PARAMETERS);

  const dateCode = useMemo(() => getAttribute(DATE_CODES[type], 'id'), [getAttribute, type]);

  if (!dateCode || !dateCode[0]) {
    switch (type) {
      case 'time':
        return 'HH:mm';
      case 'dateTimeNoTimeZone':
      case 'dateTimeWithTimeZone':
        return 'yyyy-MM-dd HH:mm:ss';
      case 'monthDay':
        return 'MM-dd';
      default:
        return 'yyyy-MM-dd';
    }
  }

  return dateCode && dateCode[0];
};

export default useDate;
