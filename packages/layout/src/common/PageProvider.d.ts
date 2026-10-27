import { SxProps } from '@mui/system';

export type PageProviderProps = {
  viewMode?: 'form' | 'detail';
  pageId: string;
  idKey?: string;
  subType?: string;
  hideActionButtons?: boolean;
  disabled: boolean;
  forbiddenImage: string;
  errorImage: string;
  serverErrorImage: string;
  heroImage: string;
  overrides?: {
    includeGlobalSearch: boolean;
    textSx?: SxProps;
    backButtonSx?: SxProps;
  };
};
