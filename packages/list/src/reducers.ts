import { TableState } from './types';
import { jpValueFirstLevel } from '@pkg-common/utils/utils';
import jp from 'jsonpath';
import i18n from 'i18next';
import {
  LOAD_TABLE_SUCCESS,
  TOGGLE_TABLE_ROW,
  TOGGLE_TABLE_COLUMN,
  TOGGLE_ALL_TABLE_ROWS,
  INIT_TABLE,
  SET_SELECTIONS,
  SET_TABLE_MAX_LIMIT,
  CLEAR_SELECTIONS,
  LOAD_TABLE,
  LOAD_DYNAMIC_QUERY_TABLE,
  SET_FILTER_DATA,
  CLEAR_FILTER_DATA,
  SET_PREDEFINED_CRITERIA,
  SET_VISIBLE_PREDEFINED_CRITERIA,
  LOAD_TABLE_ERROR,
  CLEAR_CRITERIA,
  SET_PAGE,
  SET_PAGE_SIZE,
  SET_SORT_BY,
  SET_SORT_LOCALLY_BY,
  APPLY_CRITERIA,
  TRIGGER_REFRESH,
  CLEAR_TABLE,
  TOGGLE_TABLE_FORM_MODAL,
  SET_TABLE_IS_NEW_FORM,
  CONCAT_TABLE_ROW,
  DELETE_TABLE_ROW,
  SET_TABLE_DATA,
  SET_ALL_TABLE_DATA,
  SET_COLUMN_DATA,
  SET_TABLE_ACTIONS,
  SET_EXTRA_TABLE_DATA,
  SET_ALL_EXTRA_TABLE_DATA,
  SET_LOCALLY_PAGINATION,
  ADD_LOCAL_TABLE_ROW,
  DELETE_LOCAL_TABLE_ROW,
  EDIT_LOCAL_TABLE_ROW,
  UNDO_LOCAL_TABLE_ROW,
  UPDATE_TABLE_ROW,
  SET_ACTIVE_ROW,
  SAVE_TABLE_DATA,
  SAVE_TABLE_DATA_SUCCESS,
  SAVE_TABLE_DATA_ERROR,
  REMOVE_FILTER_DATA,
} from './actions';
import { defaultActionType } from '@pkg-common/types.d';
import {
  addEditLocallySavedRow,
  addEditLocallySavedTextRow,
  deleteLocallySavedRow,
  deleteLocallySavedTextRow,
} from '@pkg-common/utils/historyNumbersUtils';
import { arrayToMap } from '@pkg-common/utils/utils';
import { SYSTEM_CLEAR } from '@pkg-setup/src/system/useSystem';
import { unwrapEntityDataArea } from '@pkg-entity/utils/utils';

const defaultTableState: TableState = {
  id: '',
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
  multiple: false,
  mappedData: {},
  misc: {},
};

const defaultAction: defaultActionType = {
  type: '',
  payload: {},
};

const defaultState: { [_: string]: TableState } = {};

export default (state: { [_: string]: TableState } = defaultState, action = defaultAction) => {
  const { payload, type } = action;

  // Keep this line first. Do not move after the other checks, because SYSTEM_CLEAR has no payload.
  if (type === SYSTEM_CLEAR) {
    const preserved = {};
    Object.entries(state).forEach(([tableId, tableState]) => {
      if (tableState.maintainFilters) {
        preserved[tableId] = tableState;
      }
    });
    return preserved;
  }

  if (!payload?.tableId) {
    return state;
  }

  return {
    ...state,
    [payload.tableId]: {
      ...(state[payload.tableId] || { id: payload.tableId }),
      ...listReducer(payload.tableId, state[payload.tableId] || { id: payload.tableId }, action),
    },
  };
};

const filterLocalData = (localData, row) => {
  const { id, __ID__ } = row;
  return (localData || []).filter((line) => {
    if (line.__ID__ && line.__ID__ === __ID__) {
      return false;
    } else if (line.id && line.id === id) {
      return false;
    } else {
      return true;
    }
  });
};

