import { AppErrorViolation } from '@pkg-common/types';
import { getQueryParamFromUrl } from '@pkg-common/utils';
import { isArray } from 'lodash';

const FORM_STEP = 'formStep';

/**
 * Transforms the list of BE validation errors into a map of errors that can be used from the client.
 * The BE errors have the following form:
 * [
 *   {
 *       fieldName: 'labels[0].description', // path to the property
 *       message: 'This description is not valid'
 *   },
 *   {
 *       fieldName: 'labels', // path to the property
 *       message: 'All descriptions should be filled in'
 *   },
 *   {
 *       fieldName: 'validIdentifierTypes[1].identifierTypeCL', // path to the property
 *       message: 'This code is not valid'
 *   },
 * ]
 * These errors will be transformed into the following map:
 * {
 *     'root_labels_0_description: ['This description is not valid'],
 *     'root_labels': ['All descriptions should be filled in'],
 *     'root_validIdentifierTypes_1_identifierTypeCL': ['This code is not valid'],
 * }
 *
 * We simple replace the '[' and '].' symbols with '_' and prefix with the string: 'root_'
 * @param entityId the id of the entity e.g Parties that is being processed
 * @param violations array of BE validation errors
 */
export const getBEValidations = (entityId: string, violations: Array<AppErrorViolation>) => {
  const validations = {};
  (violations || []).forEach((violation) => {
    const field = getFieldId(violation?.fieldName || '');
    const errorMessage = violation.message || violation['messageKey'];
    const formattedErrorMessage = violation.errorCode
      ? `${violation.errorCode}: ${errorMessage}`
      : errorMessage;

    // TODO: messageKey is only for Form Apis and must be unified
    validations[`${entityId}_${field}`] = validations[`${entityId}_${field}`]
      ? [...validations[`${entityId}_${field}`], getViolationMessage(violation)]
      : [`${formattedErrorMessage}`];
  });

  return validations;
};

export const getBEValidationTypes = (entityId: string, violations: Array<AppErrorViolation>) => {
  const validationTypes = {};

  (violations || []).forEach((violation) => {
    const field = getFieldId(violation?.fieldName || '');
    // TODO: messageKey is only for Form Apis and must be unified
    validationTypes[`${entityId}_${field}`] = validationTypes[`${entityId}_${field}`]
      ? [
          ...validationTypes[`${entityId}_${field}`],
          { message: getViolationMessage(violation), type: getViolationType(violation) },
        ]
      : [{ message: getViolationMessage(violation), type: getViolationType(violation) }];
  });

  return validationTypes;
};

export const updateBEValidationsForStepForm = (
  entityId: string,
  violations: Array<AppErrorViolation>,
  formStepKey: string,
  existingErrors: { [key: string]: Array<string> },
  formData: string,
) => {
  const fieldIds = getFlattenedKeysFromJson(formData);

  const updatedErrors = Object.fromEntries(
    Object.entries(existingErrors).filter(
      ([key]) =>
        !isStepErrorKey(key, formStepKey) &&
        !fieldIds.some((fieldId) => key.startsWith(`${entityId}_${fieldId}`)),
    ),
  );

  violations.forEach((violation) => {
    const field = getFieldId(violation.fieldName || '');
    const key = `${entityId}_${field}#${formStepKey}`;
    const errorMessage = getViolationMessage(violation);

    updatedErrors[key] = updatedErrors[key]
      ? [...updatedErrors[key], errorMessage]
      : [errorMessage];
  });

  return prioritizeValidationsWithStepErrors(updatedErrors, formStepKey);
};

export const updateBEValidationTypesForStepForm = (
  entityId: string,
  violations: Array<AppErrorViolation>,
  formStepKey: string,
  existingValidationTypes: {
    [key: string]: Array<{ message: string; type: 'WARNING' | 'ERROR' }>;
  },
  formData: string,
) => {
  const fieldIds = getFlattenedKeysFromJson(formData);

  const updatedValidationTypes = Object.fromEntries(
    Object.entries(existingValidationTypes).filter(
      ([key]) =>
        !isStepErrorKey(key, formStepKey) &&
        !fieldIds.some((fieldId) => key.startsWith(`${entityId}_${fieldId}`)),
    ),
  );

  violations.forEach((violation) => {
    const field = getFieldId(violation.fieldName || '');
    const key = `${entityId}_${field}#${formStepKey}`;

    const entry = {
      message: getViolationMessage(violation),
      type: getViolationType(violation),
    };

    updatedValidationTypes[key] = updatedValidationTypes[key]
      ? [...updatedValidationTypes[key], entry]
      : [entry];
  });

  return prioritizeValidationsWithStepErrors(updatedValidationTypes, formStepKey);
};

