import { GridSpacing } from '@mui/material';
import { AxiosInstance } from 'axios';
import {
  ApiValuesSchema,
  AppError,
  AppErrorViolation,
  CheckFromSchema,
  DataSourceSchema,
  InfoSchema,
  ReplacementSchema,
  StoreTypesSchema,
  AnyType,
} from '@pkg-common/types';
import { AppActionButtons } from '@pkg-common/components/AppActions/types';

export type FormWidgetOptions = {
  buttons?: AppActionButtons;
  extended?: boolean;
  selectAll?: boolean;
  uniqueFields: AnyType;
  uniqueFieldsIf: AnyType;
  allowCardItemDialogActionsFrom: AnyType;
  widthSize?: 'xs' | 'sm' | 'md' | 'lg';
  saveActionType?: 'SAVE_LOCALLY';
  configuration?: AnyType;
  truncate?: {
    enabled?: boolean;
    width?: number;
    lines?: number;
  };
  showLabel?: boolean;
  labelAlignment?: 'left' | 'top';
  unique?: boolean;
  validations: Partial<ValidationRule>;
  enumDisabled?: Array<string>;
  disabledOptions?: Array<string>;
  apiValues: ApiValuesSchema;
  link?: LinkSchema;
  warnOnChange?: WarnOnChangeSchema;
  multiple: boolean;
  translation: TranslationSchema;
  visibleInCard?: boolean;
  defaultValueFrom?: DefaultValueFromSchema;
  omitValidationHints: boolean;
  mapToProperty?: string;
  slim?: boolean;
  visible?: boolean;
  validateWhen?: CheckFromSchema;
  clearFrom?: ClearFromSchema;
  fullWidth?: boolean;
  fullSize?: boolean;
  applyValueFromComparison?: ApplyValueFromComparisonSchema;
  changeWidgetFrom?: AnyType;
  validateFrom?: ValidateFromSchema | ValidateFromSchema[];
  valueFrom?: DefaultValueFromSchema;
  dataFrom?: ApiValuesSchema;
  callApis?: Array<ApiValuesSchema>;

  withTyping: boolean;
  emptyValue?: string | null;
  fieldType?: string;
  mask?: { pattern: string; prefixFrom?: CheckFromSchema; applyWhen?: CheckFromSchema };
  variant?:
    | 'body1'
    | 'body2'
    | 'button'
    | 'caption'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'inherit'
    | 'overline'
    | 'subtitle1'
    | 'subtitle2';
  strong?: boolean;
  alignment?: 'center' | 'inherit' | 'left' | 'right';
  suggestionFrom?: AnyType;
  autoCompleteListKeys?: AnyType;
  icon?: string;
  changeIndicators?: ChangeIndicatorsSchema;
};

export type DateWidgetOptions = FormWidgetOptions & {
  minutesStep?: number;
  formatAs?:
    | 'date'
    | 'datetime'
    | 'monthDay'
    | 'time'
    | 'dateTimeNoTimeZone'
    | 'dateArray'
    | 'dateTimeWithTimeZone';
  noValueText?: string;
};

export type LazyLoadOptions = {
  enabled?: boolean;
  loadThreshold?: number;
  interval?: number;
  rootMargin?: string;
};

export type DropDownWidgetOptions = FormWidgetOptions & {
  enumOptions?: Array<{ value: any; label: string }>;
  callApis: Array<ApiValuesSchema>;
  optionsResourceId: string;
  excludeExpired?: boolean;
  ignoreInactive?: boolean;
  disableOptionWhen?: {
    key: string;
    value: AnyType;
    type?: 'ATTRIBUTE';
  };
  lazyLoad?: LazyLoadOptions;
};

