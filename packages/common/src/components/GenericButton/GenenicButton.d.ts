import { ReactNode } from 'react';
import { AnyType, CheckFromSchema } from '@pkg-common/types';
import { SxProps } from '@mui/system';

export default interface GenericButtonProps {
  id: string;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  label?: string;
  ariaLabel?: string;
  ariaDescription?: string;
  ariaKeyboardShortcuts?: string;
  onClick?: (event: AnyType) => void;
  styles?: SxProps;
  customStyles?: SxProps;
  type?: 'reset' | 'submit' | 'button';
  disabled?: boolean;
  testId?: string;
  href?: string;
  color?: 'primary' | 'secondary' | string;
  startIcon?: ReactNode;
  endIcon?: JSX.Element;
  ariaHasPopup?: boolean | string;
  ariaControls?: string;
  loading?: boolean;
  openInNewTab?: boolean;
  warning?: {
    fieldId: string;
    whenToWarn?: CheckFromSchema;
    translation: { warningTitleKey: string; warningMessageKey: string; namespace?: string };
  };
}
