import { AnyType } from '@pkg-common/types';

export type SimpleDialogProps = {
  id?: string;
  open: boolean;
  title: string;
  onClose?: () => void;
  isSimple?: boolean;
  children: AnyType;
  fullWidth?: boolean;
  buttons?: JSX.Element | Array<JSX.Element> | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xs' | false;
  filters?: boolean;
  keepMounted?: boolean;
};
