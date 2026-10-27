import { Theme } from '@mui/material';
import { SxProps } from '@mui/system';

export type AnyType = any;
type ValueType = null | undefined | Array<AnyType>;
export interface CardFloatingThemeTypes extends Theme {}

export type AppErrorViolation = {
  fieldName?: string | null;
  rejectedValue: AnyType;
  message: string;
  errorCode?: string;
  warning?: boolean;
};

export type AppError = {
  message: string;
  errorCode?: string;
  status?: number;
  violation?: string;
  violations?: Array<AppErrorViolation>;
  innerViolations?: Array<AppErrorViolation>;
};

export type defaultActionType = {
  type: string;
  payload: { [key: string]: AnyType };
};

export type AppColors = {
  visibilityFrom: CheckFromSchema;
  color: string;
  icon?: string;
  border?: boolean;
  iconStyles?: AnyType;
  title?: string;
};

export type CodeListItem = {
  code: string;
  label: string;
  attributes: Array<{ key: string; value: string }>;
  relatedObject?: { [key: string]: AnyType };
  expired?: boolean;
};

export type BaseRelatedSchema = {
  code: string;
  replacements?: Array<ReplacementSchema>;
  queryFrom?: Array<ReplacementSchema>;
  value?: string;
};

export type RelatedCodelistSchema = BaseRelatedSchema & { attribute: string };
export type RelatedObjectSchema = BaseRelatedSchema & { property: string };
export type RelatedSchema = RelatedCodelistSchema | RelatedObjectSchema;
export type CheckFromSchemaWithPrecision = CheckFromSchema & { precision?: number };
export type DataSourceSchema = {
  type?: StoreTypesSchema;
  code?: string;
  jsonPath?: Array<string>;
  jsonPathReplacement?: DataSourceSchema;
  performQuery?: boolean;
  transformToArray?: boolean;
  relatedCodeList?: RelatedCodelistSchema;
  relatedObject?: RelatedObjectSchema;
  reverse?: boolean;
  applyWhen?: CheckFromSchema;
  operator?: 'sum' | 'concat' | 'keys' | 'first' | 'join' | 'array' | 'multiline';
  calculationOutputIfEmpty?: 0 | null;
  __JSON_PATH__?: string;
};

export type FieldConditionSchema = {
  type?: string; //temporary
  checkWhenSource?: DataSourceSchema;
  checkWhen?: Array<string | number | boolean>;
  applyWhen?: CheckFromSchema;
  operator?:
    | 'equals'
    | 'greaterEquals'
    | 'greater'
    | 'lowerEquals'
    | 'lower'
    | 'not'
    | 'isNull'
    | 'isUndefined'
    | 'equalsOrNull'
    | 'isNotLoggedInUser'
    | 'isLoggedInUser'
    | 'length'
    | 'lengthGreaterEquals';
  key: string;
  jsonPath?: string | Array<string | number | boolean>;
  source: DataSourceSchema;
  isOptional?: boolean;
  defaultValue?: boolean;
};

export type CheckFromSchema = {
  operator: 'every' | 'some' | 'none' | 'add' | 'multiply' | 'percentage';
  calculationOutputIfEmpty?: 0 | null;
  fields: Array<FieldConditionSchema>;
  source?: DataSourceSchema;
};

export type ReplacementSchema = {
  key: string;
  type?: string;
  defaultValue?: Array<JsonPathSchema>;
  isOptional?: boolean;
  visible?: boolean;
  source?: DataSourceSchema;
};

export type JsonPathSchema = {
  jsonPath?: Array<string>;
};

export type AlternateUrlSchema = {
  condition: CheckFromSchema;
  url: string;
  replacements?: Array<FieldConditionSchema>;
};

export type ApiValuesSchema = {
  url: string;
  alternateUrls?: Array<AlternateUrlSchema>;
  // TODO: rename into resource code, since this structure is used for a lot of purposes and not only codelists
  codeList?: string;
  type?: string;
  // TODO: this property will replace the codeList (see previous todo comment)
  resourceId?: string;
  resourceToEntity?: string;
  resourceToFormFields?: Array<{
    dataPath: Array<string>;
    fieldPath: DataSourceSchema;
  }>;
  unwrapDataArea?: boolean;
  resourcePath?: Array<string>;
  method?: 'get' | 'put' | 'delete' | 'post';
  jsonPath?: Array<string>;
  alwaysReload?: boolean;
  performQuery?: boolean;
  ignoreParamsIfNotFound?: boolean;
  dataFrom?: Array<FieldConditionSchema>;
  queryFrom?: Array<FieldConditionSchema>;
  replacements?: Array<FieldConditionSchema>;
  applyWhen?: CheckFromSchema;
  unifyData?: boolean;
  wrapToProperty?: string;
  disableOptionWhen?: {
    key: string;
    value: AnyType;
    type?: 'ATTRIBUTE';
  };
  refreshFromButtons?: Array<string>;
  avoidClearApiData?: boolean;
  applyOnUrlChange?: boolean;
  saveAs?: string;
  initiateClone?: string;
  skipClearFormServerErrorsOnSuccess?: boolean;
  mode?: 'EVERY_TIME' | 'ONLY_ONCE';
};

export type InfoSchema = {
  type: 'DEFAULT' | 'TOOLTIP' | 'FORMATTED_TIME' | 'DYNAMIC_MESSAGE';
  visibilityFrom: CheckFromSchema;
  infoMessage: string | string[];
  variant?: 'standard' | 'filled' | 'outlined';
  severity: 'info' | 'warning' | 'error';
  displayIcon: boolean;
  fields?: Array<FieldConditionSchema>;
  namespace?: string;
  sxIcon?: SxProps;
  allowHtml?: boolean;
};

export type StoreTypesSchema =
  | 'SELF'
  | 'ENTITY'
  | 'FILTERS'
  | 'LIST'
  | 'STORE'
  | 'NODE'
  | 'API_DATA'
  | 'WIDGET_PATH'
  | 'ROUTER'
  | 'ROUTER_DATA'
  | 'ROUTER_QUERY';

export type SidePanelInfoSchema = {
  key: string;
  schema: AnyType;
  uiSchema: AnyType;
  visibilityFrom?: CheckFromSchema;
  isIcon?: boolean;
  type?: 'History' | 'Today' | 'Default';
};
