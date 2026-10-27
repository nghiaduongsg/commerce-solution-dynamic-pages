import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  selectTableData,
  selectTableError,
  selectTableLoading,
  selectTableColumns,
  selectTableCriteria,
  selectTablePredefinedCriteria,
  hasPredefinedCriteria,
  selectTableSelectedRows,
  allRowsSelected,
  removableQueries,
  getSelectedEntities,
  selectTablePageSize,
  selectTablePage,
  selectTableTotalItems,
  selectTableTotalPageItems,
  hasNextPage,
  hasPrevPage,
  currentPageNumber,
  requestedPageSize,
  requestedPageNumber,
  currentPageNumberOfElements,
  selectTableTotalPages,
  selectRowIdKey,
  selectTableVisibleColumns,
  selectEntityUrl,
  selectSortBy,
  selectSortLocallyBy,
  selectRefresh,
  selectTableHasNoData,
  selectParentEntity,
  selectDisabled,
  selectCorrectionsDisabled,
  selectTable,
  selectUrl,
  selectActionsType,
  selectOpenTableForm,
  selectIsNewTableForm,
  selectTableFilterData,
  selectCheckedRowIds,
  selectExtraTableData,
  selectTableInnerColumns,
  selectTableInnerVisibleColumns,
  selectLocalTableData,
  selectActiveRow,
  selectValidationsId,
  selectIncludedBillSegmentsWithoutValue,
  selectTableNotPredefinedCriteria,
  selectInitialised,
  selectSortTieBreaker,
  selectTableSelectedRowsNumber,
  selectTableMaxLimit,
} from '../src/selectors';

import {
  ClearSelections,
  SetSelections,
  SetTableMaxLimit,
  LoadTable,
  LoadDynamicQueryTable,
  ToggleTableRow,
  ToggleAllTableRows,
  InitTable,
  SetPredefinedCriteria,
  ClearCriteria,
  SetPage,
  SetPageSize,
  SetSortBy,
  SetSortLocallyBy,
  SetFilterData,
  ClearFilterData,
  ApplyCriteria,
  TriggerRefresh,
  ClearTable,
  SaveTableRow,
  SaveTableData,
  ToggleTableFormModal,
  SetTableIsNewForm,
  ConcatLocalTableRow,
  DeleteTableRow,
  SetTableData,
  SetColumnData,
  ToggleTableColumn,
  SetTableExtraData,
  SetLocallyPagination,
  AddLocalTableRow,
  DeleteLocalTableRow,
  EditLocalTableRow,
  UndoLocalTableRow,
  SetActiveRow,
  SetAllTableData,
  UpdateTableRow,
  SetAllTableExtraData,
  RemoveFilterData,
} from '../src/actions';
import { TableState } from '../src/types';
import { useCallback } from 'react';
import { AnyType } from '@pkg-common/types';
import { getDynamicQueryCode, equalityCheck } from '@pkg-common/utils/utils';

