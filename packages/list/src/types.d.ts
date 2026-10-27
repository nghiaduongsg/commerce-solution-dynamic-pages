import { AnyType, AppError, ApiValuesSchema } from '@pkg-common/types';
import { DefaultCriteriaValue } from '@pkg-common/utils/defaultCriteria';
import { AppActionButtons } from '@pkg-common/button/types';
import { DefaultValueFromSchema } from '@pkg-form/types';

export type TableState = {
  id: string;
  columnsLevel1?: { rowId: string; property: string; columns: Array<TableColumnConfiguration> };
  columnsLevel2?: { rowId: string; property: string; columns: Array<TableColumnConfiguration> };
  columns: Array<TableColumnConfiguration>;
  pageData: Array<{ [key: string]: AnyType }>;
  localData: Array<{ [key: string]: AnyType }>;
  allData?: Array<{ [key: string]: AnyType }>;
  mappedData?: { [key: string]: AnyType };
  misc?: AnyType;
  selectedRowIds: { [key: string]: AnyType };
  multiple: boolean;
  extraTableData: { [key: string]: AnyType };
  loading: boolean;
  error: { [key: string]: AnyType };
  criteria: { [key: string]: AnyType };
  wrappedToFilter?: AnyType;
  removableQueries?: AnyType;
  filterEntities?: boolean;
  filterData: { [key: string]: AnyType };
  predefinedCriteria: { [key: string]: AnyType };
  url: string;
  innerColumns?: Array<{ [key: string]: AnyType }>;
  queryParams?: { [key: string]: string | boolean | number };
  entityUrl: string;
  rowIdKey: string;
  actions?: TableActions;
  parentEntity?: string;
  validationsId?: string;
  includedBillSegmentsWithoutValue?: Array<number>;
  disabled: boolean;
  correctionsDisabled?: boolean;
  pagination: {
    requestedPageSize: number | null;
    requestedPageNumber: number;
    totalElements: number;
    totalPages: number;
    currentPageNumberOfElements: number;
    currentPageNumber: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  sortBy?: string;
  defaultSortBy?: string;
  sortLocallyBy?: string;
  sortTieBreaker?: string;
  refresh: number;
  loadTimestamp: number;
  actionsType?: 'redirect' | 'modal';
  openTableForm?: boolean;
  isNewTableForm?: boolean;
  activeRow?: AnyType;
  initialised?: boolean;
  maintainFilters?: boolean;
  maxLimit?: number;
};

export interface InitTableDataAction {
  tableId: string;
  initialState: Partial<TableState>;
}

export interface LoadTableDataAction {
  tableId: string;
  criteria: { [key: string]: AnyType };
  page?: number;
  pageSize?: number;
  sortBy?: string;
  loadTimestamp: number;
  url?: string;
  dataAccessor?: Array<string>;
  apiValues?: ApiValuesSchema;
  dataValues?: AnyType;
  queryParams?: AnyType;
  wrappedToFilter?: AnyType;
}

export interface LoadTableDataSuccessAction {
  tableId: string;
  data: { [key: string]: AnyType };
  sortBy?: string;
  loadTimestamp: number;
  url?: string;
  dataAccessor?: Array<string>;
  apiValues?: ApiValuesSchema;
}

export interface LoadTableDataErrorAction {
  tableId: string;
  error: AppError;
}

export interface SaveTableDataAction {
  tableId: string;
  entityId: string;
  url: string;
  data?: AnyType;
  method?: string;
}

export interface SaveTableDataSuccessAction {
  tableId: string;
  data: AnyType;
}

export interface SaveTableDataErrorAction {
  tableId: string;
  entityId: string;
  error: AppError;
}

export interface SaveTableRowAction {
  entityId: string;
  url: string;
  method?: string;
  data: AnyType;
}

export interface SaveTableRowSuccessAction {
  entityId: string;
  entity: AnyType;
  messageKey: string;
}

export interface SaveTableRowErrorAction {
  entityId: string;
  error: AppError;
  entity: AnyType;
}

export interface ToggleTableRowAction {
  tableId: string;
  rowId: string;
  isMultiSelect: boolean;
  column?: number;
}

export interface ToggleAllTableRowsAction {
  tableId: string;
  selected: boolean;
}

export interface ToggleTableColumnAction {
  tableId: string;
  selectedColumnIds: string[];
}

export interface SetSelectionAction {
  tableId: string;
  selections: { [key: string]: AnyType };
  column?: number;
  maxLimit?: number;
}

export interface SetTableMaxLimitAction {
  tableId: string;
  maxLimit?: number;
}

export interface ClearSelectionsAction {
  tableId: string;
  column?: number;
}

export interface ClearCriteriaAction {
  tableId: string;
}

export interface ApplyCriteriaAction {
  tableId: string;
  criteria?: { [_: string]: string };
}

export interface SetPageAction {
  tableId: string;
  page: number;
}

export interface SetPageSizeAction {
  tableId: string;
  pageSize: number;
}

export interface SetSortByAction {
  tableId: string;
  sortBy: string;
}

export interface SetSortLocallyByAction {
  tableId: string;
  sortLocallyBy: string;
  dataType?: string;
}

export interface PredefinedCriteriaAction {
  tableId: string;
  predefinedCriteria: { [key: string]: AnyType };
}

export interface TriggerRefreshAction {
  tableId: string;
}

export interface ClearTableAction {
  tableId: string;
}

export type ReduxTablesState = {
  Tables: {
    [key: string]: TableState;
  };
};

export type TableColumnConfiguration = {
  type: string;
  subType?: string;
  name: string;
  ariaLabel?: string;
  ariaDescription?: string;
  accessors: Array<string>;
  fallbackAccessors?: Array<string>;
  filterByUserLanguage?: boolean;
  width?: string | number;
  align: 'left' | 'center' | 'right' | 'justify' | 'inherit' | undefined;
  visible: boolean;
  newLine?: boolean;
  clickable?: boolean;
  entityId?: string;
  entityTitle?: string;
  sortBy?: string;
  sortLocallyBy?: string;
  defaultValue?: string;
  format?: string;
  relatedColumn?: string | Record<string, any>;
  defaultSymbol?: string;
  actionModalSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  truncate?: {
    enabled: boolean;
    width: number;
    lines: number;
  };
  visibleWhenSourceMode?: boolean;
  populatedBy?: Array<string>;
  statusField?: string;
  errorsField?: string;
};

export type TablePaginationConfiguration = {
  enabled: boolean;
  pageSizes: Array<number>;
  defaultPageSize: number;
};

export type TableReadSchemas = {
  tableId: string;
  jsonSchema: string;
  uiSchema: string;
};

export type QuickViewConfiguration = {
  schema?: AnyType;
  uiSchema?: AnyType;
  'ui:buttons'?: AppActionButtons;
  title?: string[];
  enabled: boolean;
};

export type TableFiltersType = 'COLLAPSE' | 'DRAWER' | 'TOP';
export type TableFiltersMode = 'QUICK_FILTER' | 'ON_CLICK';

export type TableConfiguration = {
  'ui:labels': {
    namespace: string;
    bannerNamespace?: string;
  };
  'ui:buttons'?: AppActionButtons;
  'ui:row:buttons'?: AppActionButtons;
  refreshFromButtons?: Array<string>;
  tableType?: GenericTableStyles;
  entityId?: string | Record<string, AnyType>;
  omitLinePreviewWhenDisabled?: boolean;
  defaultDisabledActions?: AppActionButtons;
  isDisabled?: boolean;
  tableId: string;
  tooltip: string;
  tableData?: AnyType;
  title?: string | null;
  showTitle?: boolean;
  infoMessage?: string;
  filterEntities: boolean;
  openFilters: boolean;
  expanded?: boolean;
  addNumberOfLines?: boolean;
  subTitle?: string | null;
  triggerRefreshId?: string;
  avoidDefaultLoad?: boolean;
  // TODO: Unify url and dataAccessor into apiValues
  url: string;
  parentEntity?: string;
  actionsType?: 'redirect' | 'modal';
  columns?: Array<TableColumnConfiguration>;
  rowId: string;
  permissionLoadKey?: string;
  pagination?: TablePaginationConfiguration;
  entityDataAreaKey?: string;
  readSchema?: TableReadSchemas;
  selections?: TableSelectionsConfiguration;
  actionDetails?: TableActionsDetails;
  actions?: TableActions;
  onEditRow?: TableActionRow;
  onReadRow?: TableActionRow;
  renderWithNoData?: boolean;
  entityUrl?: string;
  addAndDetailsBtn?: boolean;
  filtersType?: TableFiltersType;
  filtersMode?: TableFiltersMode;
  boldRows?: 'LAST' | 'EVEN' | 'ODD';
  permissionKey?: string;
  saveActionType?: 'SAVE_LOCALLY';
  baseDataTestId?: string;
  collapsible?: boolean;
  apiValues?: ApiValuesSchema;
  innerColumns?: Array<TableColumnConfiguration>;
  local?: {
    enabled: boolean;
    validationsField: string;
  };
  expandable?: boolean;
  uploadEntity?: {
    hasImport: boolean;
    uploadUrl: string;
    redirectPageId: string;
  };
  unfolded?: boolean;
  exportable?: boolean;
  exportOptions?: { applyNewExport: boolean; permissionKey: string };
  refreshable?: boolean;
  columnConfigurable?: boolean;
  heightAdjustable?: boolean;
  defaultSortBy?: string;
  defaultCriteria?: { [key: string]: DefaultCriteriaValue };
  sortTieBreaker?: string;
  valueFrom?: DefaultValueFromSchema;
  removableQueries?: Array<string>;
  quickView?: QuickView;
  enableQuickView?: boolean;
  styleOverrides?: AnyType;
  emptyStateBanner?: {
    enabled: boolean;
    namespace?: string;
    message?: string;
    bgColor?: string;
  };
  icon?: string;
  showActions?: boolean;
  maintainFilters?: boolean;
  'ui:mandatoryBulkActionCriterion'?: string;
};

export type TableActions = {
  filterEntities?: boolean;
};

export type TableActionsDetails = {
  createEntity?: {
    routes?: Array<string>;
    jsonPath?: Array<string>;
    selectCodeList?: AnyType;
  };
  readEntity?: {
    routes: Array<string>;
    jsonPath: Array<string>;
    pathParam: Array<string>;
  };
  updateEntity?: {
    routes: Array<string>;
    jsonPath: Array<string>;
    pathParam: Array<string>;
  };
  redirectEntity?: {
    routes: Array<string>;
    jsonPath: Array<string>;
    pathParam: Array<string>;
  };
  duplicateEntity?: {
    routes: Array<string>;
    jsonPath: Array<string>;
    pathParam: Array<string>;
  };
};

export type TableSelectionsConfiguration = {
  enabled: boolean;
  multiple: boolean;
  allowSelectAll?: boolean;
  comparable?: boolean;
  onSelectionsApplied?: (selections) => void;
  onCancel?: () => void;
  styles?: AnyType;
  selectableBy?: string;
  label?: string;
  onLinePress?: boolean;
  maxLimit?: number;
  summary?: {
    enabled: boolean;
    labelPath: Array<string>;
  };
};

export type TableFilteringConfiguration = {
  enabled: boolean;
  schema?: { [_: string]: AnyType };
  uiSchema?: { [_: string]: AnyType };
};

type TableActionRow = ({ entityId: string, rowData: AnyType }) => void | undefined;
