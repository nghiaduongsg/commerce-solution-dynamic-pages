import React from 'react';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import {
  getWidgetNameFromWidgetId,
  getWidgetArrayPosition,
} from '@pkg-form/validations/utils/widgetUtils';
import { Tooltip } from '@mui/material';
import { hasValue } from '@pkg-common/utils/utils';
import usePage from '@pkg-layout/src/common/hooks/usePage';
import { humanizeKey } from '@pkg-common/utils';

const SchemaValueLabel = ({ fieldId }: { fieldId: string }) => {
  const uiSchema = usePage();
  const { selectedLanguage } = useSystem();
  const namespace = uiSchema?.['ui:labels']?.namespace;
  const { t: translate } = useTranslation([namespace, COMMON]);

  const translationKey =
    uiSchema['ui:options']?.translation?.key || getWidgetNameFromWidgetId(fieldId);

  const translated = translate(translationKey, {
    ns: namespace,
    lng: selectedLanguage,
    defaultValue: humanizeKey(translationKey?.replace('CL', '')),
  });

  const position = getWidgetArrayPosition(fieldId);
  const hasArrayPosition = hasValue(position);

  if (hasArrayPosition) {
    const immediateParent = getWidgetNameFromWidgetId(
      fieldId.substring(0, fieldId.lastIndexOf('_')),
    );
    const translatedLabel = translate(immediateParent, { ns: namespace, lng: selectedLanguage });
    const itemCount = translate('changedItem', {
      ns: ACCESSIBILITY,
      lng: selectedLanguage,
      count: Number(position) + 1,
      ordinal: true,
      title: translatedLabel,
    });

    return (
      <>
        <Tooltip title={fieldId}>
          <span>{translatedLabel}</span>
        </Tooltip>
        <span style={{ fontSize: '1em', fontStyle: 'italic', color: 'grey' }}>
          {` (${itemCount})`}
        </span>
      </>
    );
  }

  return (
    <Tooltip title={fieldId}>
      <span>{translated}</span>
    </Tooltip>
  );
};

export default SchemaValueLabel;
