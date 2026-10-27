import React, { useState, useMemo, useCallback } from 'react';

import { SINGLE_RECORD_FORM } from '@pkg-constants/screenTypeIds';
import SchemasController from '@pkg-core/schemas/SchemasController';
import { AnyType } from '@pkg-common/types';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import CardFloating from '@pkg-common/atomics/CardFloating/CardFloating';
import { useTranslation } from 'react-i18next';
import { COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import ValidationsProvider from '@pkg-form/validations/ValidationsProvider';
import FormManagerProvider from '@pkg-form/FormManagerProvider';

const PRODUCT_VERSION = 'ProductVersion';

const ProductInfo = ({ open, onClose }) => {
  const [schemas, setSchemas] = useState<{ uiSchema: AnyType; schema: AnyType }>({
    uiSchema: {},
    schema: {},
  });

  const setAllSchemas = useCallback((schemas) => {
    setSchemas(schemas);
  }, []);

  const { t: translate } = useTranslation([COMMON]);
  const { selectedLanguage } = useSystem();

  const uiSchema = useMemo(() => {
    return schemas?.uiSchema || {};
  }, [schemas]);

  const schema = useMemo(() => {
    return schemas?.schema || {};
  }, [schemas]);

  return (
    <ValidationsProvider>
      <FormManagerProvider>
        <SchemasController
          pageId={PRODUCT_VERSION}
          screenType={SINGLE_RECORD_FORM}
          onSchemasReady={setAllSchemas}
        >
          {open && (
            <CardFloating
              id={PRODUCT_VERSION}
              title={translate('productVersion', { lng: selectedLanguage, ns: COMMON })}
              open={open}
              onClose={onClose}
            >
              <DynamicForm id={PRODUCT_VERSION} schema={schema} uiSchema={uiSchema} />
            </CardFloating>
          )}
        </SchemasController>
      </FormManagerProvider>
    </ValidationsProvider>
  );
};

export default ProductInfo;