export type SelectWidgetOptions = FormWidgetOptions & {
  ignoreInactive?: boolean;
  threshold?: number;
  multiple: boolean;
  filterFrom?: FilterFromSchema;
  renderWith?: RenderWithSchema;
  defaultValues: {
    enumNames: string[];
    enum: AnyType[];
  };
  storeAsEntity?: {
    code: string;
    entityIdKey?: string;
    sort?: SortSource;
  };
  avoidDefaultLoad?: boolean;
  excludeExpired?: boolean;
  disableFormDirtying?: boolean;
  autofillOnlyOption?: boolean;
  lazyLoad?: LazyLoadOptions;
};

export type RadioWidgetOptions = FormWidgetOptions & {
  filterFrom?: FilterFromSchema;
  renderWith?: RenderWithSchema;
  defaultValues: {
    enumNames: string[];
    enum: AnyType[];
  };
  includeAllOption?: boolean;
};

export type ToggleGroupWidgetOptions = FormWidgetOptions & {
  defaultValues: {
    enumNames: string[];
    enum: AnyType[];
  };
};

export type ChartWidgetOptions = FormWidgetOptions & {
  data: Array<AnyType>;
  legendData: Array<AnyType>;
  propertyName: string;
  propertyValue: string;
  propertyDeletions: Array<string>;
  hideLegend: boolean;
};

export type TextWidgetOptions = FormWidgetOptions & {
  rows?: number;
  multiline?: boolean;
  endAdornment?: JSX.Element;
  startAdornment?: JSX.Element;
  textToUppercase?: boolean;
};

export type TopLevelFilter = {
  filterSchema: Record<string, AnyType>;
  filterUiSchema: Record<string, AnyType>;
};

export type CodelistTreeOptions = FormWidgetOptions &
  TextWidgetOptions & {
    relationshipType?: string;
    openByDefault?: boolean;
    topLevelFilter?: TopLevelFilter;
  };

export type VirtualisedTreeOptions = FormWidgetOptions & {
  childrenProperty?: string;
  nodeProperties: Array<string>;
  parentProperty: string;
  level: number;
  omitAddNew: boolean;
  omitDelete: boolean;
};

export type GroupObjectRows = {
  [key: string]: {
    columns: string[];
    code?: string;
    calculatedByBe?: boolean;
  };
};

export type GroupObjectWidgetOptions = FormWidgetOptions & {
  allColumns: Array<string>;
  rows: GroupObjectRows;
  disabledFrom?: CheckFromSchema;
  correctionsDisabledFrom?: CheckFromSchema;
  translations: { key: string; namespace: string };
  avoidDefaultLoad?: boolean;
  showTitle?: boolean;
};

export type ArrayHandlerOptions = FormWidgetOptions & {
  arrayColumns: AnyType;
  removable: boolean;
  selectable: boolean;
};

export type FormWidgetProps = {
  schema: AnyType;
  uiSchema: AnyType;
  id: string;
  componentName: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  excludeExpired?: boolean;
  autofocus?: boolean;
  label: string;
  onBlur?: (event) => void;
  onFocus?: (event) => void;
  warnOnChange?: (value) => void;
  inputProps?: AnyType;
  value: AnyType;
  onChange: (value) => void;
  options: FormWidgetOptions & LiabilityCaseScopeOptions;
  serverErrors?: Array<string>;
  serverErrorTypes?: Array<{ message: string; type: 'WARNING' | 'ERROR' }>;
  diffs?: Array<string>;
  formContext: FormContextSchema;
  icon?: string;
};

export type ValidationRule = {
  required?: boolean;
  shouldValidate?: boolean;
  minLength?: number;
  maxLength?: number;
  regex?: string;
  isJson?: boolean;
  minValue?: number | string | date;
  maxValue?: number | string | date;
  minValueExcludeLimit?: number | string | date;
  maxValueExcludeLimit?: number | string | date;
  errorMessage?: string;
  acceptSingleSpace?: boolean;
  reversibleSign?: boolean;
  minTime?: string;
  maxTime?: string;
  disableDates?: string[];
  requireYesNoValue?: boolean;
  offset?: string;
};

