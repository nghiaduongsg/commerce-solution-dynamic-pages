import { ReduxTablesState } from './types';
import { jpValueFirstLevel, objectHasValues } from '@pkg-common/utils/utils';
import { createSelector } from 'reselect';
import { TableState } from './types';

export const selectSlice =
  (id: string) =>
  (state: ReduxTablesState): TableState =>
    state.Tables[id] || {};

export const selectTable = (id: string) => (state: ReduxTablesState) => selectSlice(id)(state);
export const selectInitialised = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.initialised ?? false;

export const selectActiveRow = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.activeRow || {};
export const selectEntityUrl = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.entityUrl || '';
export const selectValidationsId = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.validationsId || selectSlice(id)(state)?.id;
export const selectIncludedBillSegmentsWithoutValue = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.includedBillSegmentsWithoutValue || [];
export const selectUrl = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.url || '';

export const selectRowIdKey = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.rowIdKey || '';
export const selectCheckedRowIds = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.selectedRowIds || {};
export const selectExtraTableData = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.extraTableData || {};
export const selectTableData = (id: string) => (state: ReduxTablesState) => {
  const slice = selectSlice(id)(state);
  const { pageData, localData } = slice || {};
  const localIds = (localData || []).map((line) => line?.id).filter((id) => !!id);
  const filteredPageData = (pageData || []).filter((line) => !localIds.includes(line?.id));
  return [
    ...(filteredPageData || []),
    ...(localData || []).map((line, index) => ({ ...line, __INDEX__: index })),
  ];
};
export const selectLocalTableData = (id: string) => (state: ReduxTablesState) => {
  return selectSlice(id)(state)?.localData || [];
};
export const selectTableError = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.error || {};
export const selectTableLoading = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.loading;
export const selectTableCriteria = (id: string) => (state: ReduxTablesState) => {
  const criteria = selectSlice(id)(state)?.criteria || {};
  const predefinedCriteria = selectSlice(id)(state)?.predefinedCriteria || {};
  return {
    ...predefinedCriteria,
    ...criteria,
  };
};
export const selectTableNotPredefinedCriteria = (id: string) => (state: ReduxTablesState) => {
  const criteria = selectSlice(id)(state)?.criteria || {};
  const predefinedCriteria = selectSlice(id)(state)?.predefinedCriteria || {};

  return Object.fromEntries(
    Object.entries(criteria).filter(([key]) => !(key in predefinedCriteria)),
  );
};
export const selectTablePredefinedCriteria = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.predefinedCriteria || {};
export const hasPredefinedCriteria = (id: string) => (state: ReduxTablesState) => {
  return objectHasValues(selectSlice(id)(state)?.predefinedCriteria ?? {});
};
export const selectTableColumns = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.columns;
export const selectTableVisibleColumns = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.columns?.filter((c) => c.visible);

export const selectTableInnerColumns = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.innerColumns;
export const selectTableInnerVisibleColumns = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.innerColumns?.filter((c) => c.visible);

export const selectDisabled = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.disabled;
export const selectCorrectionsDisabled = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.correctionsDisabled;

export const selectParentEntity = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.parentEntity;

export const selectTableSelectedRows = (id?: string, column = 0) => {
  if (!id) {
    return () => [];
  }
  return createSelector(selectCheckedRowIds(id), (selectedRowIds) => {
    return (selectedRowIds || {})[column] || {};
  });
};

export const selectTableSelectedRowsNumber = (id?: string, column = 0) => {
  if (!id) {
    return () => 0;
  }
  return createSelector(selectCheckedRowIds(id), (selectedRowIds) => {
    return Object.values(selectedRowIds?.[column] ?? {})?.filter((v) => v).length ?? 0;
  });
};

export const selectTableMaxLimit = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.maxLimit;

export const getSelectedEntities =
  (id: string, column = 0) =>
  (state: ReduxTablesState) => {
    if (!id) {
      return [];
    }

    const {
      rowIdKey,
      pageData,
      selectedRowIds = {},
      multiple,
      mappedData = {},
    } = selectSlice(id)(state) || {};
    const selectedRowIdsForColumn = selectedRowIds[column] || {};
    if (multiple) {
      return Object.keys(selectedRowIdsForColumn)
        .filter((key) => !!selectedRowIdsForColumn[key])
        .map((key) => mappedData[key]);
    } else {
      return (pageData || []).filter(
        (item) => item && selectedRowIdsForColumn[jpValueFirstLevel(item, rowIdKey)],
      );
    }
  };

export const allRowsSelected =
  (id: string, column = 0) =>
  (state: ReduxTablesState) => {
    if (!id) {
      return false;
    }

    const { rowIdKey, pageData, selectedRowIds = {} } = selectSlice(id)(state) || {};
    const selectedRowIdsForColumn = selectedRowIds[column] || {};

    const selectedItems = (pageData || []).filter(
      (item) => item && rowIdKey && selectedRowIdsForColumn[item[rowIdKey]],
    );
    return (
      (pageData || []).length > 0 &&
      selectedItems.length > 0 &&
      (pageData || []).length === selectedItems.length
    );
  };
export const selectTablePage = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.pagination?.currentPageNumber ?? 0;
export const selectTablePageSize = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.pagination?.requestedPageSize ?? 0;
export const selectTableTotalItems = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.pagination?.totalElements ?? 0;
export const selectTableTotalPageItems = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.pagination?.currentPageNumberOfElements ?? 0;
export const hasNextPage = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.pagination?.hasNextPage;
export const currentPageNumberOfElements = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.pagination?.currentPageNumberOfElements;
export const currentPageNumber = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.pagination?.currentPageNumber;
export const requestedPageSize = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.pagination?.requestedPageSize;
export const removableQueries = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.removableQueries;
export const requestedPageNumber = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.pagination?.requestedPageNumber;

export const hasPrevPage = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.pagination?.hasPrevPage;
export const selectTableTotalPages = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.pagination?.totalPages ?? 0;
export const selectTableHasNoData = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.pageData?.length === 0;
export const selectTableFilterData = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.filterData;
export const selectSortBy = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.sortBy || '';
export const selectSortLocallyBy = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.sortLocallyBy || '';
export const selectRefresh = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.refresh;
export const selectActionsType = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.actionsType;
export const selectOpenTableForm = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.openTableForm;
export const selectIsNewTableForm = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.isNewTableForm;
export const selectSortTieBreaker = (id: string) => (state: ReduxTablesState) =>
  selectSlice(id)(state)?.sortTieBreaker;
