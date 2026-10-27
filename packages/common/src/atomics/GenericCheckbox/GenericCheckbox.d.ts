import { AnyType } from '@pkg-common/types';
export type GenericCheckboxProps = {
  id: string;
  label?: string;
  value: boolean;
  invalid?: boolean;
  additionalInfo?: string;
  /**
   *  Optional HEX color code.
   *  If omitted a default color is used
   */
  uiSchema?: AnyType;
  color?: string;
  /**
   *  The below boolean values are optional
   */

  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autofocus?: boolean;
  errors?: JSX.Element;
  ariaHasPopup?: boolean;
  /**
   *  Makes the Checkbox appear
   *  with a minus sign [-]
   *  instead of tick [✔]
   */
  isIndeterminate?: boolean;
  /**
   *   On change function is required
   *   we need to know whether or not
   *   the value has been checked.
   */
  onChange: (boolean) => void;
  onKeyDown?: (boolean) => void;
  /**
   * Optional Functions
   */
  onBlur?: (string, boolean) => void;
  onFocus?: (string, boolean) => void;
};
