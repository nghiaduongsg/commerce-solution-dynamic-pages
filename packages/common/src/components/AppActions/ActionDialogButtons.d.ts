import { AnyType } from '@pkg-common/types';
import { AppActionButtons } from '@pkg-common/button/types';

export type ActionDialogButtonsProps = {
  mainActionLabel?: string;
  id: string;
  onCancel?: () => void;
  onSubmit?: (data?: AnyType) => void;
  buttons?: AppActionButtons | Record<any, any>;
  onSuccessCallback?: () => void;
  shouldSetFormDirty?: boolean;
  disabled?: boolean;
};
