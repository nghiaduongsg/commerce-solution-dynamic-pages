import { FormContextSchema, SubformSchema } from '@pkg-form/types';
import { AnyType } from '@pkg-common/types';

export type DynamicSubformItemProps = {
  id: string;
  subform?: SubformSchema;
  disabled: boolean;
  namespace: string;
  schema?: AnyType;
  uiSchema?: AnyType;
  formData?: AnyType;
  formContext?: FormContextSchema;
  onChange?: (data) => void;
  formId?: string;
  uiSchemaOptions?: AnyType;
  item?: { children: { props: { formData: AnyType } } };
};
