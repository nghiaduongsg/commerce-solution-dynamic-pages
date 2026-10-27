import { ApiValuesSchema } from '@pkg-common/types';
import { DefaultValueFromSchema, TranslationSchema } from '@pkg-form/types';

export type HeroCardsProps = {
  heroCards: Array<{
    apiValues: ApiValuesSchema;
    defaultValueFrom: DefaultValueFromSchema;
    translation?: TranslationSchema;
    valueType?: string;
    property?: string;
    propertyValue?: string;
  }>;
  namespaces: Array<string>;
};
