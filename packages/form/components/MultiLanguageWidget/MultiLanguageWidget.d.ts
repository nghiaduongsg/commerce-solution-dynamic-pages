import { ValidationRule } from '@pkg-form/types';
import { WidgetProps } from '@rjsf/core';

export type MultiLanguageWidgetProps = WidgetProps & {
  id: string;
  options: {
    showExtendedDescription?: boolean;
    translation: {
      key: string;
      namespace: string;
    };
    defaultValueFrom?: DefaultValueFromSchema;
    validations?: ValidationRule;
    slim?: boolean;
  };
  serverErrors: string[];
  value: Array<{ languageCL: string; description: string }>;
};
