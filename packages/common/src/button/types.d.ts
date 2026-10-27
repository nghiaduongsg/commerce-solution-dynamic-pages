import { ApiValuesSchema, CheckFromSchema } from '@pkg-common/types';
import { AnyType } from '@pkg-common/types';
import { SxProps } from '@mui/system';

export type ActionButtonStyles = 'button' | 'menu' | 'icon' | 'simple' | 'inner-menu' | 'floating';

export type ActionButtonType = {
  type?:
    | 'redirect'
    | 'default'
    | 'download'
    | 'info'
    | 'DELETE'
    | 'ADD_LOCALLY'
    | 'DELETE_LOCALLY'
    | 'EDIT_LOCALLY'
    | 'UNDO_LOCALLY';
  style?: ActionButtonStyles;
  title?: string;
  namespace?: string;
  warnOnAction?: object | AnyType;
  source?: AnyType;
  redirectSourceId?: string;
  confirm?: boolean;
  permissionKey?: string;
  values?: ApiValuesSchema;
  visibilityFrom?: CheckFromSchema;
  disabledFrom?: CheckFromSchema;
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
  onClick?: (param: AnyType | undefined) => void;
  disabled?: boolean;
  checkValidButtons?: boolean;
  checkChangeReason?: boolean;
  sx?: SxProps;
  localStatusButton?: boolean;
  shouldSetPageDirty?: boolean;
};

export type AppActionButtons = {
  pageId?: string;
  visibilityFrom?: CheckFromSchema;
  type?: 'redirect' | 'default';
  style?: 'button' | 'menu' | 'icon';
  buttons: Array<ActionButtonType>;
  checkValidButtons?: boolean;
  replaceMainButton?: boolean;
};

export type ButtonPressState = {
  latestButtonAction?: string;
  [key: string]: number | string | undefined;
};

export type UseButtonPressType = {
  pressed: number;
  markButtonPress: () => void;
};

export type UseLatestButtonActionType = {
  latestButtonAction: string | undefined;
  setLatestButtonAction: (_: string) => void;
  clearLatestButtonAction: () => void;
};
