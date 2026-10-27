import {
  selectTableData,
  selectTableError,
  selectTableLoading,
  selectTableCriteria,
  selectTableColumns,
  selectTableSelectedRows,
  allRowsSelected,
  selectTablePage,
  selectTablePageSize,
  selectTableTotalItems,
  selectTableTotalPageItems,
  hasNextPage,
  hasPrevPage,
  selectTableTotalPages,
  selectEntityUrl,
  selectRowIdKey,
  selectTableVisibleColumns,
  getSelectedEntities,
  selectRefresh,
  selectSortTieBreaker,
} from './selectors';
import { AnyType } from '@pkg-common/types';

const state = {
  Tables: {
    TableX: {
      id: 'id',
      url: 'url',
      entityUrl: '',
      rowIdKey: 'rowIdKey',
      columns: [
        {
          type: 'string',
          name: 'Identification Label',
          accessors: ['identificationLabel'],
          align: 'left',
          visible: true,
        },
        {
          type: 'string',
          name: 'Type',
          accessors: ['type'],
          align: 'left',
          visible: false,
        },
      ],
      pageData: [],
      selectedRowIds: {
        0: {
          'rowId-1': true,
          'rowId-2': true,
          'rowId-3': true,
        },
      },
      loading: false,
      error: {},
      criteria: {},
      pagination: {
        requestedPageSize: 10,
        requestedPageNumber: 0,
        totalElements: 0,
        totalPages: 0,
        currentPageNumberOfElements: 0,
        currentPageNumber: 0,
        hasNextPage: true,
        hasPrevPage: true,
      },
      actions: {
        readEntity: false,
      },
      refresh: 3,
      sortTieBreaker: 'id:asc',
    },
  },
} as AnyType;

describe('Table Selectors', () => {
  const tableId = 'TableX';

  it('selectTableData', () => {
    const expected = state.Tables[tableId].pageData;

    expect(selectTableData(tableId)(state)).toEqual(expected);
  });

  it('selectTableError', () => {
    const expected = state.Tables[tableId].error;

    expect(selectTableError(tableId)(state)).toEqual(expected);
  });

  it('selectTableLoading', () => {
    const expected = state.Tables[tableId].loading;

    expect(selectTableLoading(tableId)(state)).toEqual(expected);
  });

  it('selectTableCriteria', () => {
    const expected = state.Tables[tableId].criteria;

    expect(selectTableCriteria(tableId)(state)).toEqual(expected);
  });

  it('selectTableColumns', () => {
    const expected = state.Tables[tableId].columns;

    expect(selectTableColumns(tableId)(state)).toEqual(expected);
  });

  it('selectTableSelectedRows', () => {
    const expected = state.Tables[tableId].selectedRowIds[0];

    expect(selectTableSelectedRows(tableId, 0)(state)).toEqual(expected);
  });

  it('allRowsSelected: In case at least one row is not selected', () => {
    expect(allRowsSelected(tableId)(state)).toEqual(false);
  });

  it('allRowsSelected: In case all rows are selected', () => {
    const pageData = [{ rowIdKey: 'rowId-1' }, { rowIdKey: 'rowId-2' }, { rowIdKey: 'rowId-3' }];

    const tableX = { ...state.Tables[tableId], pageData };
    const newState = { ...state, Tables: { [tableId]: tableX } };

    expect(allRowsSelected(tableId, 0)(newState)).toEqual(true);
  });

  it('selectTablePage', () => {
    const expected = state.Tables[tableId].pagination.currentPageNumber;

    expect(selectTablePage(tableId)(state)).toEqual(expected);
  });

  it('selectTablePageSize', () => {
    const expected = state.Tables[tableId].pagination.requestedPageSize;

    expect(selectTablePageSize(tableId)(state)).toEqual(expected);
  });

  it('selectTableTotalItems', () => {
    const expected = state.Tables[tableId].pagination.totalElements;

    expect(selectTableTotalItems(tableId)(state)).toEqual(expected);
  });

  it('selectTableTotalPageItems', () => {
    const expected = state.Tables[tableId].pagination.currentPageNumberOfElements;

    expect(selectTableTotalPageItems(tableId)(state)).toEqual(expected);
  });

  it('hasNextPage', () => {
    const expected = state.Tables[tableId].pagination.hasNextPage;

    expect(hasNextPage(tableId)(state)).toEqual(expected);
  });

  it('hasPrevPage', () => {
    const expected = state.Tables[tableId].pagination.hasPrevPage;

    expect(hasPrevPage(tableId)(state)).toEqual(expected);
  });

  it('selectTableTotalPages', () => {
    const expected = state.Tables[tableId].pagination.totalPages;

    expect(selectTableTotalPages(tableId)(state)).toEqual(expected);
  });

  it('selectEntityUrl', () => {
    const expected = state.Tables[tableId].entityUrl;

    expect(selectEntityUrl(tableId)(state)).toEqual(expected);
  });

  it('selectRowIdKey', () => {
    const expected = state.Tables[tableId].rowIdKey;

    expect(selectRowIdKey(tableId)(state)).toEqual(expected);
  });

  it('selectTableVisibleColumns', () => {
    const expected = [
      {
        type: 'string',
        name: 'Identification Label',
        accessors: ['identificationLabel'],
        align: 'left',
        visible: true,
      },
    ];

    expect(selectTableVisibleColumns(tableId)(state)).toEqual(expected);
  });

  it('selectRowIdKey', () => {
    const expected = state.Tables[tableId].rowIdKey;

    expect(selectRowIdKey(tableId)(state)).toEqual(expected);
  });

  it('getSelectedEntities', () => {
    const expected = [{ rowId: 'row-12345' }];

    const tableX = {
      ...state.Tables[tableId],
      rowIdKey: 'rowId',
      pageData: [{ rowId: 'row-12345' }, { rowId: 'row-54321' }],
      selectedRowIds: { 0: { 'row-12345': true } },
    };

    expect(getSelectedEntities(tableId)({ ...state, Tables: { TableX: tableX } })).toEqual(
      expected,
    );
  });

  it('selectRefresh', () => {
    const expected = state.Tables[tableId].refresh;

    expect(selectRefresh(tableId)(state)).toEqual(expected);
  });

  it('selectSortTieBreaker', () => {
    const expected = state.Tables[tableId].sortTieBreaker;

    expect(selectSortTieBreaker(tableId)(state)).toEqual(expected);
  });
});
