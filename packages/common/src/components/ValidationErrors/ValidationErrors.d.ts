import TranslationSchema from '@pkg-form/types/TranslationSchema';
export type ValidationErrorsProps = {
  clientErrors: Array<string>;
  serverErrors?: Array<string>;
  serverErrorTypes?: Array<{ message: string; type: 'WARNING' | 'ERROR' }>;
  validationTranslations?: TranslationSchema;
  diffs?: Array<string>;
  id: string;
  dirty: boolean;
};
