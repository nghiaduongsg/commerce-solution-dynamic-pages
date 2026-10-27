import React from 'react';
import { render, screen } from '@testing-library/react';
import AppActions from './AppActions';
import { AppActionsType } from './types';
import { getMockWrapperWithoutStoreData } from '@_jestHelpers/reactMockStore';
import * as utils from '@pkg-common/utils/utils';
import * as useMultipleFormDataModule from '@pkg-common/dataResolver/useMultipleFormData';
import * as useCheckFromModule from '@pkg-common/dataResolver/useCheckFrom';
import * as useApiDataStateModule from '@pkg-core/apiData/hooks/useApiDataState';
import { useSystem } from '@pkg-setup/index';
import * as utilsModule from '@pkg-common/utils';
import { useSelector } from 'react-redux';

const mockIsActionAllowed = utils.isActionAllowed as jest.MockedFunction<
  typeof utils.isActionAllowed
>;
const mockIsActionAllowedBasedOnSecurableObjects =
  utils.isActionAllowedBasedOnSecurableObjects as jest.MockedFunction<
    typeof utils.isActionAllowedBasedOnSecurableObjects
  >;
const mockUseMultipleFormData = useMultipleFormDataModule.default as jest.MockedFunction<
  typeof useMultipleFormDataModule.default
>;
const mockUseCheckFrom = useCheckFromModule.default as jest.MockedFunction<
  typeof useCheckFromModule.default
>;
const mockUseApiDataState = useApiDataStateModule.default as jest.MockedFunction<
  typeof useApiDataStateModule.default
>;
const mockUseSystem = useSystem as jest.MockedFunction<typeof useSystem>;
const mockHasValue = utilsModule.hasValue as jest.MockedFunction<typeof utilsModule.hasValue>;
const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

jest.mock('@pkg-common/utils/utils', () => ({
  isActionAllowed: jest.fn(),
  isActionAllowedBasedOnSecurableObjects: jest.fn(),
}));

jest.mock('@pkg-common/dataResolver/useMultipleFormData', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@pkg-common/dataResolver/useCheckFrom', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@pkg-core/apiData/hooks/useApiDataState', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@pkg-setup/index', () => ({
  useSystem: jest.fn(),
}));

jest.mock('@pkg-common/utils', () => ({
  hasValue: jest.fn(),
}));

