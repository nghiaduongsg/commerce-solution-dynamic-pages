import {
  selectApiData,
  selectApiDataLoading,
  selectApiError,
  selectApiErrorMessage,
  selectApiHasError,
  selectApiRefreshId,
  selectApiFinished,
} from './selectors';
import { AnyType } from '@pkg-common/types';

describe('ApiData selectors', () => {
  const state = {
    ApiData: {
      A: {
        loading: false,
        data: { some: 'some data' },
        refreshId: 10,
        finished: true,
      },
      B: {
        loading: false,
        error: { message: 'error' },
        finished: true,
      },
      C: {
        loading: true,
        finished: false,
      },
    },
  } as AnyType;

  it('selectApiData', () => {
    const expected = state.ApiData.A.data;
    expect(selectApiData('A')(state)).toEqual(expected);
  });

  it('selectApiDataLoading', () => {
    expect(selectApiDataLoading('C')(state)).toEqual(true);
  });

  it('selectApiHasError', () => {
    expect(selectApiHasError('B')(state)).toEqual(true);
  });

  it('selectApiError', () => {
    const expected = state.ApiData.B.error;
    expect(selectApiError('B')(state)).toEqual(expected);
  });

  it('selectApiErrorMessage', () => {
    const expected = state.ApiData.B.error.message;
    expect(selectApiErrorMessage('B')(state)).toEqual(expected);
  });

  it('selectApiRefreshId', () => {
    const expected = state.ApiData.A.refreshId;
    expect(selectApiRefreshId('A')(state)).toEqual(expected);
  });
  it('selectApiFinished', () => {
    const expected = state.ApiData.C.finished;
    expect(selectApiFinished('C')(state)).toEqual(expected);
  });
});
