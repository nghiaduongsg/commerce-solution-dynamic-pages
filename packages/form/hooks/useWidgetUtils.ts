import { COMMON } from '@pkg-constants/translationNamespaces';
import { FormContextSchema } from '@pkg-form/types';
import { AnyType } from '@pkg-common/types';
import { useTranslation } from 'react-i18next';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import useSystem from '@pkg-setup/src/system/useSystem';

const useWidgetUtils = (
  schema: AnyType,
  options: AnyType,
  formContext: FormContextSchema,
  id?: string,
) => {
  const {
    translation,
    validations,
    omitValidationHints = false,
    showReadOnlyLabel = true,
  } = options;
  const { namespace, omitValidationHints: omitAllValidationHints } = formContext;

  const { key, helpText, visibilityFrom } = translation || {};
  const { check: helpTextVisible } = useCheckFrom(id || 'id', visibilityFrom, true);

  const { selectedLanguage } = useSystem();

  const { t: translate } = useTranslation([namespace, COMMON]);

  const translationKey = key || schema?.title;
  const readOnlyLabel = translationKey
    ? translate(translationKey, { ns: namespace, lng: selectedLanguage })
    : '';
  const readOnlyExtDescLabel = translate('extendedDescriptionLabel', {
    ns: COMMON,
    lng: selectedLanguage,
  });
  const helpTextLabel =
    helpText && helpTextVisible
      ? translate(helpText, { ns: namespace, lng: selectedLanguage })
      : '';

  return {
    label: readOnlyLabel,
    labelUppercase: readOnlyLabel.toUpperCase(),
    readOnlyLabel: readOnlyLabel || '',
    readOnlyLabelUpperCase: readOnlyLabel?.toUpperCase() || '',
    readOnlyExtendedDescriptionLabel: readOnlyExtDescLabel || '',
    helpText: helpTextLabel,
    showReadOnlyLabel,
    omitValidationHints: omitValidationHints || omitAllValidationHints,
    required: validations?.required,
  };
};

export default useWidgetUtils;
