import { TranslationSchema, DefaultValueFromSchema, DataSourceSchema } from '@pkg-form/types';
import { TableConfiguration } from '@table/types';
import { AnyType } from '@pkg-common/types';

export type DynamicSchemaTableListWidgetProps = {
  id: string;
  state: AnyType;
  options: {
    readonly?: boolean;
    disabled?: boolean;
    translation?: TranslationSchema;
    sourceGroups?: DataSourceSchema;
    defaultValueFrom?: DefaultValueFromSchema;
    config: { [_: string]: TableConfiguration };
  };
};
