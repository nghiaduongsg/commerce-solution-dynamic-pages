export type IstRadioButtonProps = {
  id: string;
  label: string;
  testId: string;
  value: string | Array<string>;
  readonly: boolean;
  required: boolean;
  showLabel: boolean;
  disabled: boolean;
  onChange?: (string) => void;
  options: Array<{ code: string; label: string }>;
  errors?: null | JSX.Element;
  valid: boolean;
  includeAllOption?: boolean;
  additionalInfo?: string;
  styledFieldLabel?: React.ReactNode;
};
