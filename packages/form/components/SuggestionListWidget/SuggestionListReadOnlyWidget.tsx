import React, { useEffect, useMemo, useRef, useState } from 'react';

import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import useTextWidgetValidations from '@pkg-form/validations/hooks/useTextWidgetValidations';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import useFormField from '@pkg-entity/hooks/useFormField';
import { FormWidgetProps } from '@pkg-form/types';
import useFormData from '@pkg-common/dataResolver/useFormData';
import ReadOnlyField from '@pkg-form/components/ReadOnlyField/ReadOnlyField';
import { transformValue } from './utils';

const SuggestionListReadOnlyWidget = ({
  schema,
  id,
  value: innerValue,
  options,
  onChange,
  uiSchema,
  formContext,
  serverErrors,
  diffs,
}: FormWidgetProps) => {
  const {
    validations = undefined,
    validateFrom,
    defaultValueFrom,
    validateWhen,
    translation,
    suggestionFrom,
    autoCompleteListKeys,
    slim,
  } = options;

  const { code, label } = autoCompleteListKeys || { code: '', label: '' };
  const { mechanism } = formContext || {};

  const useDefaultMechanism = mechanism === 'DEFAULT';

  const { value } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
  );

  const { errors } = useTextWidgetValidations(
    id,
    value,
    validations,
    serverErrors || [],
    validateFrom,
    validateWhen,
  );

  const { source } = suggestionFrom;
  const { value: suggestions } = useFormData(id, source);

  const { readOnlyLabel, showReadOnlyLabel } = useWidgetUtils(schema, options, formContext);

  useDefaultValueFrom(id, defaultValueFrom);

  const visibleValue = useMemo(() => {
    return transformValue(value, suggestions, {
      inputKey: code,
      outputKey: label,
    });
  }, [value, suggestions]);

  return (
    <ReadOnlyField
      id={id}
      title={showReadOnlyLabel ? readOnlyLabel : undefined}
      uiSchema={uiSchema}
      value={visibleValue ?? '-'}
      slim={slim}
      errors={
        <ValidationErrors
          id={id}
          clientErrors={errors}
          serverErrors={serverErrors}
          validationTranslations={translation}
          diffs={diffs}
          dirty={true}
        />
      }
    />
  );
};

export default SuggestionListReadOnlyWidget;
