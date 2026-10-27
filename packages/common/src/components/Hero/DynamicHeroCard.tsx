import React from 'react';
import CardDisplay from '@pkg-common/atomics/CardDisplay/CardDisplay';
import useApiData from '@pkg-core/apiData/hooks/useApiData';
import { ApiValuesSchema } from '@pkg-common/types';
import { useTranslation } from 'react-i18next';
import { useSystem } from '@pkg-setup/index';
import FormatText from '../FormatText/FormatText';

function DynamicHeroCard({
  id,
  title,
  apiValues,
  valueType,
  namespaces,
  propertyName,
  propertyValue,
}: {
  id: string;
  title: string;
  apiValues: ApiValuesSchema;
  valueType?: string;
  namespaces?: Array<string>;
  propertyName: string;
  propertyValue: string;
}) {
  const { performQuery = false } = apiValues || {};
  const value = useApiData(id, apiValues);
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation(namespaces ?? []);

  if (performQuery) {
    return (value || []).map((item, index) => (
      <CardDisplay
        id={id}
        key={`${id}-${index}`}
        testId={`hero-card-${index}`}
        title={translate(item[propertyName], { ns: namespaces, lng: selectedLanguage })}
        formattedValue={
          valueType ? (
            <FormatText id={id} value={item[propertyValue]} type={valueType} />
          ) : (
            item.balance
          )
        }
        rawValue={valueType ? item[propertyValue] : item.balance}
      />
    ));
  }

  return (
    <CardDisplay
      id={id}
      title={translate(title, { ns: namespaces, lng: selectedLanguage })}
      testId={`${id}`}
      formattedValue={valueType ? <FormatText id={id} value={value} type={valueType} /> : value}
      rawValue={value}
    />
  );
}

export default React.memo(DynamicHeroCard, (prev, next) => {
  return prev.id === next.id;
});