const useTable = (id = '', column = 0) => {
  const dispatch = useDispatch();

  return {
    all: useSelector(selectTable(id)),
    initialised: useSelector(selectInitialised(id)),
    entityUrl: useSelector(selectEntityUrl(id)),
    validationsId: useSelector(selectValidationsId(id)),
    includedBillSegmentsWithoutValue: useSelector(selectIncludedBillSegmentsWithoutValue(id)),
    url: useSelector(selectUrl(id)),
    rowIdKey: useSelector(selectRowIdKey(id)),
    tableData: useSelector(selectTableData(id)),
    localTableData: useSelector(selectLocalTableData(id)),
    error: useSelector(selectTableError(id)),
    loading: useSelector(selectTableLoading(id)),
    hasNoData: useSelector(selectTableHasNoData(id)),
    columns: useSelector(selectTableColumns(id), equalityCheck),
    visibleColumns: useSelector(selectTableVisibleColumns(id), equalityCheck),
    innerColumns: useSelector(selectTableInnerColumns(id), equalityCheck),
    innerVisibleColumns: useSelector(selectTableInnerVisibleColumns(id), equalityCheck),
    //per default column 0
    selectedRows: useSelector(selectTableSelectedRows(id, column)),
    selectedRowsNumber: useSelector(selectTableSelectedRowsNumber(id, column)),
    maxLimit: useSelector(selectTableMaxLimit(id)),
    //per default column 0
    selectedEntities: useSelector(getSelectedEntities(id)),
    //per default column 0
    allRowsSelected: useSelector(allRowsSelected(id)),
    //for all columns
    allSelectedRows: useSelector(selectCheckedRowIds(id)),
    //for all columns
    allExtraData: useSelector(selectExtraTableData(id), equalityCheck),
    visibleCriteria: useSelector(selectTableVisibleColumns(id), equalityCheck),
    criteria: useSelector(selectTableCriteria(id), equalityCheck),
    notPredefinedCriteria: useSelector(selectTableNotPredefinedCriteria(id), equalityCheck),
    predefinedCriteria: useSelector(selectTablePredefinedCriteria(id), equalityCheck),
    removableQueries: useSelector(removableQueries(id), equalityCheck),
    filterData: useSelector(selectTableFilterData(id), equalityCheck),

    activeRow: useSelector(selectActiveRow(id), equalityCheck),

    pageSize: useSelector(selectTablePageSize(id), shallowEqual),
    page: useSelector(selectTablePage(id), shallowEqual),
    totalPages: useSelector(selectTableTotalPages(id)),
    totalItems: useSelector(selectTableTotalItems(id)),
    pageItems: useSelector(selectTableTotalPageItems(id)),
    parentEntity: useSelector(selectParentEntity(id)),
    disabled: useSelector(selectDisabled(id)),
    correctionsDisabled: useSelector(selectCorrectionsDisabled(id)),
    hasNextPage: useSelector(hasNextPage(id)),
    currentPageNumberOfElements: useSelector(currentPageNumberOfElements(id)),
    hasPrevPage: useSelector(hasPrevPage(id)),
    hasPredefinedCriteria: useSelector(hasPredefinedCriteria(id)),
    currentPageNumber: useSelector(currentPageNumber(id)),
    requestedPageSize: useSelector(requestedPageSize(id)),
    requestedPageNumber: useSelector(requestedPageNumber(id)),
    sortBy: useSelector(selectSortBy(id), shallowEqual),
    sortLocallyBy: useSelector(selectSortLocallyBy(id), shallowEqual),
    refresh: useSelector(selectRefresh(id)),
    actionsType: useSelector(selectActionsType(id)),
    openTableForm: useSelector(selectOpenTableForm(id)),
    isNewTableForm: useSelector(selectIsNewTableForm(id)),
    sortTieBreaker: useSelector(selectSortTieBreaker(id)),

    initTable: useCallback(
      (initialState: Partial<TableState>) => dispatch(InitTable({ tableId: id, initialState })),
      [dispatch, id],
    ),
    setSortBy: useCallback(
      (sortBy: string) => dispatch(SetSortBy({ tableId: id, sortBy })),
      [dispatch, id],
    ),
    setSortLocallyBy: useCallback(
      (sortLocallyBy: string, dataType?: string) =>
        dispatch(SetSortLocallyBy({ tableId: id, sortLocallyBy, dataType })),
      [dispatch, id],
    ),
    setPage: useCallback(
      (page: number) => dispatch(SetPage({ tableId: id, page })),
      [dispatch, id],
    ),
    setPageSize: useCallback(
      (pageSize: number) => dispatch(SetPageSize({ tableId: id, pageSize })),
      [dispatch, id],
    ),
    applyCriteria: useCallback(
      (criteria?: { [_: string]: string }) => dispatch(ApplyCriteria({ tableId: id, criteria })),
      [dispatch, id],
    ),
    clearCriteria: useCallback(() => dispatch(ClearCriteria({ tableId: id })), [dispatch, id]),
    setFilterData: useCallback(
      (filterData: { [key: string]: AnyType }) =>
        dispatch(SetFilterData({ tableId: id, filterData })),
      [dispatch, id],
    ),
    clearFilterData: useCallback(() => dispatch(ClearFilterData({ tableId: id })), [dispatch, id]),
    removeFilterData: useCallback(
      (filterName: string) => dispatch(RemoveFilterData({ tableId: id, filterName })),
      [dispatch, id],
    ),
    loadTableData: useCallback(
      (
        loadTimestamp: number,
        criteria: { [key: string]: AnyType },
        page?: number,
        pageSize?: number,
        sortBy?,
        apiValues?,
        url?: string,
        dataValues?: AnyType,
        method?,
        queryParams?,
      ) => {
        const isDynamicQuery = getDynamicQueryCode(url || '') || method === 'post';
        const loadAction = isDynamicQuery ? LoadDynamicQueryTable : LoadTable;
        dispatch(
          loadAction({
            tableId: id,
            criteria,
            page,
            pageSize,
            sortBy,
            loadTimestamp,
            apiValues,
            url,
            dataValues,
            queryParams,
          }),
        );
      },
      [dispatch, id],
    ),
    updateTableRow: useCallback(
      ({
        property,
        rowIndex,
        columnIndex,
      }: {
        property: { value: number; name: string };
        rowIndex: number;
        columnIndex: number;
      }) =>
        dispatch(
          UpdateTableRow({
            tableId: id,
            property,
            rowIndex,
            columnIndex,
          }),
        ),
      [dispatch, id],
    ),
    setTableData: useCallback(
      ({ data }) =>
        dispatch(
          SetTableData({
            tableId: id,
            data,
          }),
        ),
      [dispatch, id],
    ),
    SetLocallyPagination: useCallback(
      ({ pagination }) =>
        dispatch(
          SetLocallyPagination({
            pagination,
            tableId: id,
          }),
        ),
      [dispatch, id],
    ),
    setColumnData: useCallback(
      ({ data }) =>
        dispatch(
          SetColumnData({
            tableId: id,
            data,
          }),
        ),
      [dispatch, id],
    ),
    clearSelections: useCallback(
      (columnNum = 0) => dispatch(ClearSelections({ tableId: id, column: columnNum })),
      [dispatch, id],
    ),
    setSelections: useCallback(
      (selectedItems: AnyType, columnNum = 0) =>
        dispatch(SetSelections({ tableId: id, selections: selectedItems, column: columnNum })),
      [dispatch, id],
    ),
    setMaxLimit: useCallback(
      (maxLimit: number) => dispatch(SetTableMaxLimit({ tableId: id, maxLimit })),
      [dispatch, id],
    ),
    setAllExtraTableData: useCallback(
      (extraTableData: AnyType) => dispatch(SetAllTableExtraData({ tableId: id, extraTableData })),
      [dispatch, id],
    ),
    setExtraTableData: useCallback(
      (extraTableData: AnyType, columnNum = 0) =>
        dispatch(SetTableExtraData({ tableId: id, extraTableData, column: columnNum })),
      [dispatch, id],
    ),
    toggleTableRow: useCallback(
      (rowId: string, isMultiSelect = false, columnIndex = 0) =>
        dispatch(ToggleTableRow({ tableId: id, column: columnIndex, rowId, isMultiSelect })),
      [dispatch, id],
    ),
    toggleTableColumn: useCallback(
      (selectedColumnIds: string[]) =>
        dispatch(ToggleTableColumn({ tableId: id, selectedColumnIds })),
      [dispatch, id],
    ),
    toggleAllTableRows: useCallback(
      (selected: boolean) => dispatch(ToggleAllTableRows({ tableId: id, selected })),
      [dispatch, id],
    ),
    setPredefinedCriteria: useCallback(
      (predefinedCriteria: { [key: string]: AnyType }) =>
        dispatch(SetPredefinedCriteria({ tableId: id, predefinedCriteria })),
      [dispatch, id],
    ),
    triggerRefresh: useCallback(() => dispatch(TriggerRefresh({ tableId: id })), [dispatch, id]),
    clearTable: useCallback(() => dispatch(ClearTable({ tableId: id })), [dispatch, id]),
    saveTableData: useCallback(
      (url: string, entityId: string, method?: string, data?: AnyType) =>
        dispatch(SaveTableData({ tableId: id, url, method, data, entityId })),
      [dispatch, id],
    ),
    saveTableRow: useCallback(
      (url: string, data: AnyType, method?: string) =>
        dispatch(SaveTableRow({ entityId: id, url, method, data })),
      [dispatch, id],
    ),
    toggleTableFormModal: useCallback(
      (open: boolean) => dispatch(ToggleTableFormModal({ tableId: id, open })),
      [dispatch, id],
    ),
    setTableIsNewForm: useCallback(
      (isNew: boolean) => dispatch(SetTableIsNewForm({ tableId: id, isNew })),
      [dispatch, id],
    ),
    concatLocalTableRow: useCallback(
      ({ formData, reported }) =>
        dispatch(
          ConcatLocalTableRow({
            tableId: id,
            formData,
            reported,
          }),
        ),
      [dispatch, id],
    ),
    deleteTableRow: useCallback(
      ({ rowData, reported }) => dispatch(DeleteTableRow({ tableId: id, rowData, reported })),
      [dispatch, id],
    ),
    addLocalTableRow: useCallback(
      ({ rowData }) => dispatch(AddLocalTableRow({ tableId: id, rowData })),
      [dispatch, id],
    ),
    deleteLocalTableRow: useCallback(
      ({ rowData }) => dispatch(DeleteLocalTableRow({ tableId: id, rowData })),
      [dispatch, id],
    ),
    editLocalTableRow: useCallback(
      ({ rowData }) => dispatch(EditLocalTableRow({ tableId: id, rowData })),
      [dispatch, id],
    ),
    undoLocalTableRow: useCallback(
      ({ rowData }) => dispatch(UndoLocalTableRow({ tableId: id, rowData })),
      [dispatch, id],
    ),
    setActiveRow: useCallback(
      (row) => dispatch(SetActiveRow({ tableId: id, rowData: row })),
      [dispatch, id],
    ),
    clearActiveRow: useCallback(
      () => dispatch(SetActiveRow({ tableId: id, rowData: {} })),
      [dispatch, id],
    ),
    setAllTableData: useCallback(
      (data) => {
        dispatch(SetAllTableData({ data, tableId: id }));
      },
      [dispatch, id],
    ),
    clearAllTableData: useCallback(() => {
      dispatch(SetAllTableData({ data: [], tableId: id }));
    }, [dispatch, id]),
  };
};

export default useTable;
