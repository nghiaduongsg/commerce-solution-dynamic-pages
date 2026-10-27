import { AnyType } from '@pkg-common/types';

export type ChangesConfirmationProps = {
  pageId: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  uiSchema?: AnyType;
  schema?: AnyType;
  title?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showMessage?: boolean;
  showButtons?: boolean;
};
