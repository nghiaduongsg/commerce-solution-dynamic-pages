import React, { useMemo, useRef } from 'react';
import { AutoCalculatedWidgetProps } from './AutoCalculatedAmountWidget.d';
import useMultipleFormData from '@pkg-common/dataResolver/useMultipleFormData';
import AmountReadOnlyWidget from '@pkg-form/components/AmountWidget/AmountReadOnlyWidget';
import ReadOnlyField from '@pkg-form/components/ReadOnlyField/ReadOnlyField';
import { hasValue } from '@pkg-common/utils/utils';
import useFormField from '@pkg-entity/hooks/useFormField';
import { useApiDataState } from '@pkg-core/apiData';
import useApiData from '@pkg-core/apiData/hooks/useApiData';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTranslation } from 'react-i18next';
import { COMMON } from '@pkg-constants/translationNamespaces';

type AutoCalculatedAmountWidgetValuesType = {
  fromCurrency: string;
  toCurrency: string;
  effectiveDate: string;
  amount: number;
};

const AutoCalculatedAmountWidget = (props: AutoCalculatedWidgetProps) => {
  const valueRef = useRef<number | undefined>(undefined);
  const { id, options, uiSchema } = props;
  const { exchangeRateInfo, saveValue = false } = options;

  const { setFieldValue } = useFormField(id);
  const { primaryCurrency, selectedLanguage } = useSystem();

  const { code: primaryCurrencyCode } = primaryCurrency || {};

  const decimalPlaces = useMemo(() => {
    return (primaryCurrency?.attributes || []).find((attr) => attr.key === 'decimalPlaces')?.value;
  }, [primaryCurrency]);

  const { t: translate } = useTranslation([COMMON]);

  const values = useMultipleFormData(id, exchangeRateInfo) as AutoCalculatedAmountWidgetValuesType;
  const hasFromCurrency = exchangeRateInfo.find((info) => info.key === 'fromCurrency');
  const hasToCurrency = exchangeRateInfo.find((info) => info.key === 'toCurrency');

  const fromCurrency = useMemo(() => {
    return hasFromCurrency ? values?.fromCurrency : primaryCurrencyCode;
  }, [primaryCurrencyCode, values]);

  const toCurrency = useMemo(() => {
    return hasToCurrency ? values?.toCurrency : primaryCurrencyCode;
  }, [primaryCurrencyCode, values]);

  const effectiveDate = useMemo(() => {
    return values?.effectiveDate;
  }, [values]);

  const originalAmount = values?.amount;

  const diffrenentRateInfo = useApiData(`${id}_rateInfo`, {
    url: effectiveDate
      ? `currency-exchange/exchange-rates/${fromCurrency}/${toCurrency}?date=${effectiveDate}`
      : `currency-exchange/exchange-rates/${fromCurrency}/${toCurrency}`,
  });

  const rateInfo = fromCurrency !== toCurrency ? diffrenentRateInfo : { rate: 1 };
  const { loading, hasError } = useApiDataState(`${id}_rateInfo`);

  const shouldHideWidget =
    !fromCurrency || !toCurrency || !effectiveDate || !primaryCurrencyCode || !originalAmount;

  if (!saveValue && shouldHideWidget) {
    return null;
  }

  const amountWidgetProps = {
    ...props,
    value: +(((originalAmount || 0) * ((rateInfo?.rate as number) || 1)) as number).toFixed(
      decimalPlaces || 3,
    ),
  };

  /**
   * This widget is merely for presentational purposes, as it auto-calculates its own value.
   * The reason we sometimes need to call the onChange is if we need to keep the value in the form's data
   * so that we can perform some validations to other fields based on this value.
   */
  if (hasValue(amountWidgetProps.value) && amountWidgetProps.value !== valueRef.current) {
    setFieldValue(amountWidgetProps.value);
    valueRef.current = amountWidgetProps.value;
  }

  if (loading) {
    return (
      <ReadOnlyField
        id={id}
        value={''}
        title={translate('calculating', { ns: COMMON, lng: selectedLanguage })}
        uiSchema={uiSchema}
      />
    );
  }

  if (hasError) {
    return (
      <ReadOnlyField
        id={id}
        value={''}
        title={translate('error', { ns: COMMON, lng: selectedLanguage })}
        uiSchema={uiSchema}
      />
    );
  }

  return <AmountReadOnlyWidget {...(amountWidgetProps as any)} />;
};

export default AutoCalculatedAmountWidget;
