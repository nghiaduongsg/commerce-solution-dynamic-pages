import {
  INIT_TABLE,
  SET_SELECTIONS,
  CLEAR_SELECTIONS,
  LOAD_TABLE,
  LOAD_DYNAMIC_QUERY_TABLE,
  LOAD_TABLE_SUCCESS,
  TOGGLE_TABLE_ROW,
  TOGGLE_ALL_TABLE_ROWS,
  SET_SORT_BY,
  SET_PAGE,
  SET_PAGE_SIZE,
  APPLY_CRITERIA,
  SET_FILTER_DATA,
  SET_PREDEFINED_CRITERIA,
  CLEAR_CRITERIA,
  TRIGGER_REFRESH,
  TOGGLE_TABLE_COLUMN,
  REMOVE_FILTER_DATA,
  SAVE_TABLE_DATA,
  SAVE_TABLE_DATA_SUCCESS,
  SAVE_TABLE_DATA_ERROR,
  LOAD_TABLE_ERROR,
  SET_SORT_LOCALLY_BY,
  SET_VISIBLE_PREDEFINED_CRITERIA,
  CLEAR_FILTER_DATA,
  SET_TABLE_IS_NEW_FORM,
  TOGGLE_TABLE_FORM_MODAL,
  CLEAR_TABLE,
  DELETE_TABLE_ROW,
  CONCAT_TABLE_ROW,
  SET_TABLE_DATA,
  UPDATE_TABLE_ROW,
  SET_ALL_TABLE_DATA,
  SET_ALL_EXTRA_TABLE_DATA,
  SET_EXTRA_TABLE_DATA,
  SET_TABLE_ACTIONS,
  SET_COLUMN_DATA,
  SET_ACTIVE_ROW,
  UNDO_LOCAL_TABLE_ROW,
  EDIT_LOCAL_TABLE_ROW,
  DELETE_LOCAL_TABLE_ROW,
  ADD_LOCAL_TABLE_ROW,
  SET_LOCALLY_PAGINATION,
  SET_TABLE_MAX_LIMIT,
} from './actions';

import TableReducer from './reducers';
import { mockDate } from '@_jestHelpers/dateMock';
import { TableColumnConfiguration } from './types';
import { SYSTEM_CLEAR } from '@pkg-setup/src/system/useSystem';
import i18n from 'i18next';

