import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import AccessController from './AccessController';

let mockAllowed = true;
let mockEntityAccessGroups: boolean | undefined = false;
const mockSetApiData = jest.fn();
jest.mock('axios');
jest.mock('react-redux', () => ({
  useSelector: (select) => select({ System: { useEntityAccessGroups: mockEntityAccessGroups } }),
}));
jest.mock('@pkg-setup/index', () => ({ usePermissions: () => mockAllowed }));
jest.mock('@pkg-setup/src/system/useSystem', () => ({
  __esModule: true,
  default: () => ({ allSymbol: '*', apiUrl: '/api', selectedLanguage: 'EN' }),
}));
jest.mock('@pkg-setup/src/userSettings/useUserSettings', () => ({
  __esModule: true,
  default: () => ({ language: 'EN' }),
}));
jest.mock('@pkg-core/apiData/hooks/useApiDataState', () => ({
  __esModule: true,
  default: () => ({ setApiData: mockSetApiData }),
}));
jest.mock('@pkg-common/components/ErrorLayout/ErrorLayout', () => ({
  __esModule: true,
  default: ({ message }) => <div>{message}</div>,
}));
jest.mock('@pkg-common/components/LoadingBackdrop/LoadingBackdrop', () => ({
  __esModule: true,
  default: () => <div>Loading</div>,
}));

const page = () => (
  <AccessController pageId="Product" idKey="product-id" permissionKey="Product/READ" ForbiddenImage="" ServerErrorImage="">
    <div>Product editor</div>
  </AccessController>
);
beforeEach(() => {
  jest.clearAllMocks();
  mockAllowed = true;
  mockEntityAccessGroups = false;
});
test('supports resource-authorized backends without calling an access-group service', async () => {
  render(page());
  expect(await screen.findByText('Product editor')).toBeInTheDocument();
  expect(axios.get).not.toHaveBeenCalled();
});
test('resource page permissions still deny access when entity access groups are disabled', async () => {
  mockAllowed = false;
  render(page());
  expect(await screen.findByText('userHasNoAccessToPage')).toBeInTheDocument();
  expect(screen.queryByText('Product editor')).not.toBeInTheDocument();
  expect(axios.get).not.toHaveBeenCalled();
});
test('preserves the access-group lookup by default', async () => {
  mockEntityAccessGroups = undefined;
  (axios.get as jest.Mock).mockResolvedValue({ data: [{ code: '*' }] });
  render(page());
  await waitFor(() => expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/authorization-management/user-access-groups/operations-with-access')));
  expect(await screen.findByText('Product editor')).toBeInTheDocument();
});