export type SubformSchema = {
  type: 'SUB_SCHEMA' | 'ELEMENTS' | 'PARAMETERS' | 'BANK_ELEMENTS';
  mainProperty: string;
  dependency: {
    entityId: string;
    entityIdKey: string;
    entityMainProperty: string;
    elementsProperty?: string;
    entityFields?: string[];
    selectEnabled?: boolean;
    createEnabled?: boolean;
    isFlat?: boolean;
    callApi: ApiValuesSchema;
  };
  populatedField: string;
  defaultFields: Array<string>;
  currentFormProperty?: string;
  comparedFormProperty?: string;
};

export type RenderWithSchema = {
  code: Array<string>;
  label: Array<string>;
};

export type ValidateFromSchema = {
  codelist?: string;
  offset?: string;
  attribute?:
    | 'required'
    | 'minLength'
    | 'maxLength'
    | 'regex'
    | 'minValue'
    | 'maxValue'
    | 'minValueExcludeLimit'
    | 'maxValueExcludeLimit'
    | 'minTime'
    | 'maxTime'
    | 'disableDates';
  source?: DataSourceSchema;
};

export type DefaultValueFromSchema = DataSourceSchema & {
  applyEmptyValues?: boolean;
  applyChangeWhen?: CheckFromSchema;
  exclude?: string;
  mode?:
    | 'EVERY_TIME_DEFAULT_VALUE_CHANGES'
    | 'EVERY_TIME_DEFAULT_VALUE_CHANGES_AND_ALLOW_OVERRIDES'
    | 'APPLY_WHEN_FIELD_VALUE_EMPTY'
    | 'ONLY_ONCE'
    | 'EVERY_TIME_DEFAULT_VALUE_CHANGES_AND_ALLOW_OVERRIDES_AFTER_SAVE';
};

export type ClearFromSchema = CheckFromSchema & {
  defaultValue?: AnyType;
  propertyNumberEquality?: boolean;
};

export type LinkSchema = {
  to: string;
  replacements: Array<ReplacementSchema>;
};

export type FilterFromSchema = {
  codelist: string;
  attribute?: string;
  source?: DataSourceSchema;
};

export type WarnOnChangeSchema = {
  enabled: boolean;
  translation?: {
    warningTitleKey?: string;
    warningMessageKey?: string;
  };
  whenToWarn: CheckFromSchema;
};

export type WarnOnActionSchema = {
  whenToWarn?: CheckFromSchema;
  translation?: {
    warningTitleKey?: string;
    warningMessageKey?: string;
    namespace?: string;
    parameters?: AnyType;
  };
};

export type TranslationSchema = {
  key: string;
  helpText?: string;
};

export type ChangeIndicatorsSchema = {
  enabled: boolean;
  colors?: {
    ADDED: string;
    EDITED: string;
  };
};

export type FormContextSchema = {
  formId: string;
  dataTestId?: string;
  namespace: string;
  idKey: string;
  omitValidationHints?: boolean;
  mechanism?: 'DEFAULT' | 'CUSTOM';
  avoidDefaultLoad: boolean;
  disableGrouping?: boolean;
  debounceUpdates?: boolean;
  hideButtons?: boolean;
  onChange?: (data) => void;
  changeIndicators?: ChangeIndicatorsSchema;
  filterMode?: boolean;
  hideServerErrors?: boolean;
};

export type DynamicFormGroupType =
  | 'Default'
  | 'Accordion'
  | 'Header'
  | 'TableCell'
  | 'Tab'
  | 'StackedAccordions'
  | 'Stepper'
  | 'Ungrouped'
  | 'Divider'
  | 'ExpandableCard'
  | 'Card'
  | 'ReviewDocument';

