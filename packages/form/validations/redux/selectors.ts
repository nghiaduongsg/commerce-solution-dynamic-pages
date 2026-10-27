import { AnyType } from '@pkg-common/types';
import { FormValidationsReduxState } from './types';
import { createSelector } from 'reselect';
import { isParent } from '@pkg-form/validations/utils/widgetUtils';
import { uniq } from 'lodash';

export const selectValidationStep = (state: FormValidationsReduxState) =>
  state.FormValidations.validationStep;

export const selectFormServerErrors = (state: FormValidationsReduxState) =>
  state.FormValidations.serverErrors;
export const selectFormServerErrorTypes = (state: FormValidationsReduxState) =>
  state.FormValidations.serverErrorTypes;

export const selectFieldServerErrors = (field: string) =>
  createSelector(selectFormServerErrors, (errors) => {
    const result: string[] = [];

    for (const key in errors) {
      if (key === field || key.startsWith(`${field}#`)) {
        result.push(...errors[key]);
      }
    }

    return result;
  });
export const selectFieldServerErrorTypes = (field: string) =>
  createSelector(selectFormServerErrorTypes, (errorTypes) => {
    const result: { message: string; type: 'WARNING' | 'ERROR' }[] = [];

    for (const key in errorTypes) {
      if (key === field || key.startsWith(`${field}#`)) {
        result.push(...errorTypes[key]);
      }
    }

    return result;
  });

export const selectFieldServerValid = (field: string) =>
  createSelector(selectFieldServerErrors(field), (errors) => errors.length === 0);

/**
 * This selector is used only in the case of ChoeckboxesCodelistWidget and MultiLanguageWidget.
 * The server errors for these widget are saved like 'root_labels_1_description', 'root_labels_0_languageCL'.
 * However the widget itself has an id like 'root_labels' and as a result the server errors do not match the widget's id.
 * This selector collects all server errors that match the field's id and returns an array of errors in the following form:
 * [
 *      {
 *          error: ['This is an error']
 *          property: 'description',
 *          position: 1
 *      },
 *      {
 *          error: ['This is an error']
 *          property: 'languageCL',
 *          position: 0
 *      }
 *
 * ]
 * @param field
 */
export const selectCustomArrayFieldServerErrors = (field: string) =>
  createSelector(selectFormServerErrors, (errors) => {
    let serverErrors: Array<AnyType> = [];
    Object.keys(errors).forEach((key) => {
      if (key.indexOf(field) >= 0) {
        serverErrors = [...serverErrors, errors[key]];
      }
    });
    return serverErrors;
  });

export const selectParentFormServerErrors = (parentField: string) =>
  createSelector(selectFormServerErrors, (errors) => {
    const result = Object.keys(errors)
      .filter((key) => isParent(key, parentField))
      .map((field) => errors[field]);
    return uniq(result?.flat());
  });

export const selectParentFormErrorTypes = (parentField: string) =>
  createSelector(selectFormServerErrorTypes, (errors) => {
    const result = Object.keys(errors)
      .filter((key) => isParent(key, parentField))
      .map((field) => errors[field]);
    return result?.flat();
  });

export const selectIsFormValidServerErrors = (parentField: string) =>
  createSelector(selectFormServerErrors, (errors) => {
    return (
      Object.keys(errors)
        .filter((key) => isParent(key, parentField))
        .map((field) => errors[field].length > 0)
        .filter((hasErrors) => hasErrors === true).length === 0
    );
  });

export const selectIsFormGroupValidServerErrors = (fields: Array<string>) =>
  createSelector(selectFormServerErrors, (errors) => {
    return (
      Object.keys(errors)
        .filter((key) => fields.filter((field) => key.indexOf(field) >= 0)?.length > 0)
        .map((field) => errors[field].length > 0)
        .filter((hasErrors) => hasErrors === true).length === 0
    );
  });
