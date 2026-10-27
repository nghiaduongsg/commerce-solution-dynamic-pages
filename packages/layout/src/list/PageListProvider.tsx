import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AnyType } from '@pkg-common/types';
import AccessController from '@pkg-core/AccessController';
import SchemasController from '@pkg-core/schemas/SchemasController';
import { SEARCH_FORM } from '@pkg-constants/screenTypeIds';
import { COMMON } from '@pkg-constants/translationNamespaces';
import TranslationsController from '@pkg-core/TranslationsController';
import { GenericTable } from '@pkg-list/components';
import useTable from '@pkg-list/hooks/useTable';
import ErrorLayout from '@pkg-common/components/ErrorLayout/ErrorLayout';
import { DEFAULT_CODELISTS } from '@pkg-constants/apiRequests';
import usePermissions from '@pkg-setup/src/user/usePermissions';
import QuickView from '@pkg-common/atomics/QuickViewPopup/QuickView';
import { PageContent } from '@pkg-layout/index';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import { Box, Grid } from '@mui/material';
import BottomSearchPanel from './BottomSearchPanel';
import PageHeader from '@pkg-layout/src/common/PageHeader';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';
import useBottomSearchPanel from '@pkg-layout/src/common/hooks/useBottomSearchPanel';
import BottomSearchPanelContext from '@pkg-layout/src/common/contexts/BottomSearchPanelContext';
import { BulkActionsStepper } from '@pkg-list/components/bulkActions/BulkActions';

