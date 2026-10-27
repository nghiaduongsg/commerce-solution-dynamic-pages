import { ValidationRule } from '@pkg-form/types';

interface HistoryInputProps {
  id: string;
  label: string;
  value: any;
  required: boolean;
  type: fieldType;
  disabled: boolean;
  serverErrors?: string[];
  diffs?: string[];
  isAmount?: boolean;
  validations?: Partial<ValidationRule>;
  onChange?: Dispatch<SetStateAction<type>>;
  showLabel: boolean;
  endAdornment?: JSX.Element;
}