const customSortData = (data, sortLocallyBy, dataType) => {
  if (sortLocallyBy) {
    const [sortField, sortDirection] = sortLocallyBy.split(':');
    const isAscending = sortDirection === 'asc';

    return data?.slice().sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      switch (dataType) {
        case 'string':
          if (aValue && bValue) {
            return isAscending
              ? aValue.localeCompare(bValue, i18n.language)
              : bValue.localeCompare(aValue, i18n.language);
          }
          break;
        case 'number':
        case 'amount':
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
          return isAscending ? aValue - bValue : bValue - aValue;
        case 'boolean':
          aValue = aValue ? 1 : 0;
          bValue = bValue ? 1 : 0;
          return isAscending ? aValue - bValue : bValue - aValue;
        case 'date':
          aValue = new Date(aValue);
          bValue = new Date(bValue);
          return isAscending ? aValue - bValue : bValue - aValue;
        default:
          return 0; // No specific sorting for other data types
      }
    });
  }

  return data;
};

const listReducer = (_: string, state: TableState, action = defaultAction) => {
  const { type, payload } = action;

  if (!payload) {
    return state;
  }

  const { tableId: id, data, loadTimestamp } = payload;

  if (id !== state.id) {
    return state;
  }

  if (
    (type === LOAD_TABLE || type === LOAD_DYNAMIC_QUERY_TABLE) &&
    loadTimestamp < state.loadTimestamp
  ) {
    return state;
  }
  if (type === LOAD_TABLE_SUCCESS && loadTimestamp < state.loadTimestamp) {
    return state;
  }

  switch (type) {
    case INIT_TABLE:
      return {
        ...state,
        ...payload.initialState,
        initialised: true,
      };

    case SAVE_TABLE_DATA:
      return {
        ...state,
        loading: true,
      };

    case SAVE_TABLE_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        pageData: payload.data,
        localData: [],
      };

    case SAVE_TABLE_DATA_ERROR:
      return {
        ...state,
        loading: false,
      };

    case LOAD_TABLE:
    case LOAD_DYNAMIC_QUERY_TABLE:
      return {
        ...state,
        data: payload?.dataValues,
        loading: true,
        loadTimestamp: payload.loadTimestamp,
      };

    case LOAD_TABLE_SUCCESS: {
      const { unwrapDataArea } = payload.apiValues || {};
      const tableData = pageData(data, payload.apiValues);
      const finalData = unwrapDataArea ? unwrapEntityDataArea(tableData) : tableData;
      return {
        ...state,
        loading: false,
        error: defaultTableState.error,
        pageData: finalData,
        pagination: data.pageMetadata || defaultTableState.pagination,
        sortBy: payload.sortBy,
        url: payload.url,
        data: payload.dataValues,
        mappedData: state.multiple
          ? {
              ...(state.mappedData || {}),
              ...arrayToMap(finalData, state.rowIdKey),
            }
          : {},
        misc: { ...data, pageMetadata: undefined, content: undefined },
      };
    }

    case LOAD_TABLE_ERROR:
      return {
        ...state,
        loading: false,
        error: payload.error,
      };

    case TOGGLE_TABLE_COLUMN:
      return {
        ...state,
        columns: state.columns.map((col) => {
          return {
            ...col,
            visible: payload.selectedColumnIds.indexOf(col.name) >= 0,
          };
        }),
        innerColumns: state.innerColumns?.map((col) => {
          return {
            ...col,
            visible: payload.selectedColumnIds.indexOf(col.name) >= 0,
          };
        }),
      };

    case TOGGLE_TABLE_ROW:
      return {
        ...state,
        selectedRowIds: {
          ...state.selectedRowIds,
          [payload.column || 0]: toggleTableRow(
            state.selectedRowIds[payload.column || 0] || {},
            payload.rowId,
            payload.isMultiSelect,
          ),
        },
      };

    case TOGGLE_ALL_TABLE_ROWS:
      return {
        ...state,
        selectedRowIds: {
          ...state.selectedRowIds,
          [payload.column || 0]: {
            ...state.selectedRowIds[payload.column || 0],
            ...toggleAllRows(state.pageData, state.rowIdKey, payload.selected),
          },
        },
      };

    case CLEAR_SELECTIONS:
      return {
        ...state,
        selectedRowIds: {
          ...state.selectedRowIds,
          [payload.column || 0]: {},
        },
      };

    case SET_SELECTIONS:
      return {
        ...state,
        selectedRowIds: {
          ...state.selectedRowIds,
          [payload.column || 0]: payload.selections,
        },
      };

    case SET_TABLE_MAX_LIMIT:
      return {
        ...state,
        maxLimit: payload.maxLimit,
      };

    case SET_EXTRA_TABLE_DATA:
      return {
        ...state,
        extraTableData: {
          ...state.extraTableData,
          [payload.column || 0]: {
            ...(state.extraTableData?.[payload.column || 0] || {}),
            ...payload.extraTableData,
          },
        },
      };

    case SET_ALL_EXTRA_TABLE_DATA:
      return {
        ...state,
        extraTableData: payload.extraTableData,
      };

    case SET_SORT_BY:
      return {
        ...state,
        sortBy: payload.sortBy,
        pagination: {
          ...state.pagination,
          requestedPageNumber: 0,
          currentPageNumber: 0,
        },
      };

    case SET_SORT_LOCALLY_BY:
      const { sortLocallyBy, dataType } = payload;

      if (sortLocallyBy) {
        const sortedData = customSortData(state.pageData, sortLocallyBy, dataType);
        return {
          ...state,
          sortLocallyBy,
          pageData: sortedData,
          pagination: {
            ...state.pagination,
            requestedPageNumber: 0,
            currentPageNumber: 0,
          },
        };
      }

      return state;

    case SET_PAGE:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          currentPageNumber: payload.page,
        },
      };

    case SET_PAGE_SIZE:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          requestedPageSize: payload.pageSize,
          requestedPageNumber: 0,
          currentPageNumber: 0,
        },
      };

    case APPLY_CRITERIA: {
      const updatedCriteria = payload?.criteria
        ? { ...payload.criteria }
        : { ...state.criteria, ...state.filterData };

      const updatedFilterData = payload?.criteria ? { ...payload.criteria } : state.filterData;

      const updatedPredefinedCriteria = getPredefinedCriteria(
        updatedCriteria,
        state.predefinedCriteria,
      );

      return {
        ...state,
        criteria: updatedCriteria,
        filterData: updatedFilterData,
        predefinedCriteria: updatedPredefinedCriteria,
        refresh: new Date().getTime(),
        pagination: {
          ...state.pagination,
          requestedPageNumber: 0,
          currentPageNumber: 0,
        },
      };
    }

    case CLEAR_CRITERIA:
      return {
        ...state,
        criteria: { ...state.predefinedCriteria },
        filterData: { ...state.predefinedCriteria },
        refresh: new Date().getTime(),
        pagination: {
          ...state.pagination,
          currentPageNumber: 0,
        },
      };

    case SET_FILTER_DATA:
      return { ...state, filterData: { ...payload.filterData } };

    case CLEAR_FILTER_DATA:
      return {
        ...state,
        filterData: { ...state.predefinedCriteria },
      };

    case REMOVE_FILTER_DATA:
      return {
        ...state,
        filterData: { ...state.filterData, [payload.filterName]: undefined },
      };

    case SET_PREDEFINED_CRITERIA:
      return {
        ...state,
        predefinedCriteria: {
          ...payload.predefinedCriteria,
        },
      };

    case SET_VISIBLE_PREDEFINED_CRITERIA:
      return {
        ...state,
        visiblePredefinedCriteria: payload.visiblePredefinedCriteria,
      };

    case TRIGGER_REFRESH:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          requestedPageNumber: 0,
          currentPageNumber: 0,
        },
        localData: [],
        refresh: new Date().getTime(),
      };

    case CLEAR_TABLE:
      return {
        ...defaultTableState,
        id: state.id,
        url: state.url || '',
        rowIdKey: state.rowIdKey || '',
        columns: state.columns,
        multiple: state.multiple,
        mappedData: state.multiple ? state.mappedData : {},
      };

    case TOGGLE_TABLE_FORM_MODAL:
      return {
        ...state,
        openTableForm: payload.open,
      };

    case CONCAT_TABLE_ROW:
      if (state.id === 'HistoryTextFields') {
        return {
          ...state,
          pageData: addEditLocallySavedTextRow(state.pageData, payload.formData),
        };
      }
      return {
        ...state,
        pageData: addEditLocallySavedRow(state.pageData, payload.formData, payload.reported || 0),
      };

    case DELETE_TABLE_ROW:
      if (state.id === 'HistoryTextFields') {
        return {
          ...state,
          pageData: deleteLocallySavedTextRow(state.pageData, payload.rowData),
        };
      } else {
        return {
          ...state,
          pageData: deleteLocallySavedRow(state.pageData, payload.rowData, payload.reported),
        };
      }

    case UPDATE_TABLE_ROW:
      const { property, rowIndex } = payload;

      return {
        ...state,
        pageData: state.pageData.map((line, index) =>
          index === rowIndex ? { ...line, [property?.name]: property.value } : line,
        ),
      };

    case SET_TABLE_DATA:
      return {
        ...state,
        pageData: payload.data,
      };

    case SET_COLUMN_DATA:
      return {
        ...state,
        columns: payload.data,
      };
    case SET_TABLE_ACTIONS:
      return {
        ...state,
        actions: payload.action,
      };
    case SET_TABLE_IS_NEW_FORM:
      return {
        ...state,
        isNewTableForm: payload.isNew,
      };

    case SET_ALL_TABLE_DATA:
      return {
        ...state,
        allData: payload.data,
        pageData: payload.data || [],
        // .slice(
        //   state.pagination?.currentPageNumber * (state.pagination?.requestedPageSize || 0),
        //   (state.pagination?.currentPageNumber + 1) * (state.pagination?.requestedPageSize || 0)
        // )
        // .concat(payload.data.filter((i) => i.item.isNew === true)),

        // pagination: {
        //   ...(state.pagination || {}),
        //   totalElements: payload.data.length,
        //   totalPages: payload.data.length / (state.pagination?.requestedPageSize || 1),
        //   hasNextPage:
        //     (state.pagination?.currentPageNumber + 1) *
        //       (state.pagination?.requestedPageSize || 1) <=
        //     payload.data.length,
        // },
      };

    case SET_LOCALLY_PAGINATION:
      return {
        ...state,
        pagination: payload.pagination,
        pageData: (state.allData || [])
          .slice(
            payload.pagination.currentPageNumber * payload.pagination.requestedPageSize,
            (payload.pagination.currentPageNumber + 1) * payload.pagination.requestedPageSize,
          )
          .concat((state.allData || []).filter((i) => i.item.isNew === true)),
      };

    case ADD_LOCAL_TABLE_ROW:
      return {
        ...state,
        localData: [
          ...(state.localData || []),
          { ...payload.rowData, status: 'ADD', __ID__: new Date().getTime() },
        ],
      };

    case DELETE_LOCAL_TABLE_ROW:
      const filteredDeleteLocalData = filterLocalData(state.localData, payload.rowData);
      return {
        ...state,
        localData: [
          ...(filteredDeleteLocalData || []),
          { ...payload.rowData, status: 'DELETE', __ID__: new Date().getTime() },
        ],
      };

    case EDIT_LOCAL_TABLE_ROW:
      const filteredEditLocalData = filterLocalData(state.localData, payload.rowData);
      return {
        ...state,
        localData: [
          ...(filteredEditLocalData || []),
          { ...payload.rowData, status: 'UPDATE', __ID__: new Date().getTime() },
        ],
      };

    case UNDO_LOCAL_TABLE_ROW:
      const filteredUndoLocalData = filterLocalData(state.localData, payload.rowData);

      return {
        ...state,
        localData: filteredUndoLocalData,
      };

    case SET_ACTIVE_ROW:
      if (!state.allData?.length) {
        return { ...state, activeRow: { ...payload.rowData } };
      }
      return {
        ...state,
        activeRow: { ...payload.rowData },
      };

    default:
      return state;
  }
};

const toggleTableRow = (selectedRowIds, rowId: string, isMultiSelect: boolean) => {
  return isMultiSelect
    ? {
        ...selectedRowIds,
        [rowId]: !selectedRowIds[rowId],
      }
    : {
        [rowId]: !selectedRowIds[rowId],
      };
};

const toggleAllRows = (rows, rowIdKey: string, selected: boolean) => {
  const selectedRowIds = {};
  if (!rows) {
    return {};
  }
  rows?.forEach((row) => {
    selectedRowIds[jpValueFirstLevel(row, rowIdKey)] = selected;
  });
  return selectedRowIds;
};

const pageData = (data, apiValues) => {
  if (apiValues && apiValues?.jsonPath) {
    const jpFunction = apiValues.performQuery ? 'query' : 'value';
    return jp[jpFunction](data, jp.stringify(apiValues?.jsonPath).replace(/"/g, ''));
  }

  return data.content || data;
};

const getPredefinedCriteria = (all = {}, predefined = {}) => {
  const predefinedCriteria = { ...predefined };
  const allKeys = Object.keys(all || {});

  allKeys.forEach((key) => {
    if (predefined[key]) {
      predefinedCriteria[key] = all[key];
    }
  });
  return predefinedCriteria;
};
