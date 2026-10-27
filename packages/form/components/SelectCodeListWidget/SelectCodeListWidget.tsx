import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import GenericSelect from '@pkg-common/atomics/GenericSelect/GenericSelect';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import IstCheckboxesList from '@pkg-common/atomics/IstCheckboxesList/IstCheckboxesList';
import useCodeListWidget from './hooks/useCodeListWidget';
import useCodeListWidgetValidations from './hooks/useCodeListWidgetValidations';
import useCodeListWidgetUtils from './hooks/useCodeListWidgetUtils';
import useStoreAsEntity from '@pkg-form/hooks/useStoreAsEntity';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import useApplyValueFromComparison from '@pkg-form/hooks/useApplyValueFromComparison';
import useFormField from '@pkg-entity/hooks/useFormField';
import { FormWidgetProps, SelectWidgetOptions } from '@pkg-form/types';
import Resource from '@pkg-common/components/Resource/Resource';
import useSystem from '@pkg-setup/src/system/useSystem';
import { getDisabledValues } from '@pkg-form/components/SelectCodeListWidget/utils';
import { checkForCodelistInCookies } from '@pkg-common/utils/handleCookies';
import { getFormIdFromWidgetId, hasValue, enumeratedOptions } from '@pkg-common/utils';
import useCodeListDefaultValue from './hooks/useCodeListDisplayValue';
import { NOT_FOUND_KEY } from '@pkg-constants/formCommon';
import useUser from '@pkg-setup/src/user/useUser';
import { BOOLEAN_CODELIST_ATTRIBUTES } from '@pkg-constants/codeListVariables';
import { useTranslation } from 'react-i18next';
import useAdditionalInfo from '@pkg-form/hooks/useAdditionalInfo';
import { COMMON } from '@pkg-constants/translationNamespaces';
import StyledFieldLabel from '@pkg-form/templates/FieldTitle/StyledFieldLabel';

