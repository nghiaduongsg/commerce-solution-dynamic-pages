import { ReactElement } from 'react';

export type DynamicFormProps = {
  id: string;
  data?: any;
  dataTestId?: string;
  disabled?: boolean;
  locked?: boolean;
  loading?: boolean;
  onSubmit?: (data) => void;
  onChange?: (data) => void;
  onClear?: () => void;
  // TODO: Delete schema and uiSchema when schema is available from api
  schema: any;
  uiSchema: any;
  submitButton?: ReactElement | null;
  lockButton?: ReactElement | null;
  formContext?: { [key: string]: any };
  buttonPosition?: 'DEFAULT' | 'ABSOLUTE';
};
