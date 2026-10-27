import { AnyType, ApiValuesSchema, AppError } from '@pkg-common/types';

export type ApiDataReduxType = {
  ApiData: {
    [key: string]: ApiDataType;
  };
};

export type ApiDataType = {
  loading: boolean;
  data?: AnyType;
  error?: AppError;
  refreshId: number;
  finished: boolean;
};

export type CallApiDataType = {
  id: string;
  url: string;
  method?: string;
  pageId: string;
  data: AnyType;
  jsonPath?: Array<string>;
  metadata?: ApiValuesSchema;
  queryParams?: AnyType;
  callback?: () => void;
};
