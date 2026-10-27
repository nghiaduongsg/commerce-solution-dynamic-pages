import { FormWidgetOptions } from '@pkg-form/types';
import { AnyType } from '@pkg-common/types';

export type LiabilityCaseScopeWidgetOptions = FormWidgetOptions & {
  periodSchemas: { schema: AnyType; uiSchema: AnyType };
  liabilityPeriodSchemas: { schema: AnyType; uiSchema: AnyType };
  savedScopeJsonPath: Array<string>;
  dependentChargesJsonPath: Array<string>;
};
