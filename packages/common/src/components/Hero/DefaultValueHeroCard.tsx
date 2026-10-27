import React from 'react';
import CardDisplay from '@pkg-common/atomics/CardDisplay/CardDisplay';
import { useTranslation } from 'react-i18next';
import { DefaultValueFromSchema } from '@pkg-form/types';
import useFormData from '@pkg-common/dataResolver/useFormData';
import useSystem from '@pkg-setup/src/system/useSystem';
import FormatText from '@pkg-common/components/FormatText/FormatText';

function DefaultValueHeroCard({
  id,
  title,
  defaultValueFrom,
  value,
  namespaces,
  valueType,
}: {
  id: string;
  title: string;
  defaultValueFrom: DefaultValueFromSchema;
  value?: string | number;
  namespaces?: Array<string>;
  valueType?: string;
}) {
  const { value: formValue } = useFormData(id, defaultValueFrom);
  const formatText = <FormatText id={id} value={formValue ?? value} type={valueType} />;

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation(namespaces ?? []);

  return (
    <CardDisplay
      id={id}
      data-testid={`hero-card-${formValue ?? value}-${title}`}
      title={translate(title, { ns: namespaces, lng: selectedLanguage })}
      formattedValue={formatText}
      rawValue={formValue ?? value}
    />
  );
}

export default React.memo(DefaultValueHeroCard, (prev, next) => {
  return prev.id === next.id;
});
