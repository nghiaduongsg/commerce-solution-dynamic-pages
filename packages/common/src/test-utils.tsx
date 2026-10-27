import React, { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { userEvent } from '@testing-library/user-event/dist/cjs/setup/index.js';

const mockStore = configureStore([]);
export function renderWithProviders(initialState: object, UIComponent: ReactElement) {
  const store = mockStore(initialState);
  const user = userEvent?.setup();
  return {
    user,
    ...render(<Provider store={store}>{UIComponent}</Provider>),
  };
}
