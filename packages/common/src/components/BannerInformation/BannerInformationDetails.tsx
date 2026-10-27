import React from 'react';
import CardFloating from '@pkg-common/atomics/CardFloating/CardFloating';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { AnyType } from '@pkg-common/types';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';

function BannerInformationDetails({
  open,
  onClose,
  schema,
  uiSchema,
  namespace,
}: {
  open: boolean;
  onClose: () => void;
  schema?: AnyType;
  uiSchema?: AnyType;
  namespace: string;
}) {
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([namespace, COMMON]);

  return (
    <CardFloating
      id={'banner-details'}
      title={translate('cardTitle', { lng: selectedLanguage })}
      open={open}
      onClose={onClose}
    >
      <DynamicForm
        id="info-floating-card"
        schema={schema}
        uiSchema={{
          ...uiSchema,
          'ui:labels': { namespace },
        }}
      />
    </CardFloating>
  );
}

export default React.memo(BannerInformationDetails, (prev, next) => prev.open === next.open);
