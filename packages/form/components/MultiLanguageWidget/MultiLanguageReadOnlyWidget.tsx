import React, { useMemo } from 'react';
import ReadOnlyField from '@pkg-form/components/ReadOnlyField/ReadOnlyField';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import { MultiLanguageWidgetProps } from './MultiLanguageWidget.d';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useSystem from '@pkg-setup/src/system/useSystem';
import { Box } from '@mui/material';

const MultiLanguageReadOnlyWidget = ({
  id,
  value,
  options,
  schema,
  uiSchema,
  formContext,
  serverErrors,
  diffs,
}: MultiLanguageWidgetProps) => {
  const { selectedLanguage } = useSystem();
  const { slim, defaultValueFrom, showExtendedDescription } = options;
  const { readOnlyLabel, readOnlyExtendedDescriptionLabel, showReadOnlyLabel } = useWidgetUtils(
    schema,
    options,
    formContext,
  );

  useDefaultValueFrom(id, defaultValueFrom);

  const finalValue = useMemo(() => {
    return (value || []).find((v) => v.languageCL === selectedLanguage)?.description;
  }, [value, selectedLanguage]);

  const finalSecondaryValue = useMemo(() => {
    return (value || []).find((v) => v.languageCL === selectedLanguage)?.extendedDescription;
  }, [value, selectedLanguage]);

  return (
    <Box display="flex" flexDirection="column" gap="8px">
      <ReadOnlyField
        id={id}
        title={showReadOnlyLabel ? readOnlyLabel : undefined}
        value={finalValue}
        slim={slim}
        uiSchema={uiSchema}
        errors={
          <ValidationErrors
            id={id}
            clientErrors={[]}
            serverErrors={serverErrors}
            diffs={diffs}
            dirty={true}
          />
        }
      />
      {showExtendedDescription && (
        <ReadOnlyField
          id={id}
          title={readOnlyExtendedDescriptionLabel}
          value={finalSecondaryValue}
          slim={slim}
          uiSchema={uiSchema}
        />
      )}
    </Box>
  );
};

export default MultiLanguageReadOnlyWidget;
