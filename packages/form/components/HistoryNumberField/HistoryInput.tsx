import GenericTextField from '@pkg-common/atomics/GenericTextField/GenericTextField';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useTextWidgetValidations from '@pkg-form/validations/hooks/useTextWidgetValidations';
import React, { useCallback } from 'react';
import { HistoryInputProps } from './HistoryInput.d';
import GenericNumberFormatter from '@pkg-common/atomics/GenericNumberFormatter/GenericNumberFormatter';
import useAmount from '@pkg-common/hooks/useAmount';
import useSystem from '@pkg-setup/src/system/useSystem';

const HistoryInput: React.FC<HistoryInputProps> = (props): JSX.Element => {
  const {
    id,
    value,
    label,
    type,
    disabled,
    required,
    serverErrors = [],
    validations = {},
    onChange = () => void 0,
    showLabel,
    isAmount = false,
    diffs = [],
  } = props;

  const { selectedLanguage } = useSystem();
  const { errors, valid } = useTextWidgetValidations(id, value, validations, serverErrors);

  const {
    symbolPosition,
    thousandSeparator,
    decimalPlaces,
    inactive,
    symbol,
    decimalSeparator,
    value: amount,
  } = useAmount({ id, value });

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
        onChange,
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
      selectedLanguage,
    ],
  );

  const dyamicAmountComponent = isAmount ? amountComponent : null;

  return (
    <GenericTextField
      id={id}
      label={label}
      value={isAmount ? amount : value?.toString()}
      required={required}
      readonly={false}
      disabled={disabled}
      autofocus={false}
      multiline={false}
      emptyValue={''}
      onChange={onChange}
      onBlur={() => void 0}
      onFocus={() => void 0}
      type={type}
      errors={
        <ValidationErrors
          id={id}
          clientErrors={errors}
          serverErrors={serverErrors}
          diffs={diffs}
          dirty={true}
        />
      }
      valid={valid}
      description={''}
      showLabel={showLabel}
      fullWidth={false}
      inputProps={
        isAmount
          ? {
              ...props,
              inputComponent: dyamicAmountComponent,
            }
          : {
              ...props,
            }
      }
    />
  );
};

export default HistoryInput;
