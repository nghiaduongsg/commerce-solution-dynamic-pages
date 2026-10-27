import { AnyType } from '@pkg-common/types';
import { SxProps } from '@mui/system';

export type GenericDateProps = {
  id?: string;
  dataTestId: string;
  label: string;
  description?: string;
  value: string;
  disabled?: boolean;
  readonly?: boolean;
  formatAs?:
    | 'date'
    | 'datetime'
    | 'monthDay'
    | 'time'
    | 'dateTimeNoTimeZone'
    | 'dateArray'
    | 'dateTimeWithTimeZone';
  dateFormat?: string;
  locale: TLocale;
  widthSize?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  minDate?: string;
  maxDate?: string;
  minTime?: Date;
  maxTime?: Date;
  minutesStep?: number;
  disableDates?: (Date) => boolean;
  inputProps?: AnyType;
  onChange?: (string) => void;
  valid?: boolean;
  helpText?: string;
  errors?: React.ReactNode;
  fieldSx?: SxProps;
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  styledFieldLabel?: React.ReactNode;
};