export type DynamicFormGroup = {
  key: string;
  type: DynamicFormGroupType;
  info?: string;
  icon?: string;
  defaultExpanded?: boolean;
  drawerActivityFrom?: CheckFromSchema;
  widgets?: Array<string>;
  groups?: Array<DynamicFormGroup>;
  tabs?: Array<DynamicFormGroup>;
  visibilityFrom?: CheckFromSchema;
  values?: ApiValuesSchema;
  'ui:buttons'?: AppActionButtons;
  'ui:information'?: InfoSchema;
  showHistoryDetails?: boolean;
  // TODO: required and isTable should be deleted
  required?: boolean;
  isTable?: boolean;
  highlight?: boolean;
  validationStep?: string;
  styles?: {
    spacing: GridSpacing;
  };
  options?: {
    icon?: string;
    activeTab?: number;
    schemaActiveTab: {
      key: string;
      applyChangeWhen?: CheckFromSchema;
    };
    translation?: {
      helpTextList?: Array<string>;
    };
    orientation?: 'horizontal' | 'vertical';
    omitValidationHints?: boolean;
    sourceGroups: DataSourceSchema;
    allowButtonClearByStep?: boolean;
    columns?: {
      xs: FormColumns;
      sm: FormColumns;
      md: FormColumns;
      lg: FormColumns;
      xl: FormColumns;
    };
    styleOverrides?: AnyType;
  };
  callApis?: Array<ApiValuesSchema>;
};

export type FormColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

//-------------------------------------------------------------------------

export type CurrencyAttributesProps = {
  symbolPosition?: string;
  thousandSeparator?: string;
  decimalPlaces?: string;
  decimalPlacesExtended?: string;
  symbol?: string;
  inactive?: string;
  decimalSeparator?: string;
};

export type SortSource = {
  source: {
    type?: 'SELF' | 'ENTITY' | 'FILTERS';
    code: string;
    jsonPath: string[];
  };
  sourceKey: string;
  propertyArray: string;
  propertyArrayItemKey: string;
};

export type SetupCodeParams = {
  entityId: string;
  formData: AnyType;
  entityHandler: AnyType;
  codeListHandler: (entityId: string) => void;
  validationsHandler: {
    addValidationErrors: (fieldId: string, errors: Array<string>) => void;
    removeValidationErrors: (fieldId: string, errors: Array<string>) => void;
    setValidationErrors: (fieldId: string, errors: Array<string>) => void;
    setServerErrors: (errors: Array<AppErrorViolation>) => void;
    clearServerErrors: () => void;
  };
  requestHandler: {
    baseUrl: string;
    axios: AxiosInstance;
  };
  utils: {
    wrapEntity: (data: AnyType) => AnyType;
    unwrapEntity: (data: AnyType, entityDataAreaKey: string) => AnyType;
    raiseSnackbar: (message: string, severity: 'dark' | 'error' | undefined, key?: string) => void;
    raiseSnackbars: (
      snackbars: Array<{
        payload: { message: string; severity: 'dark' | 'error' | undefined };
        type: string;
      }>,
    ) => void;
    handlePayloadErrors: (error: AppError) => void;
    showLoader: () => void;
    hideLoader: () => void;
  };
  schemas: { dataSchema: AnyType; uiSchema: AnyType; subType: AnyType };
};

export type SetupCodeOutput = Array<{
  jsonPath: string;
  onChange: (data: AnyType, prevData: AnyType) => void;
}>;

export type ApplyValueFromComparisonSubSchema = {
  type?: StoreTypesSchema;
  code: string;
  jsonPath: Array<string>;
  property: string;
};

export type ApplyValueFromComparisonSchema = {
  currentForm: ApplyValueFromComparisonSubSchema;
  comparedForm: ApplyValueFromComparisonSubSchema;
};

export type LiabilityCaseScopeOptions = {
  periodSchemas?: AnyType;
  liabilityPeriodSchemas?: AnyType;
  savedScopeJsonPath?: Array<string>;
  dependentChargesJsonPath?: Array<string>;
};
