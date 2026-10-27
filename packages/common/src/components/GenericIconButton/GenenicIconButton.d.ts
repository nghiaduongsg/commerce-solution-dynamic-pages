import { AnyType, CheckFromSchema } from '@pkg-common/types';
import { WarnOnActionSchema } from '@pkg-form/types';

export default interface GenericIconButtonProps {
  id: string;
  label?: string;
  ariaLabel: string;
  ariaDescription?: string;
  size?: 'small' | 'medium' | 'large';
  ariaHasPopup?: boolean | string;
  ariaControls?: string;
  onClick: (event: AnyType) => void;
  icon?: JSX.Element;
  disabled?: boolean;
  ref?: AnyType;
  testId?: string;
  ariaExpanded?: boolean;
  styles?: AnyType;
  ariaKeyboardShortcuts?: string;
  ariaDescribedBy?: string;
  applyDebounce?: boolean;
  openInNewTab?: boolean;
  warning?: {
    fieldId: string;
  } & WarnOnActionSchema;
  onKeyDown?: (event: AnyType) => void;
  onKeyPress?: (event: AnyType) => void;
}
