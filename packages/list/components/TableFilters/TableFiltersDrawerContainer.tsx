import React from 'react';
import TableFilters from './TableFilters';
import AppDrawer from '@pkg-common/drawer/AppDrawer';
import { FILTERS_PANEL } from '@pkg-constants/formIds';
import { TableFiltersContainerProps } from './TableFiltersContainer.d';
import useDrawer from '@pkg-common/drawer/useDrawer';
import { focusElement } from '@pkg-common/utils/utils';
import { FILTERS_BTN_ID } from '@pkg-constants/formCommon';

const TableFiltersDrawerContainer = ({
  filtering,
  parentId,
  tableId,
}: TableFiltersContainerProps) => {
  const { closeDrawer } = useDrawer(`${parentId}_${tableId}_${FILTERS_PANEL}`);
  return (
    <AppDrawer
      drawerId={`${parentId}_${tableId}_${FILTERS_PANEL}`}
      closeButtonId={`${tableId}-filter-close-btn`}
      title="searchText"
      keepMounted={true}
      role="dialog"
      variant={'temporary'}
      onClose={() => focusElement(`${tableId}${FILTERS_BTN_ID}`)}
    >
      <TableFilters
        id={tableId}
        jsonSchema={filtering.schema || {}}
        uiSchema={filtering.uiSchema || {}}
        parentId={parentId}
        onClose={() => {
          closeDrawer();
          focusElement(`${tableId}${FILTERS_BTN_ID}`);
        }}
        type={'DRAWER'}
      />
    </AppDrawer>
  );
};

export default TableFiltersDrawerContainer;