describe('Table Reducer', () => {
  const tableId = 'TABLE';

  const defaultState = {
    id: tableId,
    url: '',
    entityUrl: '',
    rowIdKey: '',
    columns: [],
    innerColumns: [],
    pageData: [],
    localData: [],
    allData: [],
    selectedRowIds: {
      0: {},
    },
    multiple: false,
    mappedData: {},
    extraTableData: {},
    loading: false,
    error: {},
    criteria: {},
    filterData: {},
    predefinedCriteria: {},
    removableQueries: [],
    pagination: {
      requestedPageSize: null,
      requestedPageNumber: 0,
      totalElements: 0,
      totalPages: 0,
      currentPageNumberOfElements: 0,
      currentPageNumber: 0,
      hasNextPage: true,
      hasPrevPage: true,
    },
    sortBy: '',
    refresh: 0,
    loadTimestamp: 0,
    disabled: false,
    correctionsDisabled: false,
    isNewTableForm: true,
    openTableForm: false,
  };

  const defaultTableState = {
    [tableId]: { ...defaultState },
  };

  it('should return the defaultState state when no action is passed', () => {
    mockDate(1234);
    expect(TableReducer({ [tableId]: { ...defaultState } })).toEqual(defaultTableState);
  });

  it('should return the default state when unknown type action is passed', () => {
    const action = {
      type: 'UNKNOWN_TYPE',
      payload: {
        tableId,
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(defaultTableState);
  });

  it('TYPE = INIT_TABLE', () => {
    const action = {
      type: INIT_TABLE,
      payload: {
        tableId,
        initialState: {
          id: tableId,
          columns: [],
          innerColumns: [],
          url: '',
          entityUrl: '',
          rowIdKey: '',
        },
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual({
      [tableId]: { ...defaultState, initialised: true },
    });
  });

  it('TYPE = CLEAR_SELECTIONS', () => {
    const action = {
      type: CLEAR_SELECTIONS,
      payload: {
        tableId,
        selections: {},
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(defaultTableState);
  });

  it('TYPE = SET_SELECTIONS', () => {
    const action = {
      type: SET_SELECTIONS,
      payload: {
        tableId,
        selections: {},
      },
    };

    const expected = {
      [tableId]: { ...defaultState, selectedRowIds: { 0: {} } },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = LOAD_TABLE', () => {
    const action = {
      type: LOAD_TABLE,
      payload: {
        tableId,
        loadTimestamp: 1234,
      },
    };

    const expected = {
      [tableId]: { ...defaultState, loading: true, loadTimestamp: 1234 },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = LOAD_DYNAMIC_QUERY_TABLE', () => {
    const action = {
      type: LOAD_DYNAMIC_QUERY_TABLE,
      payload: {
        tableId,
        loadTimestamp: 1234,
      },
    };

    const expected = {
      [tableId]: { ...defaultState, loading: true, loadTimestamp: 1234 },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = LOAD_TABLE_SUCCESS', () => {
    const action = {
      type: LOAD_TABLE_SUCCESS,
      payload: {
        tableId,
        criteria: {},
        data: {
          content: [
            {
              id: 'demo-organization-party-role-businss',
              identificationLabel: 'Demo Organization TIN 111222333 BUSINSSDM1',
            },
          ],
          pageMetadata: {
            requestedPageSize: 5,
            currentPageNumberOfElements: 5,
            hasNextPage: true,
            hasPrevPage: false,
          },
          other: { prop1: [], prop2: 'something' },
        },
        sortBy: '',
        url: 'some-url',
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        pageData: [
          {
            id: 'demo-organization-party-role-businss',
            identificationLabel: 'Demo Organization TIN 111222333 BUSINSSDM1',
          },
        ],
        pagination: {
          requestedPageSize: 5,
          currentPageNumberOfElements: 5,
          hasNextPage: true,
          hasPrevPage: false,
        },
        url: 'some-url',
        misc: { other: { prop1: [], prop2: 'something' } },
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = TOGGLE_TABLE_COLUMN', () => {
    const givenState = {
      ...defaultState,
      columns: [
        {
          type: 'string',
          name: 'Name',
          visible: true,
          accessors: [],
          align: 'left',
        } as TableColumnConfiguration,
        {
          type: 'string',
          name: 'Email',
          visible: true,
          accessors: [],
          align: 'left',
        } as TableColumnConfiguration,
        {
          type: 'string',
          name: 'Phone',
          visible: true,
          accessors: [],
          align: 'left',
        } as TableColumnConfiguration,
      ],
      innerColumns: [
        {
          type: 'string',
          name: 'City',
          visible: true,
          accessors: [],
          align: 'left',
        } as TableColumnConfiguration,
        {
          type: 'string',
          name: 'Country',
          visible: true,
          accessors: [],
          align: 'left',
        } as TableColumnConfiguration,
      ],
    };

    const action = {
      type: TOGGLE_TABLE_COLUMN,
      payload: { tableId, selectedColumnIds: ['Name', 'Country'] },
    };

    const expectedState = {
      [tableId]: {
        ...defaultState,
        columns: [
          {
            type: 'string',
            name: 'Name',
            visible: true,
            accessors: [],
            align: 'left',
          } as TableColumnConfiguration,
          {
            type: 'string',
            name: 'Email',
            visible: false,
            accessors: [],
            align: 'left',
          } as TableColumnConfiguration,
          {
            type: 'string',
            name: 'Phone',
            visible: false,
            accessors: [],
            align: 'left',
          } as TableColumnConfiguration,
        ],
        innerColumns: [
          {
            type: 'string',
            name: 'City',
            visible: false,
            accessors: [],
            align: 'left',
          } as TableColumnConfiguration,
          {
            type: 'string',
            name: 'Country',
            visible: true,
            accessors: [],
            align: 'left',
          } as TableColumnConfiguration,
        ],
      },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expectedState);
  });

  it('TYPE = TOGGLE_TAble_COLUMN should show selected columns when all columns are hidden', () => {
    const givenState = {
      ...defaultState,
      columns: [
        {
          type: 'string',
          name: 'Name',
          visible: false,
          accessors: [],
          align: 'left',
        } as TableColumnConfiguration,
        {
          type: 'string',
          name: 'Email',
          visible: false,
          accessors: [],
          align: 'left',
        } as TableColumnConfiguration,
        {
          type: 'string',
          name: 'Phone',
          visible: false,
          accessors: [],
          align: 'left',
        } as TableColumnConfiguration,
      ],
      innerColumns: [
        {
          type: 'string',
          name: 'City',
          visible: false,
          accessors: [],
          align: 'left',
        } as TableColumnConfiguration,
        {
          type: 'string',
          name: 'Country',
          visible: false,
          accessors: [],
          align: 'left',
        } as TableColumnConfiguration,
      ],
    };

    const action = {
      type: TOGGLE_TABLE_COLUMN,
      payload: { tableId, selectedColumnIds: ['Email', 'Country'] },
    };

    const expectedState = {
      [tableId]: {
        ...defaultState,
        columns: [
          {
            type: 'string',
            name: 'Name',
            visible: false,
            accessors: [],
            align: 'left',
          } as TableColumnConfiguration,
          {
            type: 'string',
            name: 'Email',
            visible: true,
            accessors: [],
            align: 'left',
          } as TableColumnConfiguration,
          {
            type: 'string',
            name: 'Phone',
            visible: false,
            accessors: [],
            align: 'left',
          } as TableColumnConfiguration,
        ],
        innerColumns: [
          {
            type: 'string',
            name: 'City',
            visible: false,
            accessors: [],
            align: 'left',
          } as TableColumnConfiguration,
          {
            type: 'string',
            name: 'Country',
            visible: true,
            accessors: [],
            align: 'left',
          } as TableColumnConfiguration,
        ],
      },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expectedState);
  });

  it('TYPE = TOGGLE_TABLE_ROW', () => {
    const action = {
      type: TOGGLE_TABLE_ROW,
      payload: {
        tableId,
        rowId: 'demo-1234',
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        selectedRowIds: { 0: { 'demo-1234': false } },
      },
    };
    const givenState = {
      ...defaultState,
      selectedRowIds: { 0: { 'demo-1234': true } },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expected);
  });

  it('TYPE = TOGGLE_ALL_TABLE_ROWS', () => {
    const action = {
      type: TOGGLE_ALL_TABLE_ROWS,
      payload: {
        tableId,
        selected: true,
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        pageData: [
          {
            id: 'demo-organization-party-role-businss',
            identificationLabel: 'Demo Organization TIN 111222333 BUSINSSDM1',
          },
        ],
        rowIdKey: 'id',
        selectedRowIds: { 0: { 'demo-organization-party-role-businss': true } },
      },
    };
    const givenState = {
      ...defaultState,
      pageData: [
        {
          id: 'demo-organization-party-role-businss',
          identificationLabel: 'Demo Organization TIN 111222333 BUSINSSDM1',
        },
      ],
      rowIdKey: 'id',
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_SORT_BY', () => {
    const action = {
      type: SET_SORT_BY,
      payload: {
        tableId,
        sortBy: 'endDate:asc',
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        pagination: {
          ...defaultState.pagination,
          requestedPageNumber: 0,
          currentPageNumber: 0,
        },
        sortBy: 'endDate:asc',
      },
    };

    const givenState = {
      ...defaultState,
      pagination: {
        ...defaultState.pagination,
        requestedPageNumber: 15,
        currentPageNumber: 20,
      },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_PAGE', () => {
    const action = {
      type: SET_PAGE,
      payload: {
        tableId,
        page: 2,
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        pagination: {
          ...defaultState.pagination,
          currentPageNumber: 2,
        },
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_PAGE_SIZE', () => {
    const action = {
      type: SET_PAGE_SIZE,
      payload: {
        tableId,
        pageSize: 20,
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        pagination: {
          ...defaultState.pagination,
          requestedPageSize: 20,
          requestedPageNumber: 0,
          currentPageNumber: 0,
        },
      },
    };

    const givenState = {
      ...defaultState,
      pagination: {
        ...defaultState.pagination,
        requestedPageNumber: 15,
        currentPageNumber: 20,
      },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_TABLE_MAX_LIMIT', () => {
    const action = {
      type: SET_TABLE_MAX_LIMIT,
      payload: {
        tableId,
        maxLimit: 20,
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        maxLimit: 20,
      },
    };

    expect(TableReducer({ [tableId]: defaultState }, action)).toEqual(expected);
  });

  it('TYPE = APPLY_CRITERIA, when they are not included in predefined', () => {
    const action = {
      type: APPLY_CRITERIA,
      payload: {
        tableId,
        criteria: { code: 'codeId' },
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        criteria: { code: 'codeId' },
        filterData: { code: 'codeId' },
        predefinedCriteria: {
          revenueTypeCategoryCL: 'PERIODIC',
        },
        pagination: {
          ...defaultState.pagination,
          requestedPageNumber: 0,
          currentPageNumber: 0,
        },
        refresh: 1234,
      },
    };

    const givenState = {
      ...defaultState,
      pagination: {
        ...defaultState.pagination,
        requestedPageNumber: 15,
        currentPageNumber: 20,
      },
      predefinedCriteria: { revenueTypeCategoryCL: 'PERIODIC' },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expected);
  });

  it('TYPE = APPLY_CRITERIA, when they are included in predefined', () => {
    const action = {
      type: APPLY_CRITERIA,
      payload: {
        tableId,
        criteria: { code: 'codeId' },
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        criteria: { code: 'codeId' },
        filterData: { code: 'codeId' },
        predefinedCriteria: {
          code: 'codeId',
          revenueTypeCategoryCL: 'PERIODIC',
        },
        pagination: {
          ...defaultState.pagination,
          requestedPageNumber: 0,
          currentPageNumber: 0,
        },
        refresh: 1234,
      },
    };

    const givenState = {
      ...defaultState,
      pagination: {
        ...defaultState.pagination,
        requestedPageNumber: 15,
        currentPageNumber: 20,
      },
      predefinedCriteria: {
        code: 'x',
        revenueTypeCategoryCL: 'PERIODIC',
      },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expected);
  });

  it('TYPE = CLEAR_CRITERIA', () => {
    const action = {
      type: CLEAR_CRITERIA,
      payload: {
        tableId,
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        criteria: { revenueTypeCategoryCL: 'PERIODIC' },
        filterData: { revenueTypeCategoryCL: 'PERIODIC' },
        pagination: {
          ...defaultState.pagination,
          currentPageNumber: 0,
        },
        predefinedCriteria: { revenueTypeCategoryCL: 'PERIODIC' },
        refresh: 1234,
      },
    };

    const givenState = {
      ...defaultState,
      pagination: {
        ...defaultState.pagination,
        currentPageNumber: 20,
      },
      predefinedCriteria: { revenueTypeCategoryCL: 'PERIODIC' },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_FILTER_DATA', () => {
    const action = {
      type: SET_FILTER_DATA,
      payload: {
        tableId,
        filterData: {
          partyId: 'party-1234',
          partyType: 'type-1234',
        },
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        filterData: {
          partyId: 'party-1234',
          partyType: 'type-1234',
        },
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_PREDEFINED_CRITERIA', () => {
    const action = {
      type: SET_PREDEFINED_CRITERIA,
      payload: {
        tableId,
        predefinedCriteria: {
          partyId: 'party-1234',
          partyType: 'type-1234',
        },
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        predefinedCriteria: {
          partyId: 'party-1234',
          partyType: 'type-1234',
        },
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = TRIGGER_REFRESH', () => {
    const action = {
      type: TRIGGER_REFRESH,
      payload: {
        tableId,
      },
    };

    const givenState = {
      ...defaultState,
      pagination: {
        ...defaultState.pagination,
        requestedPageNumber: 5,
        currentPageNumber: 5,
      },
      refresh: 3,
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        pagination: {
          ...defaultState.pagination,
          requestedPageNumber: 0,
          currentPageNumber: 0,
        },
        refresh: 1234,
      },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expected);
  });

  it('TYPE = REMOVE_FILTER_DATA', () => {
    const action = {
      type: REMOVE_FILTER_DATA,
      payload: {
        tableId,
        filterName: 'partyId',
      },
    };

    const givenState = {
      ...defaultState,
      filterData: {
        partyId: 'party-1234',
        partyType: 'type-1234',
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        filterData: {
          partyId: undefined,
          partyType: 'type-1234',
        },
      },
    };

    expect(TableReducer({ [tableId]: givenState }, action)).toEqual(expected);
  });

  it('should handle SYSTEM_CLEAR action', () => {
    const action = {
      type: SYSTEM_CLEAR,
      payload: {},
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual({});
  });

  it('should return state when loadTimestamp is older for LOAD_TABLE', () => {
    const givenState = {
      ...defaultState,
      loadTimestamp: 5000,
    };

    const action = {
      type: LOAD_TABLE,
      payload: {
        tableId,
        loadTimestamp: 1234,
      },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual({
      [tableId]: givenState,
    });
  });

  it('should return state when loadTimestamp is older for LOAD_TABLE_SUCCESS', () => {
    const givenState = {
      ...defaultState,
      loadTimestamp: 5000,
    };

    const action = {
      type: LOAD_TABLE_SUCCESS,
      payload: {
        tableId,
        loadTimestamp: 1234,
        data: { content: [] },
      },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual({
      [tableId]: givenState,
    });
  });

  it('TYPE = SAVE_TABLE_DATA', () => {
    const action = {
      type: SAVE_TABLE_DATA,
      payload: {
        tableId,
      },
    };

    const expected = {
      [tableId]: { ...defaultState, loading: true },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = SAVE_TABLE_DATA_SUCCESS', () => {
    const action = {
      type: SAVE_TABLE_DATA_SUCCESS,
      payload: {
        tableId,
        data: [{ id: '1', name: 'test' }],
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        loading: false,
        pageData: [{ id: '1', name: 'test' }],
        localData: [],
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = SAVE_TABLE_DATA_ERROR', () => {
    const action = {
      type: SAVE_TABLE_DATA_ERROR,
      payload: {
        tableId,
      },
    };

    const expected = {
      [tableId]: { ...defaultState, loading: false },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = LOAD_TABLE_ERROR', () => {
    const action = {
      type: LOAD_TABLE_ERROR,
      payload: {
        tableId,
        error: { message: 'Error loading table' },
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        loading: false,
        error: { message: 'Error loading table' },
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_SORT_LOCALLY_BY with valid sortLocallyBy', () => {
    const givenState = {
      ...defaultState,
      pageData: [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ],
    };

    const action = {
      type: SET_SORT_LOCALLY_BY,
      payload: {
        tableId,
        sortLocallyBy: 'name:asc',
        dataType: 'string',
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        sortLocallyBy: 'name:asc',
        pageData: [
          { name: 'Alice', age: 25 },
          { name: 'Bob', age: 35 },
          { name: 'Charlie', age: 30 },
        ],
        pagination: {
          ...defaultState.pagination,
          requestedPageNumber: 0,
          currentPageNumber: 0,
        },
      },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_SORT_LOCALLY_BY with number dataType', () => {
    const givenState = {
      ...defaultState,
      pageData: [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ],
    };

    const action = {
      type: SET_SORT_LOCALLY_BY,
      payload: {
        tableId,
        sortLocallyBy: 'age:desc',
        dataType: 'number',
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        sortLocallyBy: 'age:desc',
        pageData: [
          { name: 'Bob', age: 35 },
          { name: 'Charlie', age: 30 },
          { name: 'Alice', age: 25 },
        ],
        pagination: {
          ...defaultState.pagination,
          requestedPageNumber: 0,
          currentPageNumber: 0,
        },
      },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_SORT_LOCALLY_BY with boolean dataType', () => {
    const givenState = {
      ...defaultState,
      pageData: [
        { name: 'Alice', active: false },
        { name: 'Bob', active: true },
        { name: 'Charlie', active: false },
      ],
    };

    const action = {
      type: SET_SORT_LOCALLY_BY,
      payload: {
        tableId,
        sortLocallyBy: 'active:desc',
        dataType: 'boolean',
      },
    };

    expect(
      (TableReducer({ [tableId]: { ...givenState } }, action) as any).TABLE.pageData[0].active,
    ).toBe(true);
  });

  it('TYPE = SET_SORT_LOCALLY_BY with string dataType sorts differently based on locale', () => {
    const givenState = {
      ...defaultState,
      pageData: [
        { name: 'zoo', id: 1 },
        { name: 'äpple', id: 2 },
      ],
    };

    const action = {
      type: SET_SORT_LOCALLY_BY,
      payload: {
        tableId,
        sortLocallyBy: 'name:asc',
        dataType: 'string',
      },
    };

    // German locale: ä sorts before z
    i18n.language = 'de';
    const germanResult = TableReducer({ [tableId]: { ...givenState } }, action);
    expect((germanResult as any).TABLE.pageData[0].name).toBe('äpple');

    // Swedish locale: ä sorts after z
    i18n.language = 'sv';
    const swedishResult = TableReducer({ [tableId]: { ...givenState } }, action);
    expect((swedishResult as any).TABLE.pageData[0].name).toBe('zoo');
  });

  it('TYPE = SET_SORT_LOCALLY_BY without sortLocallyBy should return state unchanged', () => {
    const action = {
      type: SET_SORT_LOCALLY_BY,
      payload: {
        tableId,
        sortLocallyBy: null,
        dataType: 'string',
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(defaultTableState);
  });

  it('TYPE = APPLY_CRITERIA without criteria should use current criteria and filterData', () => {
    const givenState = {
      ...defaultState,
      criteria: { existingCriteria: 'value' },
      filterData: { filterField: 'filterValue' },
      predefinedCriteria: { predefined: 'value' },
    };

    const action = {
      type: APPLY_CRITERIA,
      payload: {
        tableId,
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        criteria: { existingCriteria: 'value', filterField: 'filterValue' },
        filterData: { filterField: 'filterValue' },
        predefinedCriteria: { predefined: 'value' },
        pagination: {
          ...defaultState.pagination,
          requestedPageNumber: 0,
          currentPageNumber: 0,
        },
        refresh: 1234,
      },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expected);
  });

  it('TYPE = CLEAR_FILTER_DATA', () => {
    const givenState = {
      ...defaultState,
      filterData: { field1: 'value1', field2: 'value2' },
      predefinedCriteria: { predefined: 'value' },
    };

    const action = {
      type: CLEAR_FILTER_DATA,
      payload: {
        tableId,
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        filterData: { predefined: 'value' },
        predefinedCriteria: { predefined: 'value' },
      },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_VISIBLE_PREDEFINED_CRITERIA', () => {
    const action = {
      type: SET_VISIBLE_PREDEFINED_CRITERIA,
      payload: {
        tableId,
        visiblePredefinedCriteria: false,
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        visiblePredefinedCriteria: false,
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = CLEAR_TABLE', () => {
    const givenState = {
      ...defaultState,
      pageData: [{ id: 1 }],
      loading: true,
      error: { message: 'error' },
      multiple: true,
      mappedData: { '1': { id: 1 } },
    };

    const action = {
      type: CLEAR_TABLE,
      payload: {
        tableId,
      },
    };

    const expected = {
      [tableId]: {
        id: tableId,
        url: '',
        entityUrl: '',
        rowIdKey: '',
        columns: [],
        innerColumns: [],
        pageData: [],
        localData: [],
        allData: [],
        selectedRowIds: { 0: {} },
        extraTableData: {},
        loading: false,
        error: {},
        criteria: {},
        predefinedCriteria: {},
        removableQueries: [],
        filterData: {},
        pagination: {
          requestedPageSize: null,
          requestedPageNumber: 0,
          totalElements: 0,
          totalPages: 0,
          currentPageNumberOfElements: 0,
          currentPageNumber: 0,
          hasNextPage: true,
          hasPrevPage: true,
        },
        sortBy: '',
        refresh: 0,
        loadTimestamp: 0,
        disabled: false,
        correctionsDisabled: false,
        openTableForm: false,
        isNewTableForm: true,
        multiple: true,
        mappedData: { '1': { id: 1 } },
        misc: {},
      },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expected);
  });

  it('TYPE = TOGGLE_TABLE_FORM_MODAL', () => {
    const action = {
      type: TOGGLE_TABLE_FORM_MODAL,
      payload: {
        tableId,
        open: true,
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        openTableForm: true,
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_TABLE_IS_NEW_FORM', () => {
    const action = {
      type: SET_TABLE_IS_NEW_FORM,
      payload: {
        tableId,
        isNew: false,
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        isNewTableForm: false,
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = CONCAT_TABLE_ROW for HistoryTextFields', () => {
    const givenState = {
      ...defaultState,
      id: 'HistoryTextFields',
      pageData: [],
    };

    const action = {
      type: CONCAT_TABLE_ROW,
      payload: {
        tableId: 'HistoryTextFields',
        formData: { id: '1', text: 'test' },
      },
    };

    const result = TableReducer({ HistoryTextFields: { ...givenState } }, action) as any;
    expect(result.HistoryTextFields.pageData).toEqual([
      {
        id: '1',
        text: 'test',
        active: false,
        correctedValue: undefined,
        sequence: 1,
        user: undefined,
      },
    ]);
  });

  it('TYPE = CONCAT_TABLE_ROW for regular table', () => {
    const givenState = {
      ...defaultState,
      pageData: [],
    };

    const action = {
      type: CONCAT_TABLE_ROW,
      payload: {
        tableId,
        formData: { id: '1', name: 'test' },
        reported: 1,
      },
    };

    const result = TableReducer({ [tableId]: { ...givenState } }, action) as any;
    expect(result.TABLE.pageData).toBeDefined();
  });

  it('TYPE = DELETE_TABLE_ROW for HistoryTextFields', () => {
    const givenState = {
      ...defaultState,
      id: 'HistoryTextFields',
      pageData: [{ id: '1', text: 'test' }],
    };

    const action = {
      type: DELETE_TABLE_ROW,
      payload: {
        tableId: 'HistoryTextFields',
        rowData: { id: '1' },
      },
    };

    const result = TableReducer({ HistoryTextFields: { ...givenState } }, action) as any;
    expect(result.HistoryTextFields.pageData).toBeDefined();
  });

  it('TYPE = DELETE_TABLE_ROW for regular table', () => {
    const givenState = {
      ...defaultState,
      pageData: [{ id: '1', name: 'test' }],
    };

    const action = {
      type: DELETE_TABLE_ROW,
      payload: {
        tableId,
        rowData: { id: '1' },
        reported: 1,
      },
    };

    const result = TableReducer({ [tableId]: { ...givenState } }, action) as any;
    expect(result.TABLE.pageData).toBeDefined();
  });
  it('TYPE = UPDATE_TABLE_ROW', () => {
    const givenState = {
      ...defaultState,
      pageData: [
        { id: '1', name: 'old' },
        { id: '2', name: 'test' },
      ],
    };

    const action = {
      type: UPDATE_TABLE_ROW,
      payload: {
        tableId,
        property: { name: 'name', value: 'updated' },
        rowIndex: 0,
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        pageData: [
          { id: '1', name: 'updated' },
          { id: '2', name: 'test' },
        ],
      },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_TABLE_DATA', () => {
    const action = {
      type: SET_TABLE_DATA,
      payload: {
        tableId,
        data: [{ id: '1', name: 'test' }],
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        pageData: [{ id: '1', name: 'test' }],
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_COLUMN_DATA', () => {
    const action = {
      type: SET_COLUMN_DATA,
      payload: {
        tableId,
        data: [{ name: 'column1' }],
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        columns: [{ name: 'column1' }],
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_TABLE_ACTIONS', () => {
    const action = {
      type: SET_TABLE_ACTIONS,
      payload: {
        tableId,
        action: ['edit', 'delete'],
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        actions: ['edit', 'delete'],
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_EXTRA_TABLE_DATA', () => {
    const givenState = {
      ...defaultState,
      extraTableData: {
        0: { existing: 'data' },
      },
    };

    const action = {
      type: SET_EXTRA_TABLE_DATA,
      payload: {
        tableId,
        column: 0,
        extraTableData: { new: 'data' },
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        extraTableData: {
          0: { existing: 'data', new: 'data' },
        },
      },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_ALL_EXTRA_TABLE_DATA', () => {
    const action = {
      type: SET_ALL_EXTRA_TABLE_DATA,
      payload: {
        tableId,
        extraTableData: { 0: { all: 'data' } },
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        extraTableData: { 0: { all: 'data' } },
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_ALL_TABLE_DATA', () => {
    const action = {
      type: SET_ALL_TABLE_DATA,
      payload: {
        tableId,
        data: [{ id: '1' }, { id: '2' }],
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        allData: [{ id: '1' }, { id: '2' }],
        pageData: [{ id: '1' }, { id: '2' }],
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_LOCALLY_PAGINATION', () => {
    const givenState = {
      ...defaultState,
      allData: [
        { id: '1', item: { isNew: false } },
        { id: '2', item: { isNew: false } },
        { id: '3', item: { isNew: true } },
        { id: '4', item: { isNew: false } },
      ],
    };

    const action = {
      type: SET_LOCALLY_PAGINATION,
      payload: {
        tableId,
        pagination: {
          currentPageNumber: 0,
          requestedPageSize: 2,
        },
      },
    };

    const result = TableReducer({ [tableId]: { ...givenState } }, action) as any;
    expect(result.TABLE.pagination).toEqual({
      currentPageNumber: 0,
      requestedPageSize: 2,
    });
    expect(result.TABLE.pageData).toHaveLength(3);
  });

  it('TYPE = ADD_LOCAL_TABLE_ROW', () => {
    const action = {
      type: ADD_LOCAL_TABLE_ROW,
      payload: {
        tableId,
        rowData: { id: '1', name: 'test' },
      },
    };

    const result = TableReducer({ [tableId]: { ...defaultState } }, action) as any;
    expect(result.TABLE.localData).toHaveLength(1);
    expect(result.TABLE.localData[0].status).toBe('ADD');
    expect(result.TABLE.localData[0].__ID__).toBeDefined();
  });

  it('TYPE = DELETE_LOCAL_TABLE_ROW', () => {
    const givenState = {
      ...defaultState,
      localData: [{ id: '1', status: 'ADD', __ID__: 123 }],
    };

    const action = {
      type: DELETE_LOCAL_TABLE_ROW,
      payload: {
        tableId,
        rowData: { id: '2', name: 'test' },
      },
    };

    const result = TableReducer({ [tableId]: { ...givenState } }, action) as any;
    expect(result.TABLE.localData).toHaveLength(2);
    expect(result.TABLE.localData[1].status).toBe('DELETE');
  });

  it('TYPE = EDIT_LOCAL_TABLE_ROW', () => {
    const givenState = {
      ...defaultState,
      localData: [{ id: '1', status: 'ADD', __ID__: 123 }],
    };

    const action = {
      type: EDIT_LOCAL_TABLE_ROW,
      payload: {
        tableId,
        rowData: { id: '2', name: 'test' },
      },
    };

    const result = TableReducer({ [tableId]: { ...givenState } }, action) as any;
    expect(result.TABLE.localData).toHaveLength(2);
    expect(result.TABLE.localData[1].status).toBe('UPDATE');
  });

  it('TYPE = UNDO_LOCAL_TABLE_ROW', () => {
    const givenState = {
      ...defaultState,
      localData: [
        { id: '1', status: 'ADD', __ID__: 123 },
        { id: '2', status: 'UPDATE', __ID__: 456 },
      ],
    };

    const action = {
      type: UNDO_LOCAL_TABLE_ROW,
      payload: {
        tableId,
        rowData: { id: '1', __ID__: 123 },
      },
    };

    const result = TableReducer({ [tableId]: { ...givenState } }, action) as any;
    expect(result.TABLE.localData).toHaveLength(1);
    expect(result.TABLE.localData[0].id).toBe('2');
  });

  it('TYPE = SET_ACTIVE_ROW with empty allData', () => {
    const action = {
      type: SET_ACTIVE_ROW,
      payload: {
        tableId,
        rowData: { id: '1', name: 'test' },
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        activeRow: { id: '1', name: 'test' },
      },
    };

    expect(TableReducer({ [tableId]: { ...defaultState } }, action)).toEqual(expected);
  });

  it('TYPE = SET_ACTIVE_ROW with allData', () => {
    const givenState = {
      ...defaultState,
      allData: [{ id: '1' }],
    };

    const action = {
      type: SET_ACTIVE_ROW,
      payload: {
        tableId,
        rowData: { id: '1', name: 'test' },
      },
    };

    const expected = {
      [tableId]: {
        ...defaultState,
        allData: [{ id: '1' }],
        activeRow: { id: '1', name: 'test' },
      },
    };

    expect(TableReducer({ [tableId]: { ...givenState } }, action)).toEqual(expected);
  });

  it('should handle LOAD_TABLE_SUCCESS with multiple=true and create mappedData', () => {
    const givenState = {
      ...defaultState,
      multiple: true,
      rowIdKey: 'id',
    };

    const action = {
      type: LOAD_TABLE_SUCCESS,
      payload: {
        tableId,
        data: {
          content: [
            { id: '1', name: 'test1' },
            { id: '2', name: 'test2' },
          ],
        },
        sortBy: 'name:asc',
        url: 'test-url',
      },
    };

    const result = TableReducer({ [tableId]: { ...givenState } }, action) as any;
    expect(result.TABLE.mappedData).toEqual({
      '1': { id: '1', name: 'test1' },
      '2': { id: '2', name: 'test2' },
    });
  });

  it('should handle LOAD_TABLE_SUCCESS with apiValues and jsonPath', () => {
    const action = {
      type: LOAD_TABLE_SUCCESS,
      payload: {
        tableId,
        data: {
          nested: {
            items: [{ id: '1', name: 'test' }],
          },
        },
        apiValues: {
          jsonPath: ['nested', 'items'],
          performQuery: false,
        },
      },
    };

    const result = TableReducer({ [tableId]: { ...defaultState } }, action) as any;
    expect(result.TABLE.pageData).toEqual([{ id: '1', name: 'test' }]);
  });

  it('should handle LOAD_TABLE_SUCCESS with unwrapDataArea enabled', () => {
    const action = {
      type: LOAD_TABLE_SUCCESS,
      payload: {
        tableId,
        data: {
          content: [
            {
              id: '1',
              name: 'test',
              nested: JSON.stringify({ nestedkey: 'nested-value' }),
            },
          ],
        },
        apiValues: {
          unwrapDataArea: true,
        },
      },
    };

    const result = TableReducer({ [tableId]: { ...defaultState } }, action) as any;

    expect(result.TABLE.pageData).toEqual([
      {
        id: '1',
        name: 'test',
        nestedkey: 'nested-value',
      },
    ]);
  });

  it('should handle TOGGLE_TABLE_ROW with multiselect', () => {
    const givenState = {
      ...defaultState,
      selectedRowIds: { 0: { row1: true, row2: false } },
    };

    const action = {
      type: TOGGLE_TABLE_ROW,
      payload: {
        tableId,
        rowId: 'row3',
        isMultiSelect: true,
        column: 0,
      },
    };

    const result = TableReducer({ [tableId]: { ...givenState } }, action) as any;
    expect(result.TABLE.selectedRowIds[0]).toEqual({
      row1: true,
      row2: false,
      row3: true,
    });
  });

  it('should handle TOGGLE_TABLE_ROW without multiselect', () => {
    const givenState = {
      ...defaultState,
      selectedRowIds: { 0: { row1: true, row2: false } },
    };

    const action = {
      type: TOGGLE_TABLE_ROW,
      payload: {
        tableId,
        rowId: 'row3',
        isMultiSelect: false,
        column: 0,
      },
    };

    const result = TableReducer({ [tableId]: { ...givenState } }, action) as any;
    expect(result.TABLE.selectedRowIds[0]).toEqual({
      row3: true,
    });
  });

  describe('SYSTEM_CLEAR action', () => {
    it('should preserve main table state (with maintain filters = true)', () => {
      const mainTableId = 'Party';
      const mainTableState = {
        ...defaultState,
        id: mainTableId,
        criteria: { name: 'John' },
        filterData: { name: 'John' },
        pagination: { ...defaultState.pagination, currentPageNumber: 2 },
        sortBy: 'name:asc',
        pageData: [{ id: 1, name: 'John' }],
        maintainFilters: true,
      };

      const state = {
        [mainTableId]: mainTableState,
      };

      const action = { type: SYSTEM_CLEAR, payload: {} };
      const result = TableReducer(state, action);

      expect((result as any)[mainTableId]).toEqual(mainTableState);
    });

    it('should clear temporary table state (with maintainFilters = false)', () => {
      const tempTableId = 'Party_nested';
      const tempTableState = {
        ...defaultState,
        id: tempTableId,
        criteria: { name: 'John' },
        pageData: [{ id: 1, name: 'John' }],
      };

      const state = {
        [tempTableId]: tempTableState,
      };

      const action = { type: SYSTEM_CLEAR, payload: {} };
      const result = TableReducer(state, action);

      expect((result as any)[tempTableId]).toBeUndefined();
    });

    it('should preserve multiple main tables and clear temporary tables', () => {
      const mainState = {
        Party: {
          ...defaultState,
          id: 'Party',
          criteria: { name: 'John' },
          pagination: { ...defaultState.pagination, currentPageNumber: 1 },
          maintainFilters: true,
        },
        Activity: {
          ...defaultState,
          id: 'Activity',
          criteria: { code: 'ACT1' },
          pagination: { ...defaultState.pagination, currentPageNumber: 0 },
          maintainFilters: true,
        },
        Party_nested: {
          ...defaultState,
          id: 'Party_nested',
          criteria: { name: 'Nested' },
        },
        Activity_details: {
          ...defaultState,
          id: 'Activity_details',
          criteria: { detail: 'test' },
        },
      };

      const action = { type: SYSTEM_CLEAR, payload: {} };
      const result = TableReducer(mainState, action);

      expect((result as any)['Party']).toEqual(mainState.Party);
      expect((result as any)['Activity']).toEqual(mainState.Activity);
      expect((result as any)['Party_nested']).toBeUndefined();
      expect((result as any)['Activity_details']).toBeUndefined();
    });

    it('should preserve main table criteria and filterData', () => {
      const mainTableId = 'Party';
      const criteria = { name: 'John', age: 30 };
      const filterData = { name: 'John', age: 30, email: 'john@example.com' };

      const state = {
        [mainTableId]: {
          ...defaultState,
          id: mainTableId,
          criteria,
          filterData,
          pageData: [{ id: 1, name: 'John' }],
          maintainFilters: true,
        },
      };

      const action = { type: SYSTEM_CLEAR, payload: {} };
      const result = TableReducer(state, action);

      expect((result as any)[mainTableId].criteria).toEqual(criteria);
      expect((result as any)[mainTableId].filterData).toEqual(filterData);
    });

    it('should preserve main table pagination state', () => {
      const mainTableId = 'Party';
      const pagination = {
        ...defaultState.pagination,
        currentPageNumber: 3,
        requestedPageSize: 20,
        totalElements: 100,
        totalPages: 5,
      };

      const state = {
        [mainTableId]: {
          ...defaultState,
          id: mainTableId,
          pagination,
          maintainFilters: true,
        },
      };

      const action = { type: SYSTEM_CLEAR, payload: {} };
      const result = TableReducer(state, action);

      expect((result as any)[mainTableId].pagination).toEqual(pagination);
    });

    it('should preserve main table sort state', () => {
      const mainTableId = 'Party';
      const sortBy = 'name:asc';

      const state = {
        [mainTableId]: {
          ...defaultState,
          id: mainTableId,
          sortBy,
          maintainFilters: true,
        },
      };

      const action = { type: SYSTEM_CLEAR, payload: {} };
      const result = TableReducer(state, action);

      expect((result as any)[mainTableId].sortBy).toEqual(sortBy);
    });

    it('should return empty object', () => {
      const state = {
        Party_nested: { ...defaultState, id: 'Party_nested' },
        Activity_details: { ...defaultState, id: 'Activity_details' },
      };

      const action = { type: SYSTEM_CLEAR, payload: {} };
      const result = TableReducer(state, action);

      expect(result).toEqual({});
    });

    it('should return empty object when state is empty', () => {
      const state = {};

      const action = { type: SYSTEM_CLEAR, payload: {} };
      const result = TableReducer(state, action);

      expect(result).toEqual({});
    });

    it('should not mutate original state', () => {
      const mainTableState = {
        ...defaultState,
        id: 'Party',
        criteria: { name: 'John' },
        maintainFilters: true,
      };

      const state = {
        Party: mainTableState,
        Party_temp: { ...defaultState, id: 'Party_temp', criteria: {} },
      };

      const originalState = JSON.parse(JSON.stringify(state));

      const action = { type: SYSTEM_CLEAR, payload: {} };
      TableReducer(state, action);

      expect(state).toEqual(originalState);
    });
  });
});
