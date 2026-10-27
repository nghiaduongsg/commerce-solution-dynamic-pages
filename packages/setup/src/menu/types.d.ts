import { AppError } from '@setup/error';

export type MenuState = {
  loading: boolean;
  items: Array<MenuItem> | [];
  error: AppError | null;
};

export type MenuItem = {
  code: string;
  codeDescription: string;
  target: string;
  order: number;
  securableObjectKey: string;
  securableObjectOperationsKey: string;
  children: Array<MenuItem> | null;
};
