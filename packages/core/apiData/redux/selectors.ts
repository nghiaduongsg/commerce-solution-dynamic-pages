import { createSelector } from 'reselect';
import { ApiDataReduxType } from './types';
import { jpValue } from '@pkg-common/dataResolver/utils';
import { isUndefined } from 'lodash';

export const selectAllApiData = (state: ApiDataReduxType) => state.ApiData;
export const selectSliceExists = (id: string) =>
  createSelector(selectAllApiData, (apiData) => !!apiData[id]);
export const selectApiData = (id: string) =>
  createSelector(selectAllApiData, (apiData) => apiData[id]?.data);
export const selectNestedApiData = (id: string, jsonPath: Array<string>) =>
  createSelector(selectApiData(id), (apiData) => getNestedData(apiData, jsonPath));
export const selectApiDataLoading = (id: string) =>
  createSelector(selectAllApiData, (apiData) => apiData[id]?.loading);
export const selectApiHasError = (id: string) =>
  createSelector(selectAllApiData, (apiData) => !!apiData[id]?.error);
export const selectApiError = (id: string) =>
  createSelector(selectAllApiData, (apiData) => apiData[id]?.error);
export const selectApiErrorMessage = (id: string) =>
  createSelector(selectAllApiData, (apiData) => {
    const errorData = apiData[id]?.error;
    if (errorData) {
      const { errorCode, message } = errorData;
      const errorMessage = message || 'genericError';
      const formattedErrorCode = errorCode ? `${errorCode}: ` : '';
      return `${formattedErrorCode}${errorMessage}`;
    }
    return 'genericError';
  });
export const selectApiRefreshId = (id: string) =>
  createSelector(selectAllApiData, (apiData) => apiData[id]?.refreshId);
export const selectApiFinished = (id: string) =>
  createSelector(selectAllApiData, (apiData) => apiData[id]?.finished);

export const selectAllApisFinished = () =>
  createSelector(selectAllApiData, (apiData) => {
    return !Object.keys(apiData)
      .filter((k) => !isUndefined(apiData[k].finished))
      .find((k) => !apiData[k].finished);
  });

const getNestedData = (data, jsonPath) => {
  try {
    return jpValue(data, jsonPath);
  } catch {
    return null;
  }
};
