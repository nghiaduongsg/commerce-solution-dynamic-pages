import {
  LoadTableDataAction,
  LoadTableDataErrorAction,
  LoadTableDataSuccessAction,
  ToggleTableRowAction,
  ToggleTableColumnAction,
  ToggleAllTableRowsAction,
  InitTableDataAction,
  SetSelectionAction,
  SetTableMaxLimitAction,
  ClearSelectionsAction,
  PredefinedCriteriaAction,
  ClearCriteriaAction,
  SetPageAction,
  SetPageSizeAction,
  SetSortByAction,
  SetSortLocallyByAction,
  TriggerRefreshAction,
  ClearTableAction,
  SaveTableRowAction,
  SaveTableRowErrorAction,
  SaveTableRowSuccessAction,
  SaveTableDataAction,
  SaveTableDataSuccessAction,
  SaveTableDataErrorAction,
  ApplyCriteriaAction,
} from './types';
import { AnyType } from '@pkg-common/types';

export const INIT_TABLE = '@TABLE/INIT';
export const CLEAR_SELECTIONS = '@TABLE/CLEAR_SELECTIONS';
export const SET_SELECTIONS = '@TABLE/SET_SELECTIONS';
export const SET_TABLE_MAX_LIMIT = '@TABLE/SET_MAX_LIMIT';

export const SET_EXTRA_TABLE_DATA = '@TABLE/SET_EXTRA_TABLE_DATA';
export const SET_ALL_EXTRA_TABLE_DATA = '@TABLE/SET_ALL_EXTRA_TABLE_DATA';

export const APPLY_CRITERIA = '@TABLE/APPLY_CRITERIA';
export const CLEAR_CRITERIA = '@TABLE/CLEAR_CRITERIA';

export const SET_PAGE = '@TABLE/SET_PAGE';
export const SET_PAGE_SIZE = '@TABLE/SET_PAGE_SIZE';
export const SET_SORT_BY = '@TABLE/SET_SORT_BY';
export const SET_SORT_LOCALLY_BY = '@TABLE/SET_SORT_LOCALLY_BY';

export const LOAD_TABLE = '@TABLE/LOAD';
export const LOAD_DYNAMIC_QUERY_TABLE = '@TABLE/LOAD_DYNAMIC_QUERY_TABLE';
export const LOAD_TABLE_SUCCESS = '@TABLE/LOAD_SUCCESS';
export const LOAD_TABLE_ERROR = '@TABLE/LOAD_ERROR';

export const SAVE_TABLE_ROW = '@TABLE/SAVE_ROW';
export const SAVE_TABLE_ROW_SUCCESS = '@TABLE/SAVE_ROW_SUCCESS';
export const SAVE_TABLE_ROW_ERROR = '@TABLE/SAVE_ROW_ERROR';

export const SAVE_TABLE_DATA = '@TABLE/SAVE_TABLE_DATA';
export const SAVE_TABLE_DATA_SUCCESS = '@TABLE/SAVE_TABLE_DATA_SUCCESS';
export const SAVE_TABLE_DATA_ERROR = '@TABLE/SAVE_TABLE_DATA_ERROR';

export const TOGGLE_TABLE_ROW = '@TABLE/TOGGLE_ROW';
export const TOGGLE_ALL_TABLE_ROWS = '@TABLE/TOGGLE_ALL_TABLE_ROWS';

export const TOGGLE_TABLE_COLUMN = '@TABLE/TOGGLE_COLUMN';

export const SET_FILTER_DATA = '@TABLE/SET_FILTER_DATA';
export const CLEAR_FILTER_DATA = '@TABLE/CLEAR_FILTER_DATA';
export const SET_PREDEFINED_CRITERIA = '@TABLE/SET_PREDEFINED_CRITERIA';
export const SET_VISIBLE_PREDEFINED_CRITERIA = '@TABLE/SET_VISIBLE_PREDEFINED_CRITERIA';
export const REMOVE_FILTER_DATA = '@TABLE/REMOVE_FILTER_DATA';

export const TRIGGER_REFRESH = '@TABLE/TRIGGER_REFRESH';
export const CLEAR_TABLE = '@TABLE/CLEAR';

export const TOGGLE_TABLE_FORM_MODAL = '@TABLE/TOGGLE_FORM_MODAL';
export const SET_TABLE_IS_NEW_FORM = '@TABLE/SET_IS_NEW_FORM';
export const CONCAT_TABLE_ROW = '@TABLE/CONCAT_TABLE_ROW';
export const DELETE_TABLE_ROW = '@TABLE/DELETE_TABLE_ROW';

