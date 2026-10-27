import { FormContextSchema } from '@pkg-form/types';
import { AnyType } from '@pkg-common/types';

export type ObjectFieldTemplateProps = {
  properties: Array<{
    name: string;
    content: {
      props: {
        uiSchema: AnyType;
        schema: AnyType;
        idSchema: {
          $id: string;
        };
      };
    };
  }>;
  uiSchema: AnyType;
  schema: AnyType;
  formData: AnyType;
  idSchema: {
    $id: string;
  };
  formContext: FormContextSchema;
};
