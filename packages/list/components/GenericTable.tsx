import React, { useCallback, useEffect, useMemo, useState } from 'react';

import useTable from '@pkg-list/hooks/useTable';
import useResolvedDefaultCriteria from '@pkg-list/hooks/useResolvedDefaultCriteria';
import GenericDefaultTable from './GenericDefaultTable';
import { isEqual, isUndefined } from 'lodash';
import { GenericTableProps } from './GenericTable.d';
import useDynamicApi from '@pkg-common/dataResolver/useDynamicApi';
import { useSelector } from 'react-redux';
import { selectPressedSignatureKey } from '@pkg-common/button/selectors';
import useSystem from '@pkg-setup/src/system/useSystem';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { useTranslation } from 'react-i18next';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { getJsonPathFromWidgetId } from '@pkg-form/validations/utils/widgetUtils';
import useFormData from '@pkg-common/dataResolver/useFormData';
import { REFRESH_LIST_SHORTCUT } from '@pkg-constants/keyboardShortcuts';
import { Box, useTheme } from '@mui/material';
import { setAnnouncement } from '@pkg-form/validations/utils/formUtils';
import FilterGroupSelector from '@pkg-list/components/FilterGroupSelector/FilterFroupSelector';
import useFilterSettings from '@pkg-setup/src/userSettings/useFilterSettings';
import { hasValue } from '@pkg-common/utils';
import { getActiveCriteriaCount } from '@pkg-list/utils/tableRowUtils';