const getFieldId = (fieldName: string) => {
  const regex1 = /\[/g;
  const regex2 = /\]\./g;
  const regex3 = /\./g;
  const regex4 = /\]/g;

  return fieldName
    .replace('$.', '')
    .replace(regex1, '_')
    .replace(regex2, '_')
    .replace(regex3, '_')
    .replace(regex4, '');
};

const getViolationMessage = (violation: AppErrorViolation) => {
  const errorMessage = violation.message || violation['messageKey'];
  return violation.errorCode ? `${violation.errorCode}: ${errorMessage}` : errorMessage;
};

const getViolationType = (violation: AppErrorViolation): 'WARNING' | 'ERROR' => {
  return violation?.warning ? 'WARNING' : 'ERROR';
};

const containsInfo = (text: string | Array<string> | undefined) => {
  if (!text) {
    return true;
  }
  try {
    return text?.indexOf('INFO_') >= 0;
  } catch {
    return false;
  }
};

export const isInfo = (text: string | Array<string> | undefined) => {
  return isArray(text) ? !!text.find((p) => containsInfo(p)) : containsInfo(text);
};

const isStepErrorKey = (key: string, formStepKey: string): boolean => {
  const index = key.lastIndexOf('#');
  if (index === -1) return false;
  return key.slice(index + 1) === formStepKey;
};

const getFlattenedKeysFromJson = (formDataJson: string): string[] => {
  const result: string[] = [];

  const walk = (value: unknown, path = '$') => {
    if (value == null) return;

    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }

    if (typeof value === 'object') {
      Object.entries(value).forEach(([key, val]) => walk(val, `${path}.${key}`));
      return;
    }

    result.push(getFieldId(path));
  };

  walk(JSON.parse(formDataJson));

  return result;
};

const getSetOfFieldIdsWithStepValidation = (updatedErrors: Object, formStepKey: string) => {
  return new Set(
    Object.keys(updatedErrors)
      .filter((key) => key.endsWith(`#${formStepKey}`))
      .map((key) => key.split('#')[0]),
  );
};

const prioritizeValidationsWithStepErrors = <T>(
  validations: Record<string, T>,
  formStepKey: string,
): Record<string, T> => {
  const fieldsWithStepValidation = getSetOfFieldIdsWithStepValidation(validations, formStepKey);

  return Object.fromEntries(
    Object.entries(validations).filter(([key]) => {
      const isStepValidation = key.includes('#');
      const hasCurrentStepValidation = fieldsWithStepValidation.has(key.split('#')[0]);

      return isStepValidation || !hasCurrentStepValidation;
    }),
  );
};

export const getBackendValidations = ({
  entityId,
  violationsData,
  url,
  currentServerErrors,
  currentServerErrorTypes,
  formData,
}: {
  entityId: string;
  violationsData: any[];
  url: string;
  currentServerErrors: any;
  currentServerErrorTypes: any;
  formData: any;
}) => {
  const formStepKey = getQueryParamFromUrl(url, FORM_STEP);
  const safeViolations = violationsData || [];

  if (formStepKey) {
    return {
      serverErrors: updateBEValidationsForStepForm(
        entityId,
        safeViolations,
        formStepKey,
        currentServerErrors,
        formData,
      ),
      serverErrorTypes: updateBEValidationTypesForStepForm(
        entityId,
        safeViolations,
        formStepKey,
        currentServerErrorTypes,
        formData,
      ),
    };
  }

  return {
    serverErrors: getBEValidations(entityId, safeViolations),
    serverErrorTypes: getBEValidationTypes(entityId, safeViolations),
  };
};