export const UPDATE_TABLE_ROW = '@TABLE/UPDATE_TABLE_ROW';
export const SET_TABLE_DATA = '@TABLE/SET_TABLE_DATA';
export const SET_ALL_TABLE_DATA = '@TABLE/SET_ALL_TABLE_DATA';
export const SET_COLUMN_DATA = '@TABLE/SET_COLUMN_DATA';
export const SET_TABLE_ACTIONS = '@TABLE/SET_TABLE_ACTIONS';

export const SET_LOCALLY_PAGINATION = 'SET_LOCALLY_PAGINATION';

export const ADD_LOCAL_TABLE_ROW = 'ADD_LOCAL_TABLE_ROW';
export const DELETE_LOCAL_TABLE_ROW = 'DELETE_LOCAL_TABLE_ROW';
export const EDIT_LOCAL_TABLE_ROW = 'EDIT_LOCAL_TABLE_ROW';
export const UNDO_LOCAL_TABLE_ROW = 'UNDO_LOCAL_TABLE_ROW';
export const SET_ACTIVE_ROW = '@TABLE/ACTIVE_ROW';

export const InitTable = ({ tableId, initialState }: InitTableDataAction) => ({
  type: INIT_TABLE,
  payload: { tableId, initialState },
});

export const SetSelections = ({ tableId, selections, column = 0 }: SetSelectionAction) => ({
  type: SET_SELECTIONS,
  payload: { tableId, selections, column },
});

export const SetTableMaxLimit = ({ tableId, maxLimit }: SetTableMaxLimitAction) => ({
  type: SET_TABLE_MAX_LIMIT,
  payload: { tableId, maxLimit },
});

export const ClearSelections = ({ tableId, column = 0 }: ClearSelectionsAction) => ({
  type: CLEAR_SELECTIONS,
  payload: { tableId, column },
});

export const ApplyCriteria = ({ tableId, criteria }: ApplyCriteriaAction) => ({
  type: APPLY_CRITERIA,
  payload: { tableId, criteria },
});

export const ClearCriteria = ({ tableId }: ClearCriteriaAction) => ({
  type: CLEAR_CRITERIA,
  payload: { tableId },
});

export const SetPage = ({ tableId, page }: SetPageAction) => ({
  type: SET_PAGE,
  payload: { tableId, page },
});

export const SetPageSize = ({ tableId, pageSize }: SetPageSizeAction) => ({
  type: SET_PAGE_SIZE,
  payload: { tableId, pageSize },
});

export const SetSortBy = ({ tableId, sortBy }: SetSortByAction) => ({
  type: SET_SORT_BY,
  payload: { tableId, sortBy },
});

export const SetSortLocallyBy = ({ tableId, sortLocallyBy, dataType }: SetSortLocallyByAction) => ({
  type: SET_SORT_LOCALLY_BY,
  payload: { tableId, sortLocallyBy, dataType },
});

export const LoadTable = ({
  tableId,
  criteria,
  page,
  pageSize,
  sortBy,
  loadTimestamp,
  url,
  apiValues,
  queryParams,
}: LoadTableDataAction) => ({
  type: LOAD_TABLE,
  payload: {
    tableId,
    criteria,
    page,
    pageSize,
    sortBy,
    loadTimestamp,
    url,
    apiValues,
    queryParams,
  },
});

export const LoadDynamicQueryTable = ({
  tableId,
  criteria,
  page,
  pageSize,
  sortBy,
  loadTimestamp,
  url,
  dataValues,
  queryParams,
}: LoadTableDataAction) => ({
  type: LOAD_DYNAMIC_QUERY_TABLE,
  payload: {
    tableId,
    criteria,
    page,
    pageSize,
    sortBy,
    loadTimestamp,
    url,
    dataValues,
    queryParams,
  },
});

export const UpdateTableRow = ({
  tableId,
  property,
  rowIndex,
  columnIndex,
}: {
  tableId: string;
  property: { name: string; value: number };
  rowIndex: number;
  columnIndex: number;
}) => ({
  type: UPDATE_TABLE_ROW,
  payload: { tableId, property, rowIndex, columnIndex },
});

export const SetTableData = ({ data, tableId }: { data: Array<any>; tableId: string }) => ({
  type: SET_TABLE_DATA,
  payload: { tableId, data },
});

export const SetAllTableData = ({ data, tableId }: { data: []; tableId: string }) => ({
  type: SET_ALL_TABLE_DATA,
  payload: { tableId, data },
});

export const SetLocallyPagination = ({
  pagination,
  tableId,
}: {
  pagination: AnyType;
  tableId: string;
}) => ({
  type: SET_LOCALLY_PAGINATION,
  payload: { tableId, pagination },
});

export const SetColumnData = ({ data, tableId }: { data: Array<any>; tableId: string }) => ({
  type: SET_COLUMN_DATA,
  payload: { tableId, data },
});

