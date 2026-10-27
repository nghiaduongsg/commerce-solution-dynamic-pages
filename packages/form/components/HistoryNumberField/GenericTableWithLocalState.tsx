import useDynamicApi from '@pkg-common/dataResolver/useDynamicApi';
import useTable from '@pkg-list/hooks/useTable';
import React, { useEffect, useMemo } from 'react';
import GenericDefaultTable from '@pkg-list/components/GenericDefaultTable';
import { urlHasAllParams } from '@pkg-common/utils/utils';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { getJsonPathFromWidgetId } from '@pkg-form/validations/utils/widgetUtils';
import useSystem from '@pkg-setup/src/system/useSystem';

const GenericTableWithLocalState = ({ uiSchema, id, disabled, parentEntityPrefix }) => {
  const options = uiSchema['ui:options'];
  const { apiValues, config, saveActionType, translation } = options;
  const { tableId, entityUrl, filterSchema, filterUiSchema } = config;
  const { formData } = useEntityFormData(parentEntityPrefix);
  const { url, queryParams = {} } = useDynamicApi(id, apiValues);
  const { namespace = '' } = translation || {};
  const namespaces = [namespace];

  const {
    clearTable,
    criteria,
    setTableData,
    loadTableData,
    initTable,
    pageSize,
    page,
    sortBy,
    refresh,
    hasNoData,
    all,
  } = useTable(tableId);

  const configuration = useMemo(() => {
    const paginationConfig = config?.pagination || {
      enabled: true,
      pageSizes: [5, 10, 15],
      defaultPageSize: 10,
    };

    return {
      ...config,
      queryParams,
      saveActionType,
      url,
      pagination: paginationConfig,
    };
  }, [url, queryParams, saveActionType, config]);

  const {
    columns: initialColumns,
    rowId,
    pagination,
    actions = {},
    renderWithNoData = true,
    parentEntity,
    actionsType = 'redirect',
    permissionLoadKey,
  } = configuration || {};

  const { filterEntities = true } = actions;

  const { securableObjects } = useSystem();
  const isAllowed = useMemo(() => {
    return securableObjects[permissionLoadKey];
  }, [permissionLoadKey, securableObjects]);

  useEffect(() => {
    initTable({
      columns: initialColumns,
      rowIdKey: rowId,
      pagination: {
        ...all.pagination,
        requestedPageSize: pagination?.defaultPageSize ?? 10,
      },
      url,
      queryParams,
      entityUrl,
      parentEntity,
      disabled,
      actionsType,
    });
  }, [url, rowId, entityUrl, filterEntities, initialColumns]);

  useEffect(() => {
    const shouldReturn = !urlHasAllParams(url) || !isAllowed;

    if (!shouldReturn) {
      if (formData.formCorrections[`$.${getJsonPathFromWidgetId(id).join('.')}`]) {
        setTableData({
          data: formData.formCorrections[`$.${getJsonPathFromWidgetId(id).join('.')}`],
        });
      } else {
        loadTableData(
          new Date().getTime(),
          criteria,
          page,
          pageSize || pagination?.defaultPageSize,
          sortBy,
          apiValues,
          url,
        );
      }
    }
  }, [
    isAllowed,
    formData.formCorrections,
    criteria,
    page,
    pageSize,
    sortBy,
    refresh,
    setTableData,
    loadTableData,
    pagination?.defaultPageSize,
    url,
    id,
  ]);

  useEffect(() => {
    return () => {
      clearTable();
    };
  }, [clearTable]);

  if (hasNoData && renderWithNoData === false) {
    return null;
  }

  return (
    <>
      <GenericDefaultTable
        filtering={{
          enabled: filterEntities,
          schema: filterSchema,
          uiSchema: filterUiSchema,
        } as any}
        configuration={configuration}
        entityUrl={entityUrl}
        parentId={parentEntityPrefix}
      />
    </>
  );
};

export default GenericTableWithLocalState;
