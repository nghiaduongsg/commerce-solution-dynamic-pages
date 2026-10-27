import Axios from 'axios-observable';
import { of, throwError } from 'rxjs';
import { AxiosObservable } from 'axios-observable/dist/axios-observable.interface';
import { AnyType } from '@pkg-common/types';

export const mockAxios = (serviceResponse: AnyType, method: 'get' | 'post' | 'put' | 'delete') => {
  return jest.spyOn(Axios, method).mockImplementation(() => {
    // @ts-ignore
    return of({ data: serviceResponse }) as AxiosObservable<AnyType>;
  });
};

export const mockAxiosError = (error: AnyType, method: 'get' | 'post' | 'put' | 'delete') => {
  // @ts-ignore
  jest.spyOn(Axios, method).mockImplementationOnce(() => {
    return throwError(error);
  });
};
