import React, { useCallback, useState } from 'react';
import { SINGLE_RECORD_FORM } from '@pkg-constants/screenTypeIds';
import { useTranslation } from 'react-i18next';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import CardFloating from '@pkg-common/atomics/CardFloating/CardFloating';
import useSystem from '@pkg-setup/src/system/useSystem';
import SchemasController from '@pkg-core/schemas/SchemasController';
import { AnyType } from '@pkg-common/types';
import ValidationsProvider from '@pkg-form/validations/ValidationsProvider';
import FormManagerProvider from '@pkg-form/FormManagerProvider';

function TaxpayerDetails({ open, onClose, partyTypeCode }) {
  const namespaces = ['partyDetails'];
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation(namespaces);
  const [schemas, setSchemas] = useState<AnyType>(null);
  const setAllSchemas = useCallback((schemas) => {
    setSchemas(schemas);
  }, []);

  return (
    <CardFloating
      id={'taxpayer-details'}
      title={translate('partyDetails', { lng: selectedLanguage, ns: 'partyDetails' })}
      open={open}
      onClose={onClose}
    >
      <ValidationsProvider>
        <FormManagerProvider>
          <SchemasController
            pageId="PartyDetails"
            screenType={SINGLE_RECORD_FORM}
            subType={partyTypeCode}
            onSchemasReady={setAllSchemas}
          >
            <DynamicForm
              id="taxpayer-floating-card"
              schema={schemas?.schema}
              uiSchema={schemas?.uiSchema}
            />
          </SchemasController>
        </FormManagerProvider>
      </ValidationsProvider>
    </CardFloating>
  );
}

export default React.memo(
  TaxpayerDetails,
  (prev, next) => prev.open === next.open && prev.partyTypeCode === next.partyTypeCode,
);
