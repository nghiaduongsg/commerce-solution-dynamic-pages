import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Badge, Box, Table, Typography } from '@mui/material';
import { TableProps } from './GenericDefaultTable.d';
import useTable from '@pkg-list/hooks/useTable';
import TableHeader from './GenericTableHeader/GenericTableHeader';
import TableBody from './GenericTableBody/GenericTableBody';
import TableFooter from './GenericTableFooter/GenericTableFooter';
import LinearLoader from '@pkg-common/components/LinearLoader/LinearLoader';
import GenericTablePanel from './GenericTablePanel/GenericTablePanel';
import PanelActions from './PanelActions/PanelActions';
import GenericDefaultTableForm from './GenericDefaultTableForm/GenericDefaultTableForm';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useCodeListWidget from '@pkg-form/components/SelectCodeListWidget/hooks/useCodeListWidget';
import { CodeListItem } from '@pkg-core/codeList/redux/types';
import GenericCard from '@pkg-common/atomics/GenericCard/GenericCard';
import TableFiltersSummary from '@pkg-list/components/TableFilters/TableFiltersSummary';
import TableFiltersContainer from '@pkg-list/components/TableFilters/TableFiltersContainer';
import { useTranslation } from 'react-i18next';
import { getStyles } from '@pkg-list/components/GenericTableStyles/styles';
import useSystem from '@pkg-setup/src/system/useSystem';
import ColumnSelector from './ColumnSelector/ColumnSelector';
import { useTheme } from '@mui/material/styles';
import TranslationsElementController from '@pkg-core/TranslationsElementController';
import TableSelectionsSummary from '@pkg-list/components/TableSelectionsSummary';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';