jest.mock('@pkg-common/components/AppActions/utils', () => ({
  getButtonKey: jest.fn(),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

jest.mock('@pkg-entity/redux/selectors', () => ({
  selectEntityId: jest.fn(() => (state) => state?.entityId),
}));

jest.mock('@pkg-form/validations/ValidationsProvider', () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

jest.mock('@pkg-form/FormManagerProvider', () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

jest.mock('@pkg-common/components/AppActions/ActionButton', () => ({
  __esModule: true,
  default: ({ action }) => (
    <button data-testid={`action-btn-${action.title}`}>{action.title}</button>
  ),
}));

jest.mock('./GroupedActionButton', () => ({
  __esModule: true,
  default: ({ action }) => (
    <button data-testid={`grouped-btn-${action.title}`}>{action.title}</button>
  ),
}));

jest.mock('@pkg-constants/formCommon', () => ({
  USER_ACCESS_PERMISSIONS_RESOURCE_ID: 'userAccessPermissions',
  VALID_BUTTONS_RESOURCE_ID: 'validButtons',
}));

const { wrapper } = getMockWrapperWithoutStoreData();

let validButtonsTransition: Array<{ code: string }> = [];
let allowedBtns: string[] | undefined;
let finished = true;

const buildProps = (overrides: Partial<AppActionsType> = {}): AppActionsType => ({
  page: { id: 'page1' },
  actions: {
    buttons: [{ title: 'A', permissionKey: 'keyA' }],
  },
  ...overrides,
});

describe('AppActions - permission logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    validButtonsTransition = [];
    allowedBtns = undefined;
    finished = true;

    mockUseSystem.mockReturnValue({
      applyPermissions: true,
      allSymbol: '*',
      securableObjects: {},
    } as any);
    mockUseCheckFrom.mockReturnValue({ check: true } as any);
    mockHasValue.mockImplementation((v) => v != null && v !== '');
    mockUseSelector.mockReturnValue(undefined);
    mockUseApiDataState.mockImplementation(((resourceId) => {
      if (resourceId === 'validButtons') return { data: validButtonsTransition, finished };
      if (resourceId === 'userAccessPermissions') return { data: allowedBtns };
      return { data: undefined, finished: true };
    }) as any);
    mockIsActionAllowed.mockReturnValue(true);
    mockIsActionAllowedBasedOnSecurableObjects.mockReturnValue(true);
  });

  describe('allReplacements flattening', () => {
    it('flattens replacements from object permissionKeys and skips string permissionKeys', () => {
      mockUseMultipleFormData.mockReturnValue({});
      const props = buildProps({
        actions: {
          buttons: [
            { title: 'A', permissionKey: { replacements: [{ type: 'state', path: 'user.id' }] } },
            { title: 'B', permissionKey: 'stringKey' },
            {
              title: 'C',
              permissionKey: {
                replacements: [
                  { type: 'params', path: 'id' },
                  { type: 'state', path: 'user.name' },
                ],
              },
            },
          ],
        },
      } as any);

      render(<AppActions {...props} />, { wrapper });

      expect(mockUseMultipleFormData).toHaveBeenCalledWith(
        'page1',
        [
          { type: 'state', path: 'user.id' },
          { type: 'params', path: 'id' },
          { type: 'state', path: 'user.name' },
        ],
        false,
        undefined,
      );
    });

    it('passes an empty array when no button has an object permissionKey', () => {
      mockUseMultipleFormData.mockReturnValue({});
      const props = buildProps({
        actions: { buttons: [{ title: 'A', permissionKey: 'stringKey' }] },
      } as any);

      render(<AppActions {...props} />, { wrapper });

      expect(mockUseMultipleFormData).toHaveBeenCalledWith('page1', [], false, undefined);
    });

    it('contributes an empty array for an object permissionKey without replacements', () => {
      mockUseMultipleFormData.mockReturnValue({});
      const props = buildProps({
        actions: {
          buttons: [
            { title: 'A', permissionKey: { someOther: true } },
            { title: 'B', permissionKey: { replacements: [{ type: 'state', path: 'user.id' }] } },
          ],
        },
      } as any);

      render(<AppActions {...props} />, { wrapper });

      expect(mockUseMultipleFormData).toHaveBeenCalledWith(
        'page1',
        [{ type: 'state', path: 'user.id' }],
        false,
        undefined,
      );
    });

    it('contributes an empty array for a button with no permissionKey', () => {
      mockUseMultipleFormData.mockReturnValue({});
      const props = buildProps({
        actions: {
          buttons: [
            { title: 'A' },
            { title: 'B', permissionKey: { replacements: [{ type: 'state', path: 'user.id' }] } },
          ],
        },
      } as any);

      render(<AppActions {...props} />, { wrapper });

      expect(mockUseMultipleFormData).toHaveBeenCalledWith(
        'page1',
        [{ type: 'state', path: 'user.id' }],
        false,
        undefined,
      );
    });
  });

  describe('replacementValues passed to securable objects check', () => {
    it('passes the resolved replacementValues to isActionAllowedBasedOnSecurableObjects', () => {
      const replacementValues = { userId: 123 };
      const securableObjects = { keyA: true };
      mockUseMultipleFormData.mockReturnValue(replacementValues);
      mockUseSystem.mockReturnValue({
        applyPermissions: true,
        allSymbol: '*',
        securableObjects,
      } as any);

      const props = buildProps({
        actions: { buttons: [{ title: 'A', permissionKey: 'keyA' }] },
      } as any);

      render(<AppActions {...props} />, { wrapper });

      expect(mockIsActionAllowedBasedOnSecurableObjects).toHaveBeenCalledWith(
        replacementValues,
        'keyA',
        securableObjects,
        true,
      );
    });

    it('falls back to defaultItemActions when permissionKey is undefined', () => {
      const replacementValues = { userId: 123 };
      const securableObjects = {};
      mockUseMultipleFormData.mockReturnValue(replacementValues);
      mockUseSystem.mockReturnValue({
        applyPermissions: true,
        allSymbol: '*',
        securableObjects,
      } as any);

      const props = buildProps({
        actions: { buttons: [{ title: 'A' }] },
      } as any);

      render(<AppActions {...props} />, { wrapper });

      expect(mockIsActionAllowedBasedOnSecurableObjects).toHaveBeenCalledWith(
        replacementValues,
        'defaultItemActions',
        securableObjects,
        true,
      );
    });
  });

  describe('checkValidButtons branch respects securable objects', () => {
    const setup = (securableAllowed: boolean) => {
      validButtonsTransition = [{ code: 'A' }];
      finished = true;
      mockUseSelector.mockReturnValue('123');
      mockIsActionAllowed.mockReturnValue(true);
      mockIsActionAllowedBasedOnSecurableObjects.mockReturnValue(securableAllowed);
      mockUseMultipleFormData.mockReturnValue({ userId: 123 });
      mockUseSystem.mockReturnValue({
        applyPermissions: true,
        allSymbol: '*',
        securableObjects: { keyA: true },
      } as any);
      return buildProps({
        actions: {
          buttons: [{ title: 'A', permissionKey: 'keyA' }],
          checkValidButtons: true,
        },
      } as any);
    };

    it('hides the button when the securable objects check fails', () => {
      render(<AppActions {...setup(false)} />, { wrapper });
      expect(screen.queryByTestId('action-btn-A')).not.toBeInTheDocument();
    });

    it('shows the button when the securable objects check passes', () => {
      render(<AppActions {...setup(true)} />, { wrapper });
      expect(screen.getByTestId('action-btn-A')).toBeInTheDocument();
      expect(mockIsActionAllowedBasedOnSecurableObjects).toHaveBeenCalledWith(
        { userId: 123 },
        'keyA',
        { keyA: true },
        true,
      );
    });
  });

  describe('non-checkValidButtons path filters on securable objects', () => {
    it('hides the button when the securable objects check fails', () => {
      mockIsActionAllowed.mockReturnValue(true);
      mockIsActionAllowedBasedOnSecurableObjects.mockReturnValue(false);
      const props = buildProps({
        actions: { buttons: [{ title: 'A', permissionKey: 'keyA' }] },
      } as any);

      render(<AppActions {...props} />, { wrapper });
      expect(screen.queryByTestId('action-btn-A')).not.toBeInTheDocument();
    });

    it('shows the button when both permission checks pass', () => {
      mockIsActionAllowed.mockReturnValue(true);
      mockIsActionAllowedBasedOnSecurableObjects.mockReturnValue(true);
      const props = buildProps({
        actions: { buttons: [{ title: 'A', permissionKey: 'keyA' }] },
      } as any);

      render(<AppActions {...props} />, { wrapper });
      expect(screen.getByTestId('action-btn-A')).toBeInTheDocument();
    });
  });

  describe('early-return guards', () => {
    it('renders nothing when the visibility check fails', () => {
      mockUseCheckFrom.mockReturnValue({ check: false } as any);
      const props = buildProps();

      render(<AppActions {...props} />, { wrapper });
      expect(screen.queryByTestId('action-btn-A')).not.toBeInTheDocument();
    });
  });
});
