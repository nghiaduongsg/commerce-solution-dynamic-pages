import useMultipleFormData from '@pkg-common/dataResolver/useMultipleFormData';
import { DataSourceSchema, InfoSchema } from '@pkg-common/types';
import { useMemo } from 'react';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTranslation } from 'react-i18next';
import { COMMON } from '@pkg-constants/translationNamespaces';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { getFinalMessages } from '@pkg-form/templates/ArrayTemplate/TreeTemplate/utils';

const getHoursAndMinutes = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return { hours, mins };
};

const useAdditionalInfo = (id: string, info: InfoSchema) => {
  const {
    type = 'DEFAULT',
    fields,
    visibilityFrom,
    infoMessage,
    variant = 'outlined',
    severity = 'info',
    displayIcon = false,
    namespace = COMMON,
    allowHtml = false,
  } = info ?? {};

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([namespace, COMMON]);

  const infoValue = useMultipleFormData(id, fields) as Array<DataSourceSchema>;
  const { check: visible } = useCheckFrom(id, visibilityFrom, true);

  const isDefault = useMemo(() => {
    return info && visible && type === 'DEFAULT' && !fields;
  }, [info, visible, type, fields]);

  const isTooltip = useMemo(() => {
    return info && visible && type === 'TOOLTIP' && !fields;
  }, [info, visible, type, fields]);

  const isFormattedTimeTooltip = useMemo(() => {
    return info && visible && type === 'FORMATTED_TIME' && fields;
  }, [info, visible, type, fields]);

  const isDynamicMessageTooltip = useMemo(() => {
    return info && visible && type === 'DYNAMIC_MESSAGE' && fields;
  }, [info, visible, type, fields]);

  const isMultiple = useMemo(() => {
    return info && visible && fields;
  }, [info, visible, fields]);

  const translatedMessage: Array<string> | string = useMemo(() => {
    if (infoMessage && !isMultiple) {
      if (Array.isArray(infoMessage)) {
        return infoMessage
          .map((key) => translate(key, { ns: namespace, lng: selectedLanguage, key: key }))
          .join('\n');
      }

      return translate(infoMessage, { ns: namespace, lng: selectedLanguage });
    } else if (isDynamicMessageTooltip) {
      const entries = Object.entries(infoValue);
      if (entries.length > 0) {
        const [key, value] = entries[0];
        return translate(infoMessage, {
          ns: namespace,
          lng: selectedLanguage,
          [key]: value,
        });
      }
    } else if (isMultiple) {
      const lines = getFinalMessages(infoValue);
      return lines
        ?.map((item) =>
          translate(`${item ?? ''}`, {
            ns: namespace,
            lng: selectedLanguage,
            key: item,
          }),
        )
        ?.join(`\n`);
    } else if (isFormattedTimeTooltip) {
      const key =
        infoValue && typeof infoValue === 'object' && !Array.isArray(infoValue)
          ? Object.keys(infoValue)[0]
          : null;

      const value = key ? infoValue[key] : 0;
      const { hours, mins } = getHoursAndMinutes(value);

      return translate('timeTooltip', { ns: COMMON, lng: selectedLanguage, hours, mins });
    }
    return '';
  }, [
    infoValue,
    infoMessage,
    namespace,
    selectedLanguage,
    translate,
    isMultiple,
    isFormattedTimeTooltip,
  ]);

  return {
    translatedMessage,
    severity,
    displayIcon,
    variant,
    isDefault,
    isMultiple,
    isTooltip: [isTooltip, isFormattedTimeTooltip, isDynamicMessageTooltip].some(Boolean),
    visible,
    allowHtml,
  };
};

export default useAdditionalInfo;
