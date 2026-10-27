import {
  INIT_TABLE,
  InitTable,
  SET_SELECTIONS,
  SetSelections,
  CLEAR_SELECTIONS,
  ClearSelections,
  LOAD_TABLE,
  LOAD_TABLE_ERROR,
  LOAD_TABLE_SUCCESS,
  LoadTable,
  LoadTableError,
  LoadTableSuccess,
  TOGGLE_TABLE_ROW,
  TOGGLE_ALL_TABLE_ROWS,
  ToggleTableRow,
  ToggleAllTableRows,
  SetFilterData,
  SET_FILTER_DATA,
  ClearFilterData,
  CLEAR_FILTER_DATA,
  ApplyCriteria,
  APPLY_CRITERIA,
  ClearCriteria,
  CLEAR_CRITERIA,
  SetPage,
  SET_PAGE,
  SetPageSize,
  SET_PAGE_SIZE,
  SetSortBy,
  SET_SORT_BY,
  SetPredefinedCriteria,
  SET_PREDEFINED_CRITERIA,
  TriggerRefresh,
  TRIGGER_REFRESH,
  RemoveFilterData,
  REMOVE_FILTER_DATA,
  SET_TABLE_MAX_LIMIT,
  SetTableMaxLimit,
} from './actions';

describe('Table actions', () => {
  const initialState = {
    id: 'id',
    columns: [],
    pageData: [],
    selectedRowIds: {
      0: { 'rowId-1': true },
    },
    loading: false,
    error: {},
    rowInstance: {},
    criteria: {},
    url: 'url',
    rowIdKey: 'rowIdKey',
  };

  it('InitTable', () => {
    const payload = { tableId: 'tableId', initialState };

    const expected = {
      type: INIT_TABLE,
      payload,
    };

    expect(InitTable(payload)).toEqual(expected);
  });

  it('SetSelections', () => {
    const payload = {
      tableId: 'tableId',
      column: 1,
      selections: {
        test123: 'test',
      },
    };

    const expected = {
      type: SET_SELECTIONS,
      payload,
    };

    expect(SetSelections(payload)).toEqual(expected);
  });

  it('ClearSelections', () => {
    const payload = {
      tableId: 'tableId',
      column: 2,
    };

    const expected = {
      type: CLEAR_SELECTIONS,
      payload,
    };

    expect(ClearSelections(payload)).toEqual(expected);
  });

  it('ApplyCriteria', () => {
    const payload = {
      tableId: 'tableId',
      criteria: { code: 'codeId' },
    };

    const expected = {
      type: APPLY_CRITERIA,
      payload,
    };

    expect(ApplyCriteria(payload)).toEqual(expected);
  });

  it('ClearCriteria', () => {
    const payload = {
      tableId: 'tableId',
    };

    const expected = {
      type: CLEAR_CRITERIA,
      payload,
    };

    expect(ClearCriteria(payload)).toEqual(expected);
  });

  it('SetPage', () => {
    const payload = {
      tableId: 'tableId',
      page: 2,
    };

    const expected = {
      type: SET_PAGE,
      payload,
    };

    expect(SetPage(payload)).toEqual(expected);
  });

  it('SetPageSize', () => {
    const payload = {
      tableId: 'tableId',
      pageSize: 10,
    };

    const expected = {
      type: SET_PAGE_SIZE,
      payload,
    };

    expect(SetPageSize(payload)).toEqual(expected);
  });

  it('SetSortBy', () => {
    const payload = {
      tableId: 'tableId',
      sortBy: 'endDate:asc',
    };

    const expected = {
      type: SET_SORT_BY,
      payload,
    };

    expect(SetSortBy(payload)).toEqual(expected);
  });

  it('SetMaxLimit', () => {
    const payload = {
      tableId: 'tableId',
      maxLimit: 5,
    };

    const expected = {
      type: SET_TABLE_MAX_LIMIT,
      payload,
    };

    expect(SetTableMaxLimit(payload)).toEqual(expected);
  });

  it('LoadTable', () => {
    const payload = { tableId: 'tableId', criteria: {}, page: 5, pageSize: 10, loadTimestamp: 123 };

    const expected = {
      type: LOAD_TABLE,
      payload,
    };

    expect(LoadTable(payload)).toEqual(expected);
  });

  it('LoadTableSuccess', () => {
    const payload = { tableId: 'tableId', criteria: {}, data: [], loadTimestamp: 123 };

    const expected = {
      type: LOAD_TABLE_SUCCESS,
      payload,
    };

    expect(LoadTableSuccess(payload)).toEqual(expected);
  });

  it('LoadTableError', () => {
    const payload = {
      tableId: 'tableId',
      error: {
        message: 'error',
      },
    };

    const expected = {
      type: LOAD_TABLE_ERROR,
      payload,
    };

    expect(LoadTableError(payload)).toEqual(expected);
  });

  it('ToggleTableRow', () => {
    const payload = {
      tableId: 'tableId',
      rowId: 'rowId',
      isMultiSelect: false,
    };

    const expected = {
      type: TOGGLE_TABLE_ROW,
      payload,
    };

    expect(ToggleTableRow(payload)).toEqual(expected);
  });

  it('ToggleAllTableRows', () => {
    const payload = {
      tableId: 'tableId',
      selected: true,
    };

    const expected = {
      type: TOGGLE_ALL_TABLE_ROWS,
      payload,
    };

    expect(ToggleAllTableRows(payload)).toEqual(expected);
  });

  it('SetFilterData', () => {
    const payload = {
      tableId: 'tableId',
    };

    const expected = {
      type: SET_FILTER_DATA,
      payload,
    };

    expect(SetFilterData(payload)).toEqual(expected);
  });

  it('ClearFilterData', () => {
    const payload = {
      tableId: 'tableId',
    };

    const expected = {
      type: CLEAR_FILTER_DATA,
      payload,
    };

    expect(ClearFilterData(payload)).toEqual(expected);
  });

  it('SetPredefinedCriteria', () => {
    const payload = {
      tableId: 'tableId',
      predefinedCriteria: { revenueTypeCategoryCL: 'PERIODIC' },
    };

    const expected = {
      type: SET_PREDEFINED_CRITERIA,
      payload,
    };

    expect(SetPredefinedCriteria(payload)).toEqual(expected);
  });

  it('TriggerRefresh', () => {
    const payload = {
      tableId: 'tableId',
    };

    const expected = {
      type: TRIGGER_REFRESH,
      payload,
    };

    expect(TriggerRefresh(payload)).toEqual(expected);
  });

  it('RemoveFilterData', () => {
    const payload = {
      tableId: 'tableId',
      filterName: 'myFilter',
    };

    const expected = {
      type: REMOVE_FILTER_DATA,
      payload,
    };

    expect(RemoveFilterData(payload)).toEqual(expected);
  });
});
