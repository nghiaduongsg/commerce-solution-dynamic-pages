import { ApiValuesSchema, CheckFromSchema, AnyType } from '@pkg-common/types';
import { SxProps } from '@mui/system';

export type ActionButtonTypes =
  | 'redirect'
  | 'default'
  | 'download'
  | 'EDIT'
  | 'DELETE'
  | 'DUPLICATE';

export type ActionButtonStyles = 'button' | 'menu' | 'icon' | 'simple' | 'inner-menu' | 'floating';

export type ActionButtonType = {
  type?:
    | 'redirect'
    | 'default'
    | 'download'
    | 'info'
    | 'main'
    | 'DELETE'
    | 'ADD_LOCALLY'
    | 'SAVE_LOCAL_TABLE'
    | 'DELETE_LOCALLY'
    | 'EDIT_LOCALLY'
    | 'UNDO_LOCALLY'
    | 'exportFilters'
    | 'importFilters'
    | 'ADD_CASE_ACTIVITY'
    | 'EDIT_CASE_ACTIVITY';
  style?: ActionButtonStyles;
  title?: string;
  namespace?: string;
  addToField?: string;
  avoidSubmit?: boolean;
  source?: AnyType;
  redirectSourceId?: string;
  confirm?: boolean;
  confirmChanges?: boolean;
  permissionKey?: string | ApiValuesSchema;
  values?: ApiValuesSchema;
  visibilityFrom?: CheckFromSchema;
  disabledFrom?: CheckFromSchema;
  warnOnAction?: {
    whenToWarn: CheckFromSchema;
    translation: { warningTitleKey: string; warningMessageKey: string; namespace?: string };
  };
  sx?: SxProps;
  infoMessage?: string;
  notify?: {
    success?: string;
    error?: string;
  };
  groups?: Array<ActionButtonType>;
  schemas?: {
    schema: AnyType;
    uiSchema: AnyType;
  };
  icon?: string;
  actionId?: string;
  onClick?: (param: AnyType | undefined, source?: AnyType) => void;
  disabled?: boolean;
  checkValidButtons?: boolean;
  localStatusButton?: boolean;
  showClientValidations?: boolean;
  onSuccessRedirect?: (param: AnyType | undefined) => void;
  refersTo?: string;
  shouldSetPageDirty?: boolean;
  openInNewTab?: boolean;
};

export type AppActionButtons = {
  pageId?: string;
  visibilityFrom?: CheckFromSchema;
  replaceMainButton?: boolean;
  type?: 'redirect' | 'default';
  style?: 'button' | 'menu' | 'icon';
  buttons: Array<ActionButtonType>;
  checkValidButtons?: boolean;
  checkValidButtonsExceptFrom?: Array<string>;
};

export type AppActionsType = {
  page: {
    id: string;
    elementId?: string;
    url?: string;
    idKey?: string;
    namespace?: string;
    refersTo?: string;
  };
  parentId?: string;
  source?: AnyType;
  disabled?: boolean;
  checkPermissions?: boolean;
  disabledForm?: CheckFromSchema;
  onSuccessCallback?: () => void;
  actions?: AppActionButtons;
  defaultActions?: AnyType;
  mode?: 'LOCAL' | 'DEFAULT';
  namespace?: string;
  sx?: SxProps;
  onButtonPress?: () => void;
};

type SourceUser = {
  id?: string;
};

type SourceExceptionCalendar = {
  code?: string;
};

type SourceResourceCalendar = {
  code?: string;
};

export type ButtonKeySource = {
  id?: string;
  code?: string;
  notificationId?: string;
  attachmentId?: string;
  candidateId?: string;
  ftId?: string;
  liabilityId?: string;
  exceptionCalendar?: SourceExceptionCalendar;
  resourceCalendar?: SourceResourceCalendar;
  user?: SourceUser;
  calendarCd?: string;
  [key: string]: any;
};
