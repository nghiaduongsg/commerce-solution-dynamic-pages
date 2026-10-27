import { AppError, AnyType } from '@pkg-common/types';

export type EntityReduxState = {
  Entities: EntityState;
};

export type EntityState = {
  id: string;
  url: string;
  entity: Record<string, AnyType> | Record<string, never>;
  error?: AppError;
  loading: boolean;
  entityIdKey: string;
  isNew: boolean;
  entityStoreId: string;
  formData: Record<string, AnyType> | Record<string, never>;
  diffs: Record<string, { prev: AnyType; current: AnyType }> | Record<string, never>;
  groupedDiffs: Record<string, { prev: AnyType; current: AnyType }> | Record<string, never>;
  entityDataAreaKey: string | undefined;
  extras: Record<string, AnyType> | Record<string, never>;
  lastUpdate?: number;
  serverUpdate?: number;
  validOnDate?: string;
  selectedItems: { [_: string]: Array<AnyType> };
  hookUpdates?: { [_: string]: number };
  lastClearUpdate?: number;
};

export interface SetEntityAction {
  entityId: string;
  initialEntityData: Record<string, AnyType> | Record<string, never>;
  extraData?: AnyType;
}

export interface SetTemporaryAttachmentAction {
  entityId: string;
  attachment: AnyType;
}

export interface SaveEntityAction {
  entityId: string;
  uiSchema?: AnyType;
  contextToken?: string;
}

export interface SaveEntitySuccessAction {
  entityId: string;
  entity: AnyType;
  messageKey: string;
  namespace: string;
  successUpdateMessageKey?: string;
}

export interface SaveEntityErrorAction {
  entityId: string;
  error: AppError;
  entity: AnyType;
  isNew?: boolean;
}

export interface DeleteEntityAction {
  entityId: string;
  code: string;
}

export interface DeleteEntitySuccessAction {
  entityId: string;
  code: string;
  tableId: string;
}

export interface DeleteEntityErrorAction {
  entityId: string;
  error: AppError;
}

export interface ClearEntityErrorAction {
  entityId: string;
}

export interface ClearEntityAction {
  entityId: string;
}

export interface SetEntityFormDataAction {
  entityId: string;
  data: AnyType;
  concat?: boolean;
  customFieldsKey?: string;
}

export interface AppendFormDataAction {
  entityId: string;
  data: AnyType;
}
