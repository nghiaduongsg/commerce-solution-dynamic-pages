import { useMemo } from 'react';
import useFormData from '@pkg-common/dataResolver/useFormData';
import useCodeListAttributes from '@pkg-core/codeList/hooks/useCodeListAttributes';
import { CurrencyAttributesProps } from '@pkg-form/types';
import { BOOLEAN_CODELIST_ATTRIBUTES, CURRENCIES } from '@pkg-constants/codeListVariables';
import { AnyType, ApiValuesSchema, DataSourceSchema } from '@pkg-common/types';

const reduceFunction = (attributes: AnyType, currentAttributeObject: AnyType) => {
  const { key, value: attributeValue } = currentAttributeObject;
  return { ...attributes, [key]: attributeValue };
};

const useAmount = ({
  id = '',
  value,
  options,
  currency,
}: {
  id?: string;
  value?: string;
  options?: {
    mapToProperty?: string;
    source?: DataSourceSchema;
    apiValues?: ApiValuesSchema;
  };
  currency?: string;
}) => {
  const { mapToProperty = '', source } = options || {};

  let { value: selectedCurrency } = useFormData(id, source as DataSourceSchema);

  if (!selectedCurrency) {
    selectedCurrency = currency;
  }

  const { getItemByAttribute, getItem } = useCodeListAttributes(CURRENCIES);

  const currencyCode = selectedCurrency
    ? getItem(selectedCurrency)
    : getItemByAttribute('primary', BOOLEAN_CODELIST_ATTRIBUTES.YES);

  const currencyAttributes = currencyCode?.attributes.reduce(reduceFunction, {});

  const {
    symbolPosition = 'SUFFIX',
    thousandSeparator = '.',
    decimalPlaces = '2',
    symbol = currency || '€',
    inactive = 'NO',
    decimalSeparator = ',',
    decimalPlacesExtended = '5',
  }: CurrencyAttributesProps = currencyAttributes || {};
  const getValue = useMemo(
    () => (mapToProperty && value ? value[mapToProperty as AnyType] : value),
    [mapToProperty, value],
  );

  return {
    symbolPosition,
    thousandSeparator,
    inactive,
    symbol,
    decimalSeparator,
    decimalPlaces: Number.parseInt(decimalPlaces),
    decimalPlacesExtended: Number.parseInt(decimalPlacesExtended),
    value: getValue,
  };
};

export default useAmount;
