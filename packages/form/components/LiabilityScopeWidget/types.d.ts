import { FormWidgetOptions } from '@pkg-form/types';
import { AnyType } from '@pkg-common/types';

export type LiabilityScopeWidgetOptions = FormWidgetOptions & {
  periodSchemas: { schema: AnyType; uiSchema: AnyType };
};