const SelectCodeListWidget = ({
  schema,
  id,
  options,
  disabled,
  readonly,
  autofocus,
  onBlur,
  serverErrors,
  serverErrorTypes,
  diffs,
  label: widgetLabel,
  warnOnChange,
  value: innerValue,
  onChange,
  formContext,
  uiSchema,
}: FormWidgetProps & { options: SelectWidgetOptions }) => {
  const {
    apiValues,
    multiple,
    validations,
    filterFrom,
    mapToProperty,
    selectAll = false,
    threshold,
    storeAsEntity,
    renderWith,
    defaultValueFrom,
    validateWhen,
    fullWidth,
    applyValueFromComparison,
    disabledOptions = [],
    callApis,
    showLabel = true,
    widthSize,
    defaultValues,
    ignoreInactive = false,
    excludeExpired = false,
    truncate = { enabled: false },
    autofillOnlyOption = false,
    lazyLoad,
  } = options;

  const info = uiSchema['ui:information'] ?? {};

  const {
    mechanism,
    debounceUpdates,
    avoidDefaultLoad,
    namespace = COMMON,
    dataTestId,
  } = formContext || {};
  const useDefaultMechanism = mechanism === 'DEFAULT';

  const { value, setFieldValue, dirty } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
    debounceUpdates,
  );

  const { application, hideExpired, hideInactive, selectedLanguage } = useSystem();
  const { partyRoleId, userId } = useUser();
  const {
    labelUppercase: label,
    helpText,
    omitValidationHints,
    required,
  } = useWidgetUtils(schema, options, formContext);
  const { selectedValue, getUpdatedValue } = useCodeListWidgetUtils(value, multiple, mapToProperty);
  const [hasBeenFocused, setHasBeenFocused] = useState(false);

  const valueInFilterCookies = useMemo(
    () =>
      checkForCodelistInCookies(
        application === 'ISS' ? userId : partyRoleId,
        widgetLabel,
        getFormIdFromWidgetId(id.replace('-filters', '')),
      ),
    [application, userId, partyRoleId, widgetLabel, id],
  );

  const { list, loading } = useCodeListWidget(
    id,
    apiValues,
    filterFrom,
    renderWith,
    hasBeenFocused || hasValue(threshold),
    avoidDefaultLoad,
    valueInFilterCookies,
  );
  useStoreAsEntity(id, value, list, storeAsEntity);
  useDefaultValueFrom(id, defaultValueFrom);
  useApplyValueFromComparison(id, 'EDIT', applyValueFromComparison);

  const { valid, errors, disabledValues } = useCodeListWidgetValidations(
    id,
    value,
    multiple,
    validations,
    serverErrors,
    validateWhen,
  );

  const validItems = useMemo(
    () => (finalItems) => {
      let result = finalItems ?? [];

      if (excludeExpired || hideExpired === 'Y') {
        result = result.filter((item) => !item.expired);
      }

      if (hideInactive === 'Y') {
        result = result.filter(
          (item) =>
            item.attributes?.find((attr) => attr.key === 'inactive')?.value !==
            BOOLEAN_CODELIST_ATTRIBUTES.YES,
        );
      }

      return result;
    },
    [excludeExpired, hideExpired, hideInactive],
  );

  const { t: translate } = useTranslation([namespace]);
  const extraDisabledValues = useMemo(() => {
    return getDisabledValues(list, apiValues?.disableOptionWhen, ignoreInactive);
  }, [list, apiValues?.disableOptionWhen, ignoreInactive]);

  const optionsFromEnum = useMemo(
    () => enumeratedOptions(defaultValues, namespace, selectedLanguage, translate),
    [defaultValues, namespace, selectedLanguage, translate],
  );

  const displayValue = useCodeListDefaultValue(
    id,
    multiple,
    list.length ? list : optionsFromEnum,
    selectedValue,
  );

  useEffect(() => {
    if (displayValue === NOT_FOUND_KEY && hasValue(selectedValue)) {
      setHasBeenFocused(true);
    }
  }, [displayValue, selectedValue]);

  const finalList = useMemo(() => {
    if (optionsFromEnum?.length) {
      return optionsFromEnum;
    }

    if (list?.length) {
      return list;
    }

    if (selectedValue) {
      return [
        {
          code: selectedValue,
          label: displayValue === NOT_FOUND_KEY ? 'Searching for label...' : displayValue,
        },
      ];
    }

    return [];
  }, [list, optionsFromEnum, displayValue, selectedValue]);

  const allDisabledOptions = useMemo(
    () => [...disabledValues, ...disabledOptions, ...extraDisabledValues] as Array<string>,
    [disabledValues, disabledOptions, extraDisabledValues],
  );

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const updatedValue = getUpdatedValue(e.target.value);
    if (warnOnChange) {
      warnOnChange(updatedValue);
    } else {
      setFieldValue(updatedValue);
    }
  };

  const { translatedMessage } = useAdditionalInfo(id, {
    ...info,
    namespace: info?.namespace ?? namespace,
  });

  const shouldAutofillValue = useMemo(
    () => !defaultValueFrom && !hasValue(value) && validations?.required && autofillOnlyOption,
    [defaultValueFrom, value, autofillOnlyOption, validations?.required],
  );

  useEffect(() => {
    if (shouldAutofillValue && finalList.length === 1) {
      setFieldValue(finalList[0]?.code);
    }
  }, [shouldAutofillValue, finalList, setFieldValue]);

  const handleFocus = useCallback(() => setHasBeenFocused(true), []);
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => onBlur?.(e.target.value),
    [onBlur],
  );
  const validationErrors = (
    <ValidationErrors
      id={id}
      clientErrors={errors}
      serverErrors={serverErrors}
      serverErrorTypes={serverErrorTypes}
      diffs={diffs}
      dirty={dirty}
    />
  );
  const callApiResources = callApis?.map((resource) => (
    <Resource key={resource.resourceId} resource={resource} widgetId={id} />
  ));

  if (threshold && (list || []).length <= threshold) {
    return (
      <>
        {callApiResources}
        <IstCheckboxesList
          id={id}
          label={label}
          value={selectedValue}
          multiple={multiple}
          onChange={(values) => setFieldValue(getUpdatedValue(values))}
          options={list}
          disabledOptions={allDisabledOptions}
          errors={validationErrors}
        />
      </>
    );
  }

  return (
    <>
      {callApiResources}
      <GenericSelect
        id={id}
        testId={`${dataTestId}_${widgetLabel}`}
        label={label}
        styledFieldLabel={
          <StyledFieldLabel
            label={label}
            required={required}
            omitValidationHints={omitValidationHints}
          />
        }
        value={selectedValue}
        readonly={readonly}
        required={validations?.required ?? false} //in props avoid returning objects as fallbacks instead pass a primitive value when possible
        disabled={disabled || readonly}
        autofocus={autofocus}
        selectAll={selectAll}
        multiple={multiple}
        widthSize={widthSize}
        onChange={handleSelectChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        options={validItems(finalList)}
        disabledOptions={allDisabledOptions}
        additionalInfo={translatedMessage}
        showLabel={showLabel}
        errors={validationErrors}
        valid={valid}
        fullWidth={fullWidth}
        helpText={helpText}
        loading={hasValue(displayValue) ? false : loading}
        truncate={truncate}
        lazyLoad={lazyLoad}
      />
    </>
  );
};

export default SelectCodeListWidget;
