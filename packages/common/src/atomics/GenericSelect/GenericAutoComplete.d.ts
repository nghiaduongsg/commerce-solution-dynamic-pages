export type AutocompleteOption = {
  code: string;
  label: string;
  expired?: boolean;
  attributes?: {
    key: string;
    value: string;
  }[];
};

export type AutocompleteLazyLoadOptions = {
  enabled?: boolean;
  loadThreshold?: number;
  interval?: number;
  rootMargin?: string;
};

export type AutocompleteTagsProps = {
  id: string;
  testId?: string;
  placeholder?: string;
  multiple?: boolean;
  selectAll?: boolean;
  options: Array<AutocompleteOption>;
  loading?: boolean | (() => boolean) | ((state: any) => boolean);
  additionalInfo?: string;
  loadingText?: string;
  showLabel?: boolean;
  disabledOptions?: Array<string | number | boolean>;
  onChange: (value: AutocompleteOption | Array<AutocompleteOption> | null) => void;
  onFocus?: () => void;
  value: string | Array<string>;
  required?: boolean;
  label?: string;
  valid?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  renderBy?: 'label' | 'code';
  errors?: null | JSX.Element;
  truncate?: {
    enabled?: boolean;
    width?: number;
    lines?: number;
  };
  styledFieldLabel?: React.ReactNode;
  lazyLoad?: AutocompleteLazyLoadOptions;
};
