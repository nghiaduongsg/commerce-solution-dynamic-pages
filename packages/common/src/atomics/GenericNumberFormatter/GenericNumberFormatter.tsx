import React, { useMemo } from 'react';
import { NumericFormat } from 'react-number-format';
import { AnyType } from '@pkg-common/types';
import { hasValue } from '@pkg-common/utils/utils';
import { truncateDecimalPlaces } from '@pkg-common/utils';

export const GenericNumberFormatter = (props: {
  value: number | string | null;
  inputRef?: AnyType;
  onChange?: (e: AnyType) => void;
  onBlur?: (e: AnyType) => void;
  thousandSeparator?: string;
  decimalSeparator?: string;
  decimalPlaces?: number;
  symbol?: string;
  symbolPosition: string;
  disabled?: boolean;
  ariaDescription?: string;
  ariaLabel?: string;
  textAlign?: 'left' | 'center' | 'right' | 'start' | 'end' | 'inherit';
  displayText?: 'input' | 'text';
  calculatedRow?: boolean;
  isCorrectionsDisabled?: boolean;
}) => {
  const {
    inputRef,
    onChange,
    onBlur,
    disabled,
    thousandSeparator,
    decimalSeparator,
    decimalPlaces,
    symbolPosition,
    symbol,
    value,
    ariaDescription = '',
    ariaLabel = '',
    textAlign = 'right',
    displayText = 'input',
    calculatedRow,
    isCorrectionsDisabled,
    ...other
  } = props;

  const symbolPositionProperty = {
    PREFIX: { prefix: symbol },
    SUFFIX: { suffix: symbol },
  };

  const truncatedValue = useMemo(() => {
    if (value === '-') {
      return '-';
    }
    if (!hasValue(value)) {
      return '';
    }
    return parseFloat(truncateDecimalPlaces(value, decimalPlaces));
  }, [value, decimalPlaces]);

  return (
    <NumericFormat
      {...{ ...other, value: truncatedValue }}
      getInputRef={inputRef}
      style={{
        textAlign,
        border: 'none',
        backgroundColor: 'inherit',
        color: isCorrectionsDisabled && calculatedRow ? 'black' : 'inherit',
        fontFamily: 'inherit',
        fontSize: 'inherit',
      }}
      onValueChange={(values) => {
        const { floatValue } = values;

        if (onChange) {
          onChange(floatValue);
        }
      }}
      onBlur={(e) => {
        const numValue = e.target.value;
        onBlur && !onChange && onBlur(numValue);
      }}
      type="text"
      displayType={displayText} // displayType text makes it accesible to screen readers
      disabled={disabled}
      thousandSeparator={thousandSeparator}
      decimalSeparator={decimalSeparator}
      isNumericString={false}
      decimalScale={decimalPlaces}
      {...symbolPositionProperty[symbolPosition]}
      fixedDecimalScale={true}
      aria-label={ariaLabel}
      aria-description={ariaDescription}
    />
  );
};

export default GenericNumberFormatter;
