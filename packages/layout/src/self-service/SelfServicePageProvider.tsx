import React, { useMemo, useEffect, useState, useCallback } from 'react';

import useSystem from '@pkg-setup/src/system/useSystem';
import { AnyType } from '@pkg-common/types';
import SchemasController from '@pkg-core/schemas/SchemasController';
import TranslationsController from '@pkg-core/TranslationsController';
import { SINGLE_RECORD_FORM } from '@pkg-constants/screenTypeIds';
import GenericPage from '@pkg-form/components/GenericPage';
import { DEFAULT_CODELISTS } from '@pkg-constants/apiRequests';
import ErrorLayout from '@pkg-common/components/ErrorLayout/ErrorLayout';
import usePermissions from '@pkg-setup/src/user/usePermissions';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import UISchemaContext from '@pkg-form/UISchemaContext';

export type FallbackSchemasType = {
  [_: string]: {
    configuration: AnyType;
    uiSchema: AnyType;
    schema: AnyType;
    pageUiSchema: AnyType;
    pageSchema: AnyType;
  };
};

const SelfServicePageProvider = ({
  pageId,
  subType: defaultEntitySubType,
  forbiddenImage,
  errorImage,
}: {
  pageId: string;
  subType: string;
  forbiddenImage: string;
  errorImage: string;
}) => {
  const { clear } = useSystem();
  const [schemas, setSchemas] = useState<FallbackSchemasType>({});

  const setAllSchemas = useCallback((schemas) => {
    setSchemas(schemas);
  }, []);

  const uiSchema = useMemo(() => {
    return schemas?.uiSchema || {};
  }, [schemas]);

  const schema = useMemo(() => {
    return schemas?.schema || {};
  }, [schemas]);

  const { namespace = '' } = useMemo(() => {
    if (!uiSchema) {
      return {};
    }
    return uiSchema['ui:labels'] || {};
  }, [uiSchema]);

  const { permissionKey } = useMemo(() => {
    if (!uiSchema) {
      return {};
    }
    return uiSchema['ui:page'] || {};
  }, [uiSchema]);

  useEffect(() => {
    return () => {
      localStorage.removeItem('CLICKED_CELL_ID_' + pageId);
      clear();
    };
  }, [pageId]);

  useEffect(() => {
    window.FORM = pageId;
  }, [pageId]);

  const isPermissionAllowed = usePermissions(permissionKey);

  return (
    <SchemasController
      key={pageId}
      pageId={pageId}
      screenType={SINGLE_RECORD_FORM}
      subType={defaultEntitySubType}
      onSchemasReady={setAllSchemas}
      errorLayout={<ErrorLayout image={errorImage} message="serverError" />}
    >
      {isPermissionAllowed ? (
        <TranslationsController pageId={pageId} namespace={namespace} codelists={DEFAULT_CODELISTS}>
          <UISchemaContext.Provider value={uiSchema}>
            <AppActions
              page={uiSchema['ui:page']}
              actions={uiSchema['ui:buttons'] || {}}
              checkPermissions={true}
            />
          </UISchemaContext.Provider>
          <GenericPage schema={schema} uiSchema={uiSchema} />
        </TranslationsController>
      ) : (
        <ErrorLayout image={forbiddenImage} message="userHasNoAccessToPage" />
      )}
    </SchemasController>
  );
};

export default SelfServicePageProvider;
