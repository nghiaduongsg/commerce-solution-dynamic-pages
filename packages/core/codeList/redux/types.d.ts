import { AnyType } from '@pkg-common/types';

export type CodeListReduxState = {
  CodeList: CodeListState;
};

export type CodeListItem = {
  code: string;
  label: string;
  attributes: Array<{ key: string; value: string }>;
  relatedObject?: { [key: string]: AnyType };
  expired?: boolean;
};

export type CodeListState = {
  lists: {
    [key: string]: Array<CodeListItem>;
  };
  loading: boolean;
};

export interface LoadCodeListAction {
  api: string;
  code: string;
  jsonPath?: Array<string>;
  method?: string;
  queryParams?: AnyType;
  dataValues?: AnyType;
  alwaysReload?: boolean;
  storeAsEntity?: boolean;
  renderWith?: {
    code: array<string>;
    label: array<string>;
  };
  showCode?: boolean;
}

export interface LoadManyCodeListAction {
  api: string;
  lists: Array<string>;
  method?: string;
  dataValues?: AnyType;
}
