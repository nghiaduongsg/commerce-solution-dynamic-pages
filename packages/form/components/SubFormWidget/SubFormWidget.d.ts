import { TranslationSchema, ApiValuesSchema } from '@pkg-form/types';

export type SubFormWidgetProps = {
  id: string;
  options: {
    omitValidationHints: boolean;
    translation: TranslationSchema;
    loadEntity: LoadEntitySchema;
    schema: { [key: string]: any };
    uiSchema: { [key: string]: any };
    itemActions?: Array<{ type: string; translationKey: string; apiValues: ApiValuesSchema }>;
  };
};
