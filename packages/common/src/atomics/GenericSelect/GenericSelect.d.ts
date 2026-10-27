import { AutocompleteLazyLoadOptions } from './GenericAutoComplete.d';

export type GenericSelectProps = {
  options: Array<{ code: string; label: string }>;
  disabledOptions?: (string | boolean | number)[];
  id: string;
  renderBy?: 'label' | 'code';
  label?: string;
  testId: string;
  value: string | Array<string>;
  additionalInfo?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  multiple?: boolean;
  selectAll?: boolean;
  autofocus?: boolean;
  children?: Array<JSX.Element> | JSX.Element;
  inputProps?: any;
  onChange?: (string) => void;
  onBlur?: (e) => void;
  onFocus?: () => void;
  errors?: null | JSX.Element;
  valid?: boolean;
  clearable?: boolean;
  widthSize?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  helpText?: string;
  loading?: boolean | (() => boolean) | ((state: any) => boolean);
  showLabel?: boolean;
  placeholder?: string;
  truncate?: {
    enabled?: boolean;
    width?: number;
    lines?: number;
  };
  styledFieldLabel?: React.ReactNode;
  lazyLoad?: AutocompleteLazyLoadOptions;
};
