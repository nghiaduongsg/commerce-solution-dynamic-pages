import { useSelector } from 'react-redux';
import { useEffect, useMemo } from 'react';
import { getAllTextValidationErrors } from '@pkg-form/validations/utils/textValidationUtils';
import { ValidateFromSchema, ValidationRule } from '../../types';
import {
  getDateArrayValidationErrors,
  getDateValidationErrors,
} from '@pkg-form/validations/utils/dateValidationUtils';
import { getTimeValidationErrors } from '@pkg-form/validations/utils/timeValidationUtils';
import { hasValue } from '@pkg-common/utils/utils';
import { isEqual } from 'lodash';
import { isInfo } from '@pkg-form/validations/utils/validationUtils';
import { getLabelsValidationErrors } from '@pkg-form/validations/utils/labelsValidationUtils';
import { AnyType, FieldConditionSchema } from '@pkg-common/types';
import {
  getFinalValidateFromStructure,
  isValidWidgetId,
} from '@pkg-form/validations/utils/widgetUtils';
import { useSystem } from '@pkg-setup/index';
import useMultipleFormData from '@pkg-common/dataResolver/useMultipleFormData';
import { selectLists } from '@pkg-core/codeList/redux/selectors';
import { useValidationsContext } from '@pkg-form/validations/ValidationsContext';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';
import { getAllArrayItemsValidationErrors } from '@pkg-form/validations/utils/arrayValidationUtils';

const noErrors = (errors, validationErrors) => {
  return errors.length === 0 && validationErrors.length === 0;
};

const useValidations = (
  fieldId: string,
  value: string | number | Array<AnyType>,
  type: 'number' | 'integer' | 'string' | 'date' | 'dateArray' | 'time' | 'labels' | 'array',
  validations: Partial<ValidationRule> = {},
  validateFrom?: ValidateFromSchema | ValidateFromSchema[],
  serverErrors?: Array<string> | string,
  multiple?: boolean,
) => {
  const { isSignReversed } = useSystem();
  const { getFieldErrors, isFieldValid, setFieldErrors } = useValidationsContext();
  const { isFieldVisible, isFieldDirty } = useFormManagerContext();

  const visible = isFieldVisible(fieldId);
  const dirty = isFieldDirty(fieldId);
  const errors = getFieldErrors(fieldId);
  const valid = isFieldValid(fieldId);

  const validateFromMulti = useMemo(() => {
    return getFinalValidateFromStructure(validateFrom);
  }, [validateFrom]);

  const validationsStr = useMemo(() => {
    return JSON.stringify(validations || {});
  }, [validations]);

  const validationSources = useMemo(() => {
    return validateFromMulti.map((item) => ({
      key: item.attribute,
      ...item,
    }));
  }, [validateFromMulti]);

  const validationFromValues = useMultipleFormData(
    fieldId,
    validationSources as Array<FieldConditionSchema>,
    true,
  );

  const relatedCodelists = useSelector(
    selectLists(validationSources?.map((s) => s?.codelist)?.filter((s) => !!s) as Array<string>),
  );

  const extraValidations = {};

  validationSources?.forEach((vs) => {
    const { attribute, codelist, offset } = vs;

    if (codelist && attribute) {
      const relatedFieldValue = validationFromValues[attribute];
      const relatedCodelist = relatedCodelists[codelist];

      const item = relatedCodelist?.find((listItem) => listItem.code === relatedFieldValue);

      if (item) {
        const attrValue = (item.attributes || [])
          .filter((attr) => attr.key === attribute)
          .map((attr) => attr.value);

        if (attrValue?.length) {
          extraValidations[attribute] = attrValue[0];
        } else {
          extraValidations[attribute] = undefined;
        }
      }
    } else if (attribute) {
      const relatedFieldValue = validationFromValues[attribute];

      if (hasValue(relatedFieldValue)) {
        extraValidations[attribute] = relatedFieldValue;
        extraValidations[`offset${attribute}`] = offset;
      } else {
        extraValidations[attribute] = undefined;
      }
    }
  });

  const validationsIncludingExtraOnes = useMemo(() => {
    const validationsParsed = JSON.parse(validationsStr);
    if (Object.keys(extraValidations).length > 0) {
      return {
        ...validationsParsed,
        ...extraValidations,
      };
    }

    return validationsParsed;
  }, [validationsStr, extraValidations]);

  const isFilteringFunctionality = useMemo(() => {
    return fieldId?.indexOf('-filters') >= 0;
  }, [fieldId]);

  const isDateLikeField = useMemo(() => {
    return type === 'date' || type === 'dateArray' || type === 'time';
  }, [type]);

  const allValidationErrors = useMemo(() => {
    if (!visible || (isFilteringFunctionality && !isDateLikeField)) {
      return [];
    }
    if (type === 'array') {
      return getAllArrayItemsValidationErrors(
        validations ?? {},
        multiple ?? false,
        value as Array<AnyType>,
      );
    } else if (type === 'dateArray') {
      return getDateArrayValidationErrors(validationsIncludingExtraOnes, value as string[]);
    } else if (type === 'date') {
      // Sign is not needed for this kind of validations
      return getDateValidationErrors(validationsIncludingExtraOnes, value as string);
    } else if (type === 'time') {
      return getTimeValidationErrors(validationsIncludingExtraOnes, value as string);
    } else if (type === 'labels') {
      // Sign is not needed for this kind of validations
      return getLabelsValidationErrors(
        validationsIncludingExtraOnes,
        value as Array<{
          languageCL: string;
          description: string;
        }>,
      );
    } else {
      return getAllTextValidationErrors(
        validationsIncludingExtraOnes,
        value as string,
        validations?.acceptSingleSpace,
        isSignReversed,
      );
    }
  }, [
    value,
    validationsIncludingExtraOnes,
    type,
    validations?.acceptSingleSpace,
    isSignReversed,
    visible,
    isFilteringFunctionality,
    isDateLikeField,
  ]);

  const thereAreNoErrors = useMemo(() => {
    return noErrors(errors || [], allValidationErrors || []);
  }, [allValidationErrors, errors]);

  const noNewErrors = useMemo(() => {
    return isEqual(errors || [], allValidationErrors || []);
  }, [errors, allValidationErrors]);

  const isValid = useMemo(() => {
    if (isFilteringFunctionality || !visible) {
      return true;
    } else if (serverErrors && serverErrors.length > 0 && !isInfo(serverErrors)) {
      return false;
    } else if (isInfo(serverErrors)) {
      return true;
    } else {
      return dirty ? valid : true;
    }
  }, [serverErrors, dirty, valid, isFilteringFunctionality, visible]);

  useEffect(() => {
    if (!isValidWidgetId(fieldId)) {
      return;
    }

    if (thereAreNoErrors || noNewErrors) {
      return;
    }

    setFieldErrors(fieldId, allValidationErrors);
  }, [allValidationErrors, fieldId, thereAreNoErrors, noNewErrors]);

  return {
    errors: allValidationErrors,
    valid: isValid,
    dynamicValidations: validationsIncludingExtraOnes,
  };
};

export default useValidations;