const GenericTable = ({
  parentId,
  configuration,
  filterSchema,
  filterUiSchema,
  entityUrl,
  disabled,
  headerContent,
  rowContent,
  fieldId,
  hasRefreshButton = true,
  initialState,
  changeIndicators,
  filterSaveSupport = true,
  delayInitialisation = false,
  buttonsPosition = 'EMBEDDED',
}: GenericTableProps) => {
  const theme = useTheme();
  const {
    tableId,
    rowId,
    columns: defaultColumns,
    innerColumns: defaultInnerColumns,
    pagination = { enabled: false, defaultPageSize: 10 },
    renderWithNoData = true,
    parentEntity,
    filterEntities = false,
    openFilters = false,
    refreshable = hasRefreshButton,
    actionsType = 'redirect',
    apiValues = { url: configuration?.url },
    valueFrom,
    tableData,
    permissionLoadKey,
    avoidDefaultLoad = false,
    refreshFromButtons,
    removableQueries,
    selections,
    defaultSortBy,
    defaultCriteria,
    sortTieBreaker,
    collapsible,
    maintainFilters = false,
  } = configuration || {};

  const [expandedOnce, setExpandedOnce] = useState(false);

  const hasRequiredFields = useMemo(() => {
    if (!filterUiSchema) {
      return false;
    }
    const requiredFields = Object.keys(filterUiSchema)?.filter((key) => {
      return !!filterUiSchema[key]?.['ui:options']?.validations?.required;
    });

    return requiredFields?.length > 0;
  }, [filterUiSchema]);

  const multiple = useMemo(() => {
    return selections?.multiple || false;
  }, [selections?.multiple]);

  const { formData } = useEntityFormData(parentId);
  const refreshFromButtonPress = useSelector(selectPressedSignatureKey(refreshFromButtons || []));
  const { value: fixedTableData } = useFormData(tableId, valueFrom);

  const { securableObjects, applyPermissions, selectedLanguage, sourceCurrencyMode } = useSystem();

  const {
    criteria,
    loadTableData,
    initTable,
    pageSize,
    page,
    sortBy,
    refresh,
    predefinedCriteria,
    hasNoData,
    innerColumns,
    all,
    setTableData,
    triggerRefresh,
    allSelectedRows = { 0: {} },
    loading,
    totalItems,
    applyCriteria,
    initialised,
    setPredefinedCriteria,
  } = useTable(tableId);

  const { lastSavedParsedCriteria, lastSavedGroup, lastSavedCriteria } = useFilterSettings(
    tableId,
  );

  const initialSortBy = useMemo(() => {
    return sortBy || defaultSortBy;
  }, [sortBy, defaultSortBy]);

  const resolvedDefaultCriteria = useResolvedDefaultCriteria(tableId, defaultCriteria);

  const namespace = useMemo(() => {
    if (!configuration) {
      return '';
    }
    return configuration['ui:labels']?.namespace || '';
  }, [configuration]);

  const wrapFilterTo = useMemo(() => {
    if (!filterUiSchema) {
      return '';
    }
    return (!!filterUiSchema['ui:common'] && filterUiSchema['ui:common']?.wrapFilterTo) || '';
  }, [configuration]);

  const refreshTriggeredFromButtonPress = useMemo(() => {
    if (refreshFromButtons) {
      return refreshFromButtonPress;
    }
    return false;
  }, [refreshFromButtonPress]);

  const {
    url,
    data: dataValues,
    dataValuesReady,
    queryParams,
    urlReady,
    method,
  } = useDynamicApi(parentId ?? tableId, apiValues);

  const effectiveQueryParams = useMemo(() => {
    if (hasValue(apiValues?.queryFrom) && Array.isArray(removableQueries)) {
      const result = { ...queryParams };
      removableQueries?.forEach((q) => {
        if (!hasValue(predefinedCriteria?.[q])) {
          delete result[q];
        }
      });
      return result;
    }

    return queryParams;
  }, [queryParams, predefinedCriteria, removableQueries, apiValues?.queryFrom]);

  const dataFromServer = useMemo(() => {
    return configuration?.tableId && (configuration?.url || configuration?.apiValues);
  }, [configuration]);

  const isPermissionAllowed = useMemo(() => {
    return !applyPermissions ? true : securableObjects[permissionLoadKey ?? ''];
  }, [permissionLoadKey, securableObjects, applyPermissions]);

  useEffect(() => {
    if (refreshTriggeredFromButtonPress) {
      setTimeout(() => {
        triggerRefresh();
      });
    }
  }, [triggerRefresh, refreshTriggeredFromButtonPress]);

  const tableColumns = useMemo(() => {
    return (defaultColumns ?? [])?.filter((c) => {
      if (isUndefined(c.visibleWhenSourceMode)) {
        return true;
      }
      return (
        (c.visibleWhenSourceMode && sourceCurrencyMode === 'Y') ||
        (!c.visibleWhenSourceMode && sourceCurrencyMode === 'N')
      );
    });
  }, [defaultColumns, sourceCurrencyMode]);

  useEffect(() => {
    setExpandedOnce(false);
  }, [tableId]);

  const innerTableColumns = useMemo(() => {
    if (!(innerColumns || []).length) {
      return defaultInnerColumns;
    }
    return innerColumns;
  }, [defaultInnerColumns, innerColumns]);

  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY, namespace]);

  useEffect(() => {
    if (filterSaveSupport && initialised && lastSavedGroup && hasValue(lastSavedCriteria)) {
      try {
        const obj = JSON.parse(lastSavedCriteria);
        setTimeout(() => applyCriteria(obj), 0);
      } catch {
        console.error('Failed to apply criteria, wrong format');
      }
    }
  }, [lastSavedGroup, lastSavedCriteria, applyCriteria, initialised]);

  useEffect(() => {
    const initialiseTable = !collapsible || !delayInitialisation ? true : expandedOnce;
    if (!initialised && initialiseTable) {
      let initialData = {};

      try {
        initialData = initialState ? JSON.parse(initialState ?? {}) : {};
      } catch (e) {
        console.error('Error parsing initial state', e);
      }

      try {
        initTable({
          sortBy: initialSortBy,
          columns: tableColumns,
          innerColumns: innerTableColumns,
          rowIdKey: rowId,
          criteria: {
            ...resolvedDefaultCriteria,
            ...lastSavedParsedCriteria,
          },
          filterData: {
            ...resolvedDefaultCriteria,
            ...lastSavedParsedCriteria,
            ...predefinedCriteria,
          },
          wrappedToFilter: wrapFilterTo,
          predefinedCriteria: queryParams,
          removableQueries,
          selectedRowIds: allSelectedRows,
          filterEntities,
          pagination: {
            ...(all?.pagination || {}),
            requestedPageSize: pageSize ?? pagination?.defaultPageSize ?? 10,
            currentPageNumber: 0,
          },
          url,
          entityUrl,
          parentEntity,
          disabled,
          actionsType,
          multiple,
          sortTieBreaker,
          maintainFilters,
          ...initialData,
        });
      } catch (e) {
        console.error('Error initializing table', e);
      }
    }
  }, [
    url,
    rowId,
    entityUrl,
    filterEntities,
    tableColumns,
    initialised,
    queryParams,
    removableQueries,
    predefinedCriteria,
    criteria,
    wrapFilterTo,
    initTable,
    dataFromServer,
    parentId,
    initialState,
    multiple,
    initialSortBy,
    lastSavedParsedCriteria,
    expandedOnce,
    collapsible,
    delayInitialisation,
    maintainFilters,
  ]);

  const initialPageSize = useMemo(() => {
    if (!pagination) {
      return -1;
    }
    return pageSize || pagination.defaultPageSize;
  }, [pageSize, pagination]);

  const [allowLoading, setAllowLoading] = useState(false);

  useEffect(() => {
    const handleToggleEvent = (event) => {
      setAllowLoading(event.detail);
    };

    window.addEventListener('expandAccordions', handleToggleEvent);

    return () => {
      window.removeEventListener('expandAccordions', handleToggleEvent);
    };
  }, []);

  useEffect(() => {
    if (
      apiValues?.queryFrom &&
      hasValue(predefinedCriteria) &&
      !isEqual(predefinedCriteria, effectiveQueryParams)
    ) {
      setPredefinedCriteria(effectiveQueryParams);
    }
  }, [effectiveQueryParams, predefinedCriteria, apiValues?.queryFrom]);

  useEffect(() => {
    const hasCriteria = getActiveCriteriaCount(criteria) > 0;

    const avoidLoad = avoidDefaultLoad || hasRequiredFields;

    if (avoidLoad && !refresh && !hasCriteria) return;

    const paginationReady = initialPageSize !== -1;
    const shouldSkipDefaultLoad = !avoidLoad || refresh || hasCriteria || !allowLoading;
    const shouldLoadData =
      initialised &&
      urlReady &&
      dataValuesReady &&
      isPermissionAllowed &&
      paginationReady &&
      shouldSkipDefaultLoad;

    if (!shouldLoadData) return;

    if (tableId === 'CORRECTIONS_TABLE' && fieldId) {
      const path = getJsonPathFromWidgetId(fieldId).join('.');
      const existingData = formData?.formCorrections[path] ?? [];

      if (existingData?.length > 0) {
        setTableData({ data: existingData });
        return;
      }
    }

    loadTableData(
      new Date().getTime(),
      criteria,
      page,
      initialPageSize,
      initialSortBy,
      apiValues,
      url,
      dataValues,
      method,
      effectiveQueryParams,
    );
  }, [
    criteria,
    page,
    initialPageSize,
    initialSortBy,
    avoidDefaultLoad,
    hasRequiredFields,
    refresh,
    loadTableData,
    url,
    dataValues,
    fieldId,
    initialised,
    effectiveQueryParams,
  ]);

  //when we set the tableData in schema , such as taxpayer/activity
  useEffect(() => {
    if (!fieldId && (tableData || fixedTableData)) {
      setTableData({
        data: tableData || fixedTableData,
      });
    }
  }, [tableData, fieldId, setTableData, fixedTableData]);

  useEffect(() => {
    if (tableId) {
      window.LIST = tableId;
    }
  }, [tableId]);

  const onFocus = useCallback(() => {
    if (configuration?.tableId) {
      window.LIST = configuration?.tableId;
    }
  }, [configuration]);

  useEffect(() => {
    if (!initialised) {
      return;
    }
    if (loading) {
      setAnnouncement(
        `${tableId}-alert-help-text-table`,
        translate('tableDataLoading', { ns: ACCESSIBILITY, lng: selectedLanguage }),
      );
      return;
    }
    const criteriaNumber = getActiveCriteriaCount(criteria);

    if (sortBy?.includes(':asc') || sortBy?.includes(':desc')) {
      setAnnouncement(
        `${tableId}-alert-help-text-table`,
        translate('tableDataLoadedWithSort', {
          ns: ACCESSIBILITY,
          lng: selectedLanguage,
          sort: sortBy,
          filters: criteriaNumber,
          count: totalItems,
          page,
        }),
      );
    } else {
      setAnnouncement(
        `${tableId}-alert-help-text-table`,
        translate('tableDataLoaded', {
          ns: ACCESSIBILITY,
          lng: selectedLanguage,
          filters: criteriaNumber,
          count: totalItems,
          page,
        }),
      );
    }
  }, [criteria, page, sortBy, totalItems, page, initialised]);

  if (hasNoData && renderWithNoData === false) {
    return null;
  }
  const shouldRefresh = refreshable && !hasRequiredFields;

  return (
    <GenericDefaultTable
      filtering={{
        openFilters,
        enabled: filterEntities,
        schema: filterSchema,
        uiSchema: filterUiSchema,
      }}
      onFocus={onFocus}
      configuration={configuration}
      entityUrl={entityUrl}
      parentId={parentId}
      changeIndicators={changeIndicators}
      buttonsPosition={buttonsPosition}
      onExpanded={() => {
        setExpandedOnce(true);
      }}
      headerContent={
        <>
          <Box
            id={`${tableId}-alert-help-text-table`}
            role={'alert'}
            aria-live={'polite'}
            sx={{
              marginRight: theme.spacing(1),
              fontSize: theme.typography.body2.fontSize,
            }}
          />
          {filterSaveSupport && <FilterGroupSelector tableId={tableId} />}

          {shouldRefresh && !fixedTableData && apiValues?.url && (
            <GenericIconButton
              id={`${tableId}-load-btn`}
              testId="refresh-btn"
              icon={<AssetByType input="icons" name="Autorenew" />}
              ariaKeyboardShortcuts={REFRESH_LIST_SHORTCUT}
              ariaLabel={translate('loadDataButtonAriaLabel', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
                table: translate(tableId, { ns: namespace, lng: selectedLanguage }),
              })}
              ariaExpanded={undefined}
              onClick={() => {
                triggerRefresh();
              }}
            />
          )}
          {headerContent}
        </>
      }
      rowContent={rowContent}
    />
  );
};

export default React.memo(GenericTable);