export default function PageListProvider({
  pageId,
  baseDataTestId,
  forbiddenImage,
  errorImage,
  serverErrorImage,
  heroImage,
  overrides,
}) {
  const [schemas, setSchemas] = useState<AnyType>(null);
  const [selectedRow, setSelectedRow] = useState<AnyType>(null);
  const bottomSearchPanel = useBottomSearchPanel();
  const parentBottomSearchPanel = useContext(BottomSearchPanelContext);
  const { isBottomSearchPanelVisible, hideBottomSearchPanel, showBottomSearchPanel } =
    bottomSearchPanel;
  const { clearDirtyFlags } = useFormManagerContext();

  const setAllSchemas = useCallback((schemas) => {
    setSchemas(schemas);
  }, []);

  const configuration = useMemo(() => {
    if (!schemas?.configuration) {
      return null;
    }
    return schemas?.configuration;
  }, [pageId, schemas]);

  const filterUiSchema = useMemo(() => {
    if (!schemas?.uiSchema) {
      return null;
    }
    return schemas.uiSchema;
  }, [pageId, schemas]);

  const namespace = useMemo(() => {
    return (
      (configuration &&
        (configuration['ui:labels']?.namespace_header || configuration['ui:labels']?.namespace)) ||
      ''
    );
  }, [configuration]);

  const mandatoryBulkActionCriterion = useMemo(() => {
    return configuration?.['ui:mandatoryBulkActionCriterion'] || null;
  }, [configuration]);

  const filterNamespace = useMemo(() => {
    return filterUiSchema?.['ui:labels']?.namespace ?? '';
  }, [filterUiSchema]);

  const permissionKey = useMemo(() => {
    const uiPage = configuration?.['ui:page'];
    const { permissionKey } = uiPage ?? {};
    return permissionKey || configuration?.permissionKey;
  }, [configuration]);

  const schemaPageId = useMemo(() => {
    return configuration?.tableId;
  }, [configuration?.tableId]);

  const rowId = useMemo(() => {
    return configuration?.rowId;
  }, [configuration?.rowId]);

  const { applyCriteria, criteria } = useTable(configuration?.tableId);

  const bulkActionSelectionsEnabled = useMemo(() => {
    if (!mandatoryBulkActionCriterion) {
      return true;
    }
    return !!criteria[mandatoryBulkActionCriterion];
  }, [mandatoryBulkActionCriterion, criteria]);

  useEffect(() => {
    if (globalThis.LIST !== 'undefined') {
      globalThis.LIST = configuration?.tableId;
    }
  }, [configuration]);

  useEffect(() => {
    return () => {
      clearDirtyFlags(pageId);
    };
  }, [pageId]);

  useEffect(() => {
    setSelectedRow(null);
    globalThis.ROW = null;
  }, [pageId, configuration?.tableId]);

  useEffect(() => {
    showBottomSearchPanel();
  }, [pageId, configuration?.tableId, showBottomSearchPanel]);

  const tableConfig = useMemo(() => {
    if (!configuration) {
      return null;
    }

    return {
      ...configuration,
      baseDataTestId,
      maintainFilters: true,
      columns: [...(configuration.columns ?? [])],
      ...(configuration.selections
        ? {
            selections: {
              ...configuration.selections,
              enabled: bulkActionSelectionsEnabled,
            },
          }
        : {}),
    };
  }, [configuration, baseDataTestId, bulkActionSelectionsEnabled]);

  const isPermissionAllowed = usePermissions(permissionKey);

  const handleRowClick = useCallback(
    (event: CustomEvent<{ tableId: string; row: AnyType }>) => {
      if (event.detail.tableId !== configuration?.tableId) return;
      const row = event.detail.row;

      if (row?.[rowId] === selectedRow?.[rowId]) {
        setSelectedRow(null);
        if (globalThis.ROW !== 'undefined') {
          globalThis.ROW = null;
        }
      } else {
        setSelectedRow(row);
      }
    },
    [configuration?.tableId, selectedRow?.[rowId]],
  );

  useEffect(() => {
    if (configuration?.quickView?.enabled) {
      globalThis.addEventListener('table-row-click', handleRowClick as EventListener);
    }
    return () => {
      globalThis.removeEventListener('table-row-click', handleRowClick as EventListener);
    };
  }, [configuration?.quickView?.enabled, handleRowClick]);

  const buttons = useMemo(() => {
    if (!tableConfig) {
      return;
    }
    return tableConfig['ui:buttons'];
  }, [tableConfig]);

  const handleSubmit = useCallback(() => {
    hideBottomSearchPanel();
    globalThis.window?.scrollTo({ top: 0, behavior: 'smooth' });
    applyCriteria();
  }, [applyCriteria, hideBottomSearchPanel]);

  return (
    <AccessController
      pageId={pageId}
      idKey={null}
      ForbiddenImage={forbiddenImage}
      ServerErrorImage={serverErrorImage}
      permissionKey={permissionKey}
    >
      <SchemasController
        pageId={pageId}
        screenType={SEARCH_FORM}
        onSchemasReady={setAllSchemas}
        errorLayout={<ErrorLayout image={errorImage} message="serverError" />}
      >
        {isPermissionAllowed && schemaPageId === pageId ? (
          <TranslationsController
            pageId={pageId}
            namespace={namespace}
            filterNamespace={filterNamespace}
            codelists={DEFAULT_CODELISTS}
          >
            <PageContent pageId={pageId} sidePanel={false}>
              <BottomSearchPanelContext.Provider
                value={parentBottomSearchPanel ?? bottomSearchPanel}
              >
                {tableConfig?.filtersType === 'TOP' ? (
                  <Grid
                    container
                    alignItems={'center'}
                    justifyContent={'space-between'}
                    sx={{ marginBottom: 4 }}
                  >
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                      <PageHeader heroImage={heroImage} overrides={overrides} />
                    </Grid>
                    <Grid
                      size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}
                      sx={{ marginTop: '100px' }}
                    >
                      <Box sx={{ alignItems: 'flex-end', display: 'flex', gap: 2 }}>
                        <AppActions
                          page={{ id: pageId, refersTo: tableConfig?.tableId }}
                          actions={buttons}
                          checkPermissions={true}
                          sx={{
                            alignItems: 'flex-end',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <Box sx={{ marginBottom: 4, marginTop: 4 }}>
                    <PageHeader heroImage={heroImage} overrides={overrides} />
                  </Box>
                )}

                <Box sx={{ marginTop: tableConfig?.filtersType === 'TOP' ? '12px' : '160px' }}>
                  <Box sx={{ marginBottom: 3 }}>
                    {mandatoryBulkActionCriterion && (
                      <BulkActionsStepper
                        tableId={configuration.tableId}
                        mandatoryBulkActionCriterion={{
                          criterion: mandatoryBulkActionCriterion,
                          namespace: filterNamespace ?? COMMON,
                        }}
                        filterSchema={schemas?.schema}
                        filterUiSchema={schemas?.uiSchema}
                        inlineFilter={configuration?.['ui:bulkActionInlineFilter'] ?? false}
                      />
                    )}
                  </Box>

                  <GenericTable
                    filterSchema={schemas?.schema}
                    filterUiSchema={schemas?.uiSchema}
                    configuration={tableConfig}
                    buttonsPosition={tableConfig?.filtersType === 'TOP' ? 'PAGE_LEVEL' : 'EMBEDDED'}
                  />
                  {isBottomSearchPanelVisible && tableConfig?.filtersType === 'TOP' && (
                    <Box sx={{ marginTop: 3, marginBottom: 2 }}>
                      <BottomSearchPanel pageId={pageId} onSubmit={handleSubmit} />
                    </Box>
                  )}
                </Box>

                {configuration?.quickView?.enabled && (
                  <QuickView
                    idKey={rowId}
                    pageId={configuration?.quickView?.schemaId ?? schemaPageId}
                    rowData={selectedRow}
                    onClose={() => setSelectedRow(null)}
                    quickView={{
                      ...configuration?.quickView,
                    }}
                    url={tableConfig?.url}
                  />
                )}
              </BottomSearchPanelContext.Provider>
            </PageContent>
          </TranslationsController>
        ) : null}
      </SchemasController>
    </AccessController>
  );
}
