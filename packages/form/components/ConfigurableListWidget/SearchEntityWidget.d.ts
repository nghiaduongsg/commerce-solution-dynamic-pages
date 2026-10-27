import { ApiValuesSchema, DataSourceSchema, FormContextSchema } from '@pkg-form/types';
import { AnyType } from '@pkg-common/types';

export type SearchEntityWidgetProps = {
  value: AnyType;
  widgetLabel: string;
  onChange: (any) => void;
  entitySourceId: string;
  entityIdKey: string;
  idKeyAs?: string;
  fieldKeyAs?: string;
  selectAll?: boolean;
  namespace?: string;
  warnOnChange?: AnyType;
  entityFields?: Array<string>;
  isFlat?: boolean;
  configuration?: AnyType;
  uiSchema?: AnyType;
  schema?: AnyType;
  linkRoute?: ApiValuesSchema;
  parentId?: string;
  entitySource?: DataSourceSchema;
  formContext: FormContextSchema;
  options: AnyType;
  excludeFromLabel?: Array<string>;
  valid?: boolean;
  filters?: boolean;
  searchById?: {
    enabled: boolean;
    idParam?: string;
  };
};
