import React, { useCallback, useMemo } from 'react';
import { WidgetProps } from '@rjsf/core';
import { Skeleton } from '@mui/material';
import MultiLanguageTranslator from './MultiLanguageTranslator';
import { DefaultValueFromSchema, ValidationRule } from '@pkg-form/types';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import useCodeList from '@pkg-core/codeList/hooks/useCodeList';
import { LANGUAGES } from '@pkg-constants/codeListVariables';
import useFormField from '@pkg-entity/hooks/useFormField';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import useValidations from '@pkg-form/validations/hooks/useValidations';
import MultiLanguageReadOnlyWidget from '@pkg-form/components/MultiLanguageWidget/MultiLanguageReadOnlyWidget';
import StyledFieldLabel from '@pkg-form/templates/FieldTitle/StyledFieldLabel';

type Props = WidgetProps & {
  options: {
    showExtendedDescription?: boolean;
    translation: {
      key: string;
      namespace: string;
    };
    validations?: ValidationRule;
    extendedValidations?: ValidationRule;
    defaultValueFrom?: DefaultValueFromSchema;
    widthSize?: 'xs' | 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    textToUppercase?: boolean;
  };
  serverErrors: string[];
  value: Array<{ languageCL: string; description: string; extendedDescription?: string }>;
};

const getMaxLength = (validations: ValidationRule) => {
  if (validations && validations.maxLength) {
    return validations.maxLength;
  }
  return undefined;
};

const getMinLength = (validations: ValidationRule) => {
  if (validations && validations.minLength) {
    return validations.minLength;
  }
  return undefined;
};

const normalizeText = (text: string) => {
  return text?.trim() === '' ? null : text;
};

const MultiLanguageWidget = ({
  id,
  options,
  readonly,
  disabled,
  serverErrors,
  diffs,
  schema,
  uiSchema,
  formContext,
  onChange,
  value: innerValue,
}: Props) => {
  const {
    validations = {},
    extendedValidations = {},
    defaultValueFrom,
    showExtendedDescription,
    widthSize,
    fullWidth,
    textToUppercase = false,
  } = options;

  useDefaultValueFrom(id, defaultValueFrom);
  const { mechanism } = formContext || {};
  const useDefaultMechanism = mechanism === 'DEFAULT';
  const { value, setFieldValue, storeValue, dirty } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
    true,
  );

  const { list } = useCodeList(LANGUAGES);
  const memoList = useMemo(() => {
    return list
      .filter((item) => item.expired === false || item.expired === undefined)
      .map((item) => {
        const x = (value || []).find((v) => v.languageCL === item.code);
        return { ...item, id: x?.id };
      });
  }, [list, value]);

  const activeLanguagesValue = useMemo(() => {
    return (storeValue || [])
      ?.filter((lng) => !!lng)
      .filter((lng) => memoList.some((item) => item.code === lng.languageCL));
  }, [storeValue, memoList]);

  const inputProps = {};
  inputProps['maxLength'] = getMaxLength(validations);
  inputProps['minLength'] = getMinLength(validations);
  const extendedInputProps = {};
  extendedInputProps['maxLength'] = getMaxLength(extendedValidations as ValidationRule) ?? 3000;
  extendedInputProps['minLength'] = getMinLength(extendedValidations as ValidationRule);

  const { errors, valid } = useValidations(
    id,
    activeLanguagesValue,
    'labels',
    {
      required: true,
      minLength: memoList.length,
    },
    undefined,
    serverErrors,
  );
  const { labelUppercase, omitValidationHints, required } = useWidgetUtils(
    schema,
    options,
    formContext,
  );

  const handleBlur = useCallback(() => {
    const normalized = (value || []).map((v) => ({
      ...v,
      description: normalizeText(v?.description)?.toUpperCase(),
      extendedDescription: normalizeText(v?.extendedDescription)?.toUpperCase(),
    }));
    setFieldValue(normalized);
  }, [value, setFieldValue]);

  const handleDescriptionsValueChange = useCallback(
    ({
      id,
      description,
      code,
      extendedDescription,
    }: {
      id: string;
      description: string;
      code: string;
      extendedDescription?: string;
    }) => {
      let newValue = [...(value || [])];
      const obj = (value || []).find((v) => v.languageCL === code);
      const finalDescription = description !== undefined ? description : obj?.description;
      const finalExtendedDescription =
        extendedDescription !== undefined ? extendedDescription : obj?.extendedDescription;

      const finalizedObj = {
        id,
        languageCL: code,
        description: finalDescription,
        extendedDescription: finalExtendedDescription,
      };

      if (!obj) newValue.push(finalizedObj);
      else {
        newValue = value?.filter((v) => v.languageCL !== code);
        newValue.push(finalizedObj);
      }

      newValue = newValue.map((v) => ({
        ...v,
        description: normalizeText(v?.description),
        extendedDescription: normalizeText(v.extendedDescription),
      }));
      setFieldValue(newValue);
    },
    [setFieldValue, value],
  );

  const handleLanguageSelectionChange = (newMenuItems) => {
    const newValue = newMenuItems.map(({ id, code }) => ({
      id,
      languageCL: code,
      description: value?.find(({ languageCL }) => languageCL === code)?.description ?? '',
      extendedDescription:
        value?.find(({ languageCL }) => languageCL === code)?.extendedDescription ?? '',
    }));
    setFieldValue(newValue);
  };

  const descriptionValues = useMemo(() => {
    return (value || []).map(({ id, languageCL, description, extendedDescription }) => ({
      id,
      code: languageCL,
      label: (memoList || []).find(({ code }) => code === languageCL)?.label,
      description,
      extendedDescription,
    }));
  }, [value, memoList]);

  const renderStyledFieldLabel = (overrideLabel?: string) => (
    <StyledFieldLabel
      label={overrideLabel || labelUppercase}
      required={required}
      omitValidationHints={omitValidationHints}
    />
  );

  if (readonly || disabled) {
    return (
      <MultiLanguageReadOnlyWidget
        id={id}
        value={value}
        options={options}
        schema={schema}
        uiSchema={uiSchema}
        formContext={formContext}
        diffs={diffs}
        serverErrors={serverErrors}
      />
    );
  }

  return memoList.length ? (
    <MultiLanguageTranslator
      id={id}
      label={labelUppercase}
      styledFieldLabel={renderStyledFieldLabel}
      readOnly={readonly || disabled}
      descriptionValues={descriptionValues}
      onDescriptionValuesChange={handleDescriptionsValueChange}
      onLanguageSelectionChange={handleLanguageSelectionChange}
      inputProps={{
        ...inputProps,
        style: { textTransform: textToUppercase ? 'uppercase' : 'none' },
      }}
      extendedInputProps={{
        ...extendedInputProps,
        style: { textTransform: textToUppercase ? 'uppercase' : 'none' },
      }}
      languageMenuOptions={memoList as any}
      required={validations?.required}
      extendedRequired={extendedValidations?.required}
      showExtendedDescription={showExtendedDescription}
      widthSize={widthSize}
      fullWidth={fullWidth}
      error={
        !valid && (
          <ValidationErrors
            id={id}
            clientErrors={errors}
            serverErrors={serverErrors}
            diffs={diffs}
            dirty={dirty}
          />
        )
      }
      onBlur={textToUppercase ? handleBlur : undefined}
    />
  ) : (
    <Skeleton variant="rectangular" width={400} height={120} aria-busy={true} />
  );
};

export default MultiLanguageWidget;