const GenericDefaultTable = ({
  filtering,
  configuration,
  entityUrl,
  parentId,
  headerContent,
  rowContent,
  changeIndicators,
  onExpanded,
  buttonsPosition = 'EMBEDDED',
}: TableProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const {
    subTitle,
    showTitle = true,
    title,
    exportable,
    exportOptions,
    tableId,
    pagination,
    actions = {},
    selections = {
      enabled: false,
      multiple: false,
      allowSelectAll: false,
      comparable: false,
      summary: { enabled: false, labelPath: [] },
    },
    actionDetails,
    baseDataTestId,
    collapsible = false,
    columnConfigurable = true,
    heightAdjustable = true,
    addNumberOfLines = false,
    filtersType = 'DRAWER',
    filtersMode = 'ON_CLICK',
    // @ts-ignore
    actionDetailsCodeList = false,
    uploadEntity,
    unfolded = false,
    expanded = false,
    rowId,
    styleOverrides,
    showActions = true,
    icon,
    emptyStateBanner = {
      enabled: false,
      message: 'defaultEmptyStateMessage',
    },
    'ui:mandatoryBulkActionCriterion': mandatoryBulkActionCriterion,
  } = configuration;

  const bannerNamespace = emptyStateBanner?.namespace ?? configuration?.['ui:labels']?.namespace;

  const { t: translateBanner } = useTranslation(bannerNamespace);

  const { summary = { enabled: false, labelPath: [] } } = selections || {};
  const { enabled: includeSummary, labelPath: summaryLabelPath } = summary || {};

  const [actionDetailsFinalList, setActionDetailsFinalList] = useState<Array<CodeListItem>>([]);

  const { apiValues = undefined, url = undefined } = actionDetailsCodeList
    ? actionDetails?.createEntity?.selectCodeList ?? {}
    : {};

  const { list: actionDetailsList } = useCodeListWidget(tableId, apiValues || {});

  const { visibleColumns, hasNoData, loading, tableData, selectedEntities, maxLimit } =
    useTable(tableId);

  const effectiveSelections = useMemo(() => ({ ...selections, maxLimit }), [selections, maxLimit]);

  useEffect(() => {
    if (actionDetailsList?.length > 0) {
      setActionDetailsFinalList(actionDetailsList);
    }
  }, [actionDetailsList, setActionDetailsFinalList, entityUrl]);

  const namespace = useMemo(() => {
    if (!configuration) {
      return '';
    }
    return configuration['ui:labels']?.namespace || '';
  }, [configuration]);

  const buttons = useMemo(() => {
    if (!configuration || configuration?.isDisabled) {
      return;
    }

    return configuration['ui:buttons'];
  }, [configuration]);

  const rowButtons = useMemo(() => {
    if (!configuration) {
      return;
    }
    return configuration['ui:row:buttons'];
  }, [configuration]);

  const isFilteringEnabled = filtering?.enabled || false;

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([namespace, ACCESSIBILITY, COMMON]);
  const [expand, setExpand] = useState(unfolded);

  const elementId = useMemo(() => {
    if (parentId) {
      return `${tableId}-${parentId}`;
    }
    return tableId;
  }, [tableId, parentId]);

  const toggleExpand = useCallback(() => {
    setExpand((expand) => !expand);
  }, []);

  const { uiSchema: filterUISchema = {} } = filtering || {};
  const filtersNamespace = useMemo(() => {
    return filterUISchema['ui:labels']?.namespace || '';
  }, [filterUISchema]);

  const showTopFilters = useMemo(() => {
    return configuration?.filtersType === 'TOP';
  }, [configuration?.filtersType]);

  // TODO: temp code for dashboard POC
  if (!tableData?.length && emptyStateBanner?.enabled) {
    return (
      <TranslationsElementController
        namespace={namespace}
        skeletonProps={{ variant: 'rectangular', width: '100%', height: '100px' }}
      >
        {isFilteringEnabled && showTopFilters ? (
          <TableFiltersContainer
            tableId={tableId}
            parentId={parentId}
            filtering={filtering}
            type={filtersType}
            mode={filtersMode}
          />
        ) : null}
        <GenericCard
          id={tableId}
          title={'instructionsBanner'}
          showTitle={false}
          styleOverrides={{
            ...styleOverrides,
            card: {
              ...styleOverrides?.card,
              backgroundColor: emptyStateBanner?.bgColor,
              marginTop: theme.spacing(0.5),
            },
            cardContent: {
              ...styleOverrides?.cardContent,
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'column',
              padding: theme.spacing(6),
            },
          }}
        >
          <AssetByType
            name={icon ?? ''}
            props={{ sx: { color: 'white', height: '50px', width: '50px' } }}
            input={'icons'}
          />
          <Typography
            component={'span'}
            variant={'body1'}
            sx={{ color: 'white', marginTop: '12px' }}
          >
            {translateBanner(emptyStateBanner?.message ?? '', {
              ns: bannerNamespace,
              lng: selectedLanguage,
            })}
          </Typography>
        </GenericCard>
      </TranslationsElementController>
    );
  }

  return (
    <TranslationsElementController
      namespace={namespace}
      skeletonProps={{ variant: 'rectangular', width: '100%', height: '100px' }}
    >
      {includeSummary && selectedEntities?.length > 0 && (
        <TableSelectionsSummary tableId={tableId} rowId={rowId} labelPath={summaryLabelPath} />
      )}

      {isFilteringEnabled && showTopFilters ? (
        <TableFiltersContainer
          tableId={tableId}
          parentId={parentId}
          filtering={filtering}
          type={filtersType}
          mode={filtersMode}
        />
      ) : null}

      <GenericCard
        id={tableId}
        collapsible={collapsible}
        expanded={expanded}
        showTitle={showTitle}
        icon={icon}
        wrapsTable={true}
        onExpanded={onExpanded}
        styleOverrides={{
          card: {
            ...styleOverrides?.card,
            marginTop: theme.spacing(1),
          },
          cardContent: {
            position: 'sticky',
            zIndex: 1,
            padding: 0,
            marginTop: theme.spacing(0.5),
            ...styleOverrides?.cardContent,
          },
          cardHeader: {
            position: 'sticky',
            top: 0,
            zIndex: 2,
            ...styleOverrides?.cardHeader,
          },
          cardHeaderIcon: styleOverrides?.cardHeaderIcon,
        }}
        title={
          <>
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: theme.spacing(2) }}>
              <Typography
                component="h3"
                variant="body1"
                id={`${tableId}-card-title`}
                sx={styleOverrides?.cardHeaderText}
              >
                {translate(title || tableId, { ns: namespace, lng: selectedLanguage })}
              </Typography>
              {addNumberOfLines && tableData?.length > 0 ? (
                <Box sx={styles.tableCardBadge}>
                  <Badge badgeContent={`${tableData?.length}`} color="primary" />
                </Box>
              ) : null}
            </div>
            {subTitle && (
              <div style={{ marginLeft: theme.spacing(2) }}>
                <Typography variant="body2" component="h3" sx={styles.tableCardSubtitle}>
                  {translate(subTitle, { ns: namespace, lng: selectedLanguage })}
                </Typography>
              </div>
            )}
          </>
        }
        actions={
          showActions ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <GenericTablePanel
                filtering={filtering || { enabled: false }}
                parentId={parentId}
                filtersType={filtersType}
                exportable={exportable}
                exportOptions={exportOptions}
                namespace={namespace}
                tableId={tableId}
                baseDataTestId={baseDataTestId}
                columnConfigurable={columnConfigurable}
                heightAdjustable={heightAdjustable}
                showLocalSigns={configuration?.local?.enabled || false}
                onTableExpand={toggleExpand}
                headerContent={headerContent}
                uploadEntity={uploadEntity}
                expanded={expand}
                actionButtons={
                  buttonsPosition === 'EMBEDDED' && !configuration?.isDisabled ? (
                    <PanelActions
                      tableId={tableId}
                      actionDetailsCodeList={actionDetailsCodeList}
                      actionDetailsList={actionDetailsCodeList && actionDetailsFinalList}
                      actionDetailsUrl={actionDetailsCodeList && url}
                      actionDetails={actionDetails}
                      baseDataTestId={baseDataTestId}
                      actions={actions || { create: true }}
                      entityUrl={entityUrl}
                      buttons={buttons}
                      namespace={namespace}
                    />
                  ) : null
                }
              />
            </Box>
          ) : null
        }
      >
        <>
          <ColumnSelector
            tableName={translate(title || tableId, { ns: namespace, lng: selectedLanguage })}
            tableId={tableId}
            parentId={parentId}
            namespace={namespace}
            type={filtersType}
          />

          {isFilteringEnabled && !showTopFilters && (
            <TableFiltersContainer
              tableId={tableId}
              parentId={parentId}
              filtering={filtering}
              type={filtersType}
              mode={filtersMode}
            />
          )}

          {isFilteringEnabled && filtersMode !== 'QUICK_FILTER' && (
            <TableFiltersSummary
              tableId={tableId}
              namespace={filtersNamespace}
              baseDataTestId={baseDataTestId}
              filterUiSchema={filterUISchema}
            />
          )}
          {loading && (
            <LinearLoader
              styles={{ marginTop: 0 }}
              ariaLabel={translate('loadingElement', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
                element: translate(title || tableId, { ns: namespace, lng: selectedLanguage }),
              })}
            />
          )}
          <Box
            sx={{
              maxHeight: `${expand ? 'auto' : '460px'}`,

              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                overflow: hasNoData ? 'hidden' : 'auto',
              }}
            >
              <Table
                id={`${tableId}-table`}
                data-testid={elementId}
                role={'table'}
                aria-label={translate(title ?? tableId, { ns: namespace, lng: selectedLanguage })}
                onKeyDown={(e) => {
                  const activeElementRow = document.activeElement;
                  let element: any;
                  if (e.code === 'ArrowUp') {
                    element = activeElementRow?.previousSibling;
                  } else if (e.code === 'ArrowDown') {
                    element = activeElementRow?.nextSibling;
                  }
                  if (element?.nodeName === 'TR') {
                    window.ROW = element?.id;
                    const timeout = setTimeout(() => {
                      element.focus();
                      if (timeout) {
                        clearTimeout(timeout);
                      }
                    }, 50);
                  }
                }}
              >
                {visibleColumns?.length > 0 && (
                  <TableHeader
                    namespaces={[namespace]}
                    baseDataTestId={baseDataTestId}
                    tableId={tableId}
                    selections={effectiveSelections}
                    hasRowActions={!!rowButtons?.buttons?.length}
                    hasMandatoryBulkActionCriterion={!!mandatoryBulkActionCriterion}
                  />
                )}
                <TableBody
                  namespaces={[namespace]}
                  configuration={configuration}
                  tableId={tableId}
                  selections={effectiveSelections}
                  actionDetails={actionDetails}
                  parentId={parentId}
                  rowButtons={rowButtons}
                  mode={configuration?.local?.enabled ? 'LOCAL' : 'DEFAULT'}
                  rowContent={rowContent}
                  changeIndicators={changeIndicators}
                />
              </Table>
            </Box>

            {(pagination?.enabled || effectiveSelections?.enabled) && (
              <Box sx={styles.tableFooterContainer}>
                <TableFooter
                  tableId={tableId}
                  parentId={parentId}
                  pagination={pagination}
                  selections={effectiveSelections}
                />
              </Box>
            )}
          </Box>
        </>
      </GenericCard>

      <GenericDefaultTableForm configuration={configuration} title={translate(`${tableId}Form`)} />
    </TranslationsElementController>
  );
};

export default GenericDefaultTable;
