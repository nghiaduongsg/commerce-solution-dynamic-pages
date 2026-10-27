import React, { useEffect } from 'react';
import ReadOnlyField from '@pkg-form/components/ReadOnlyField/ReadOnlyField';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import GenericNumberFormatter from '@pkg-common/atomics/GenericNumberFormatter/GenericNumberFormatter';
import useAmount from '@pkg-common/hooks/useAmount';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import useFormField from '@pkg-entity/hooks/useFormField';
import { FormWidgetProps } from '@pkg-form/types';
import { hasValue } from '@pkg-common/utils/utils';
import { ACCESSIBILITY } from '@pkg-constants/translationNamespaces';
import useApiData from '@pkg-core/apiData/hooks/useApiData';
import FieldTitle from '@pkg-form/templates/FieldTitle/FieldTitle';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';

const AmountReadOnlyWidget = ({
  id,
  options,
  schema,
  uiSchema,
  formContext,
  serverErrors,
  diffs,
}: FormWidgetProps) => {
  const {
    slim,
    defaultValueFrom,
    showLabel = true,
    alignment = 'left',
    apiValues,
    labelAlignment = 'top',
    extended = false,
  } = options;
  const defaultValue = uiSchema['ui:value'];

  const { value, setFieldValue } = useFormField(id, undefined, false);
  const { readOnlyLabel } = useWidgetUtils(schema, options, formContext);

  const apiValue = useApiData(id, apiValues);

  useEffect(() => {
    if (apiValues && hasValue(apiValue)) {
      setFieldValue(apiValue);
    } else if (hasValue(defaultValue)) {
      setFieldValue(defaultValue);
    } else if (!hasValue(value)) {
      setFieldValue(null);
    }
  }, [setFieldValue, apiValues, defaultValue, apiValue, value]);

  const {
    value: amount,
    symbolPosition,
    thousandSeparator,
    decimalPlaces,
    symbol,
    decimalSeparator,
    decimalPlacesExtended,
  } = useAmount({ id, value, options });

  useDefaultValueFrom(id, defaultValueFrom);

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([ACCESSIBILITY]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {labelAlignment === 'left' && (
        <FieldTitle title={readOnlyLabel} isBold={true} sx={{ marginRight: 5 }} />
      )}
      <ReadOnlyField
        id={id}
        title={showLabel ? readOnlyLabel : ''}
        uiSchema={uiSchema}
        value={
          <GenericNumberFormatter
            value={amount ?? '-'}
            displayText="text"
            textAlign={alignment}
            thousandSeparator={thousandSeparator}
            decimalSeparator={decimalSeparator}
            decimalPlaces={extended ? decimalPlacesExtended : decimalPlaces}
            disabled={true}
            symbol={symbol}
            symbolPosition={symbolPosition}
            ariaLabel={showLabel ? readOnlyLabel : ''}
          />
        }
        errors={
          <ValidationErrors
            id={id}
            clientErrors={[]}
            serverErrors={serverErrors}
            diffs={diffs}
            dirty={true}
          />
        }
        invalid={(serverErrors || [])?.length > 0}
        slim={slim}
      />
    </div>
  );
};

export default AmountReadOnlyWidget;
