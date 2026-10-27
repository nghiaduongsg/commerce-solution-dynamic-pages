import React, { useCallback, useMemo } from 'react';
import ColumnSelectorCollapsible from './ColumnSelectorCollapsible';
import ColumnSelectorDrawer from './ColumnSelectorDrawer';
import useTable from '@pkg-list/hooks/useTable';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTranslation } from 'react-i18next';

const ColumnSelector = ({ parentId, tableId, tableName, type, namespace }) => {
  const {
    toggleTableColumn,
    columns = [],
    visibleColumns = [],
    innerColumns = [],
    innerVisibleColumns = [],
  } = useTable(tableId);

  const { selectedLanguage } = useSystem();
  const { t: translateColumn } = useTranslation(namespace);

  const onColumnVisibilityChange = useCallback(
    (selectedColumns) => {
      toggleTableColumn(selectedColumns);
    },
    [toggleTableColumn],
  );

  const selectedColumnValues = useMemo(() => {
    return [...visibleColumns, ...innerVisibleColumns].map((col) => col.name);
  }, [visibleColumns, innerVisibleColumns, selectedLanguage]);

  const columnOptions = useMemo(() => {
    const baseColumns = columns.map((col) => ({
      code: col.name,
      label: translateColumn(col.name, { ns: namespace, lng: selectedLanguage }),
    }));
    const secondaryColumns = innerColumns.map((col) => ({
      code: col.name,
      label: translateColumn(col.name, { ns: namespace, lng: selectedLanguage }),
    }));
    return [...baseColumns, ...secondaryColumns];
  }, [columns, innerColumns, selectedLanguage]);

  return type === 'COLLAPSE' ? (
    <ColumnSelectorCollapsible
      parentId={parentId}
      tableId={tableId}
      tableName={tableName}
      onColumnVisibilityChange={onColumnVisibilityChange}
      selectedColumnValues={selectedColumnValues}
      columnOptions={columnOptions}
    />
  ) : (
    <ColumnSelectorDrawer
      parentId={parentId}
      tableId={tableId}
      tableName={tableName}
      onColumnVisibilityChange={onColumnVisibilityChange}
      selectedColumnValues={selectedColumnValues}
      columnOptions={columnOptions}
    />
  );
};

export default ColumnSelector;
