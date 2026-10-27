import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { thunkMiddleware } from './asyncThunkMock';
import ValidationsContext from '@pkg-form/validations/ValidationsContext';
import FormManagerContext from '@pkg-form/FormManagerContext';

interface MockStoreTypes {
  mockStore: MockStoreEnhanced<any, unknown>;
  dispatchStub: jest.SpyInstance;
  wrapper: ({ children }: { children: ReactNode }) => ReactNode;
}

const ReduxProvider = ({ children, reduxStore }) => {
  return <Provider store={reduxStore}>{children}</Provider>;
};

export const getMockWrapper = (storeData) => {
  const store = configureStore();
  const mockStore = store(storeData);

  return ({ children }) => {
    return <ReduxProvider reduxStore={mockStore}>{children}</ReduxProvider>;
  };
};

export const getMockWrapperAndStore = (storeData): MockStoreTypes => {
  const middlewares = [thunkMiddleware];
  const store = configureStore(middlewares);
  const mockStore = store(storeData);

  const dispatchStub = jest.spyOn(mockStore, 'dispatch');

  return {
    mockStore,
    dispatchStub,
    wrapper: ({ children }) => {
      return <ReduxProvider reduxStore={mockStore}>{children || null}</ReduxProvider>;
    },
  };
};

export const getMockWrapperWithoutStoreData = (): MockStoreTypes => {
  const store = configureStore();
  const mockStore = store({});

  const dispatchStub = jest.spyOn(mockStore, 'dispatch');

  return {
    mockStore,
    dispatchStub,
    wrapper: ({ children }) => {
      return <ReduxProvider reduxStore={mockStore}>{children}</ReduxProvider>;
    },
  };
};

export const getMockWrapperForContext = (contextValue) => {
  return ({ children }) => {
    return (
      <ValidationsContext.Provider value={contextValue}>{children}</ValidationsContext.Provider>
    );
  };
};

export const getMockWrapperWithFormManagerContext = (contextValue) => {
  return ({ children }) => {
    return (
      <FormManagerContext.Provider value={contextValue}>{children}</FormManagerContext.Provider>
    );
  };
};

export const getMockWrapperWithFormManagerAndValidationsContext = (
  validationsContext,
  formManagerContext,
) => {
  return ({ children }) => {
    return (
      <ValidationsContext.Provider value={validationsContext}>
        <FormManagerContext.Provider value={formManagerContext}>
          {children}
        </FormManagerContext.Provider>
      </ValidationsContext.Provider>
    );
  };
};
