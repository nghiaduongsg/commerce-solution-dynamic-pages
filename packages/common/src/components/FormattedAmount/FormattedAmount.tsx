import React, { useMemo } from 'react';
import { NumericFormat } from 'react-number-format';
import FormattedAmountProps from './FormattedAmount.d';
import useAmount from '@pkg-common/hooks/useAmount';
import { hasValue } from '@pkg-common/utils';

const FormattedAmount = ({
  id,
  value,
  currency,
  styles = {},
  extended = false,
}: FormattedAmountProps) => {
  const {
    symbolPosition,
    thousandSeparator,
    decimalPlaces,
    decimalPlacesExtended,
    symbol,
    decimalSeparator,
    value: amountValue,
  } = useAmount({
    value,
    currency,
  });

  const symbolPositionProperty = {
    PREFIX: { prefix: symbol },
    SUFFIX: { suffix: symbol },
  };

  const finalValue = useMemo(() => {
    if (!hasValue(amountValue)) {
      return '';
    }

    return amountValue;
  }, [amountValue]);

  return (
    <NumericFormat
      id={id}
      className={styles}
      style={{
        border: 'none',
        height: '100%',
        width: '100%',
        backgroundColor: 'inherit',
        color: 'inherit',
        fontFamily: 'inherit',
        fontSize: 'inherit',
      }}
      displayType="text"
      value={finalValue}
      isNumericString={false}
      fixedDecimalScale={true}
      {...symbolPositionProperty[symbolPosition]}
      thousandSeparator={thousandSeparator}
      decimalSeparator={decimalSeparator}
      decimalPlaces={extended ? decimalPlacesExtended : decimalPlaces}
      symbol={symbol}
      symbolPosition={symbolPosition}
      decimalScale={extended ? decimalPlacesExtended : decimalPlaces}
    />
  );
};

export default FormattedAmount;