export const LoadTableSuccess = (payload: LoadTableDataSuccessAction) => ({
  type: LOAD_TABLE_SUCCESS,
  payload,
});

export const LoadTableError = (payload: LoadTableDataErrorAction) => ({
  type: LOAD_TABLE_ERROR,
  payload,
});

export const SaveTableRow = (payload: SaveTableRowAction) => ({
  type: SAVE_TABLE_ROW,
  payload,
});

export const SaveTableRowSuccess = (payload: SaveTableRowSuccessAction) => ({
  type: SAVE_TABLE_ROW_SUCCESS,
  payload,
});

export const SaveTableRowError = (payload: SaveTableRowErrorAction) => ({
  type: SAVE_TABLE_ROW_ERROR,
  payload,
});

export const SaveTableData = (payload: SaveTableDataAction) => ({
  type: SAVE_TABLE_DATA,
  payload,
});

export const SaveTableDataSuccess = (payload: SaveTableDataSuccessAction) => ({
  type: SAVE_TABLE_DATA_SUCCESS,
  payload,
});

export const SaveTableDataError = (payload: SaveTableDataErrorAction) => ({
  type: SAVE_TABLE_DATA_ERROR,
  payload,
});

export const ToggleTableColumn = ({ tableId, selectedColumnIds }: ToggleTableColumnAction) => ({
  type: TOGGLE_TABLE_COLUMN,
  payload: { tableId, selectedColumnIds },
});

export const ToggleTableRow = ({
  tableId,
  rowId,
  isMultiSelect,
  column,
}: ToggleTableRowAction) => ({
  type: TOGGLE_TABLE_ROW,
  payload: { tableId, rowId, isMultiSelect, column },
});

export const SetTableExtraData = ({ tableId, column, extraTableData }) => ({
  type: SET_EXTRA_TABLE_DATA,
  payload: { tableId, column, extraTableData },
});

export const SetAllTableExtraData = ({ tableId, extraTableData }) => ({
  type: SET_ALL_EXTRA_TABLE_DATA,
  payload: { tableId, extraTableData },
});

export const ToggleAllTableRows = ({ tableId, selected }: ToggleAllTableRowsAction) => ({
  type: TOGGLE_ALL_TABLE_ROWS,
  payload: { tableId, selected },
});

export const SetFilterData = (payload) => ({
  type: SET_FILTER_DATA,
  payload,
});

export const ClearFilterData = (payload) => ({
  type: CLEAR_FILTER_DATA,
  payload,
});

export const RemoveFilterData = (payload) => ({
  type: REMOVE_FILTER_DATA,
  payload,
});

export const SetPredefinedCriteria = ({
  tableId,
  predefinedCriteria,
}: PredefinedCriteriaAction) => ({
  type: SET_PREDEFINED_CRITERIA,
  payload: { tableId, predefinedCriteria },
});

export const TriggerRefresh = ({ tableId }: TriggerRefreshAction) => ({
  type: TRIGGER_REFRESH,
  payload: { tableId },
});

export const ClearTable = (payload: ClearTableAction) => ({
  type: CLEAR_TABLE,
  payload,
});

export const ToggleTableFormModal = (payload: { tableId: string; open: boolean }) => ({
  type: TOGGLE_TABLE_FORM_MODAL,
  payload,
});

export const SetTableIsNewForm = (payload: { tableId: string; isNew: boolean }) => ({
  type: SET_TABLE_IS_NEW_FORM,
  payload,
});

export const ConcatLocalTableRow = (payload: {
  reported?: AnyType;
  tableId: string;
  formData: AnyType;
}) => ({
  type: CONCAT_TABLE_ROW,
  payload,
});

export const DeleteTableRow = (payload: {
  tableId: string;
  rowData: AnyType;
  reported?: number;
}) => ({
  type: DELETE_TABLE_ROW,
  payload,
});

export const AddLocalTableRow = (payload: { tableId: string; rowData: AnyType }) => ({
  type: ADD_LOCAL_TABLE_ROW,
  payload,
});

export const DeleteLocalTableRow = (payload: { tableId: string; rowData: AnyType }) => ({
  type: DELETE_LOCAL_TABLE_ROW,
  payload,
});

export const EditLocalTableRow = (payload: { tableId: string; rowData: AnyType }) => ({
  type: EDIT_LOCAL_TABLE_ROW,
  payload,
});

export const UndoLocalTableRow = (payload: { tableId: string; rowData: AnyType }) => ({
  type: UNDO_LOCAL_TABLE_ROW,
  payload,
});

export const SetActiveRow = (payload: { tableId: string; rowData: AnyType }) => ({
  type: SET_ACTIVE_ROW,
  payload,
});
