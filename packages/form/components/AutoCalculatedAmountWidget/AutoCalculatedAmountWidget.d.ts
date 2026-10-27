import {
  TranslationSchema,
  ValidateFromSchema,
  ValidationRule,
  FormContextSchema,
  DefaultValueFromSchema,
  LinkSchema,
  ReplacementSchema,
  AnyType,
} from '@pkg-form/types';

export type AutoCalculatedWidgetProps = {
  id: string;
  value: string;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  autofocus: boolean;
  onChange: (string) => void;
  onBlur: (id, string) => void;
  onFocus: (id, string) => void;
  schema: AnyType;
  uiSchema: AnyType;
  options: {
    emptyValue: string | null;
    multiline: boolean;
    translation: TranslationSchema;
    validations: Partial<ValidationRule>;
    visibleInCard?: boolean;
    validateFrom?: ValidateFromSchema;
    defaultValueFrom?: DefaultValueFromSchema;
    omitValidationHints: boolean;
    slim?: boolean;
    visible?: boolean;
    link?: LinkSchema;
    exchangeRateInfo: Array<ReplacementSchema>;
    saveValue?: false;
  };
  inputProps: AnyType;
  serverErrors: Array<string>;
  startAdornment?: string | JSX.Element;
  formContext: FormContextSchema;
};
