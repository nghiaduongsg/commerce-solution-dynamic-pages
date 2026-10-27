import React, { useCallback } from 'react';
import TextWidget from '@pkg-form/components/TextWidget/TextWidget';
import GenericNumberFormatter from '@pkg-common/atomics/GenericNumberFormatter/GenericNumberFormatter';
import useAmount from '@pkg-common/hooks/useAmount';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import useFormField from '@pkg-entity/hooks/useFormField';
import { FormWidgetProps } from '@pkg-form/types';
import { getDebounceDelay } from '@pkg-form/validations/utils/widgetUtils';

const AmountWidget = (props: FormWidgetProps) => {
  const { id, inputProps, options, formContext, value: innerValue, onChange } = props;
  const { mapToProperty, defaultValueFrom } = options;

  const { mechanism, filterMode = false } = formContext || {};
  const useDefaultMechanism = mechanism === 'DEFAULT';

  const { value, setFieldValue } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
    getDebounceDelay(filterMode),
  );

  const {
    symbolPosition,
    thousandSeparator,
    decimalPlaces,
    inactive,
    symbol,
    decimalSeparator,
    value: amount,
  } = useAmount({ id, value, options });

  useDefaultValueFrom(id, defaultValueFrom);

  const onChangeValue = useCallback(
    (amountValue) => {
      setFieldValue(mapToProperty ? { [mapToProperty]: amountValue } : amountValue);
    },
    [mapToProperty, setFieldValue],
  );

  const amountComponent = useCallback(
    (inputs) => {
      const allProps = {
        ...inputs,
        decimalPlaces,
        decimalSeparator,
        inactive,
        symbol,
        symbolPosition,
        thousandSeparator,
        onChange: onChangeValue,
      };

      return <GenericNumberFormatter {...allProps} />;
    },
    [
      decimalPlaces,
      decimalSeparator,
      inactive,
      symbol,
      symbolPosition,
      thousandSeparator,
      onChangeValue,
    ],
  );

  const widgetProps = { ...props, value: amount };

  return (
    <TextWidget
      {...widgetProps}
      inputProps={{
        ...inputProps,
        inputComponent: amountComponent,
      }}
      formContext={formContext}
    />
  );
};

export default AmountWidget;
