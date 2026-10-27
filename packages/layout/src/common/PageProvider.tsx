import React, { useMemo, useEffect, useState, useCallback } from 'react';

import useSystem from '@pkg-setup/src/system/useSystem';
import { useApiDataState } from '@pkg-core/apiData';
import { UPDATE_ACTION_ID, USER_ACCESS_PERMISSIONS_RESOURCE_ID } from '@pkg-constants/formCommon';
import { AnyType } from '@pkg-common/types';
import usePermissions from '@pkg-setup/src/user/usePermissions';
import AccessController from '@pkg-core/AccessController';
import SchemasController from '@pkg-core/schemas/SchemasController';
import TranslationsController from '@pkg-core/TranslationsController';
import ErrorLayout from '@pkg-common/components/ErrorLayout/ErrorLayout';
import { DETAIL_FORM, SINGLE_RECORD_FORM } from '@pkg-constants/screenTypeIds';
import GenericPage from '@pkg-form/components/GenericPage';
import { isActionAllowed } from '@pkg-common/utils/utils';
import AddressForm from '@pkg-layout/src/list/AddressForm';
import PageContent from '@pkg-layout/src/common/PageContent';
import { PageProviderProps } from './PageProvider.d';
import { DEFAULT_CODELISTS } from '@pkg-constants/apiRequests';
import PageHeader from '@pkg-layout/src/common/PageHeader';
import { HOME_ID } from '@pkg-constants/formIds';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';

const PageProvider = ({
  viewMode = 'form',
  pageId,
  idKey,
  subType,
  disabled = false,
  hideActionButtons = false,
  forbiddenImage,
  errorImage,
  serverErrorImage,
  heroImage,
  overrides,
}: PageProviderProps) => {
  const { allSymbol, selectedLanguage } = useSystem();
  const { clearDirtyFlags } = useFormManagerContext();

  const [schemas, setSchemas] = useState<{ schema?: AnyType; uiSchema?: AnyType }>({});

  const { data } = useApiDataState(USER_ACCESS_PERMISSIONS_RESOURCE_ID);
  const isActionUpdateAllowed = isActionAllowed(UPDATE_ACTION_ID, data, allSymbol);

  const isUpdateAllowed = useMemo(() => {
    return isActionUpdateAllowed;
  }, [isActionUpdateAllowed, pageId, selectedLanguage]);

  const setAllSchemas = useCallback((schemas) => {
    setSchemas(schemas);
  }, []);

  const uiSchema = useMemo(() => {
    return schemas?.uiSchema || {};
  }, [schemas]);

  const schema = useMemo(() => {
    return schemas?.schema || {};
  }, [schemas]);

  const { permissionKey } = useMemo(() => {
    if (!uiSchema) {
      return {};
    }
    return uiSchema['ui:page'] || {};
  }, [uiSchema]);

  const { namespace = '' } = useMemo(() => {
    if (!uiSchema) {
      return {};
    }
    return uiSchema['ui:labels'] || {};
  }, [uiSchema]);

  const showDraggablePanel = useMemo(() => {
    if (!uiSchema) {
      return false;
    }
    return uiSchema?.sidePanelInfo?.length > 0;
  }, [uiSchema]);

  useEffect(() => {
    return () => {
      localStorage.removeItem('CLICKED_CELL_ID_' + pageId);
    };
  }, []);

  const { id: schemaPageId } = useMemo(() => {
    return uiSchema['ui:page'] || {};
  }, [uiSchema['ui:page']]);

  useEffect(() => {
    window.FORM = pageId;
  }, [pageId]);

  const isPermissionAllowed = usePermissions(permissionKey);

  useEffect(() => {
    return () => {
      clearDirtyFlags(pageId);
    };
  }, [pageId]);

  if (pageId === 'Address') {
    return (
      <AccessController
        pageId={pageId}
        idKey={idKey}
        ForbiddenImage={forbiddenImage}
        ServerErrorImage={serverErrorImage}
        permissionKey={permissionKey}
      >
        <SchemasController
          pageId={pageId}
          screenType={SINGLE_RECORD_FORM}
          subType={subType}
          onSchemasReady={setAllSchemas}
          errorLayout={<ErrorLayout image={errorImage} message="schemasNotFound" />}
        >
          {schemaPageId === pageId ? (
            <TranslationsController
              pageId={pageId}
              namespace={namespace}
              codelists={DEFAULT_CODELISTS}
            >
              <PageHeader heroImage={heroImage} overrides={overrides} />
              <AddressForm uiSchema={uiSchema} schema={schema} />
            </TranslationsController>
          ) : null}
        </SchemasController>
      </AccessController>
    );
  }

  return (
    <AccessController
      pageId={pageId}
      idKey={idKey}
      ServerErrorImage={serverErrorImage}
      ForbiddenImage={forbiddenImage}
      permissionKey={permissionKey}
    >
      <SchemasController
        pageId={pageId}
        screenType={viewMode === 'detail' ? DETAIL_FORM : SINGLE_RECORD_FORM}
        subType={subType}
        onSchemasReady={setAllSchemas}
        errorLayout={<ErrorLayout image={errorImage} message="serverError" />}
      >
        {isPermissionAllowed && schemaPageId === pageId ? (
          <TranslationsController
            pageId={pageId}
            namespace={namespace}
            codelists={DEFAULT_CODELISTS}
          >
            {pageId !== HOME_ID ? <PageHeader heroImage={heroImage} overrides={overrides} /> : null}

            <PageContent pageId={pageId} idKey={idKey} sidePanel={showDraggablePanel}>
              <GenericPage
                schema={schema}
                uiSchema={uiSchema}
                disabled={disabled || viewMode === 'detail' || !isUpdateAllowed}
                hideActionButtons={hideActionButtons}
              />
            </PageContent>
          </TranslationsController>
        ) : null}
      </SchemasController>
    </AccessController>
  );
};

export default PageProvider;
