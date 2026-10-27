import React from 'react';
import TableFiltersCollapsibleContainer from './TableFiltersCollapsibleContainer';
import TableFiltersDrawerContainer from './TableFiltersDrawerContainer';
import { TableFiltersContainerProps } from './TableFiltersContainer.d';
import TableFiltersStackedContainer from '@pkg-list/components/TableFilters/TableFiltersStackedContainer';

const TableFiltersContainer = ({
  filtering,
  parentId,
  tableId,
  type,
  mode = 'ON_CLICK',
}: TableFiltersContainerProps) => {
  if (type === 'TOP') {
    return (
      <TableFiltersStackedContainer
        id={tableId}
        schema={filtering?.schema}
        uiSchema={filtering?.uiSchema}
        mode={mode}
      />
    );
  }

  return type === 'COLLAPSE' ? (
    <TableFiltersCollapsibleContainer
      filtering={filtering}
      parentId={parentId}
      tableId={tableId}
      mode={mode}
    />
  ) : (
    <TableFiltersDrawerContainer
      filtering={filtering}
      parentId={parentId}
      tableId={tableId}
      mode={mode}
    />
  );
};

export default TableFiltersContainer;
