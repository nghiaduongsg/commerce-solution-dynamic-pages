import { SxProps } from '@mui/system';
import { ActionButtonType } from '@pkg-common/components/AppActions/types';

export type ActionButtonProps = {
  id: string;
  elementId?: string;
  action: ActionButtonType;
  onSuccessCallback?: () => void;
  style?: 'menu' | 'button' | 'icon' | 'simple';
  checkPermissions: boolean;
  sx?: SxProps;
  parentId?: string;
  onButtonPress?: () => void;
};
