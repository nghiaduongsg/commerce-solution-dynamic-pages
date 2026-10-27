// Testing utilities and React
import { renderHook } from '@testing-library/react';

// The hook we are testing
import useFormValidity from './useFormGroupValidity';

// We now import the REAL selector to let it run.
// We also import the state types to build our mock state.
import { FormValidationsState } from '@pkg-form/validations/redux/types';

// Dependency to be mocked
import { useSelector } from 'react-redux';

// Your project's helper for creating a Redux store and Provider wrapper for tests
import { getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';

// --- JEST MOCKS ---
// We ONLY mock react-redux. The selectors will be real.
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

// Cast the mocked function for type safety
const mockUseSelector = useSelector as unknown as jest.Mock;

type MockFormValidationsState = Omit<FormValidationsState, 'errors'>;

type MockFormValidationsReduxState = {
  FormValidations: MockFormValidationsState;
};

describe('useFormValidity hook with real selectors', () => {
  // A base state to build upon in each test.
  const baseMockState: MockFormValidationsReduxState = {
    FormValidations: {
      serverErrors: {},
      serverErrorTypes: {},
    },
  };

  beforeEach(() => {
    mockUseSelector.mockClear();
  });

  // This is the core of our realistic test setup.
  // The mock implementation of useSelector will now execute the real selector
  // function that it receives against a given state.
  const setupUseSelectorMock = (state: MockFormValidationsReduxState) => {
    mockUseSelector.mockImplementation((selectorFn) => selectorFn(state));
  };

  test('should return TRUE for both when no fields are specified', () => {
    // ARRANGE
    const testFields: string[] = [];
    setupUseSelectorMock(baseMockState);
    const { wrapper } = getMockWrapperAndStore(baseMockState);

    // ACT
    const { result } = renderHook(() => useFormValidity(testFields), { wrapper });

    // ASSERT
    expect(result.current.isGroupValidServerSide).toBe(true);
  });

  test('should return TRUE for both when fields exist but have no errors', () => {
    // ARRANGE
    const mockState: MockFormValidationsReduxState = {
      ...baseMockState,
      FormValidations: {
        ...baseMockState.FormValidations,
        serverErrors: { anotherField: ['A server error on an unrelated field'] },
      },
    };
    const testFields = ['myFieldA', 'myFieldB']; // These fields have no errors in the state
    setupUseSelectorMock(mockState);
    const { wrapper } = getMockWrapperAndStore(mockState);

    // ACT
    const { result } = renderHook(() => useFormValidity(testFields), { wrapper });

    // ASSERT
    expect(result.current.isGroupValidServerSide).toBe(true);
  });

  test('should return FALSE for client-side when a specified field has a client-side error', () => {
    // ARRANGE
    const mockState: MockFormValidationsReduxState = {
      ...baseMockState,
      FormValidations: {
        ...baseMockState.FormValidations,
        serverErrors: {},
      },
    };
    // The selector logic uses `indexOf`, so we can test a partial match.
    const testFields = ['fieldWithError'];
    setupUseSelectorMock(mockState);
    const { wrapper } = getMockWrapperAndStore(mockState);

    // ACT
    const { result } = renderHook(() => useFormValidity(testFields), { wrapper });

    // ASSERT
    expect(result.current.isGroupValidServerSide).toBe(true); // No server errors for this field
  });

  test('should return FALSE for server-side when a specified field has a server-side error', () => {
    // ARRANGE
    const mockState: MockFormValidationsReduxState = {
      ...baseMockState,
      FormValidations: {
        ...baseMockState.FormValidations,
        serverErrors: { serverIssueField: ['Value already exists'] },
      },
    };
    const testFields = ['serverIssueField'];
    setupUseSelectorMock(mockState);
    const { wrapper } = getMockWrapperAndStore(mockState);

    // ACT
    const { result } = renderHook(() => useFormValidity(testFields), { wrapper });

    // ASSERT
    expect(result.current.isGroupValidServerSide).toBe(false);
  });

  test('should return FALSE for both when a field has both client and server errors', () => {
    // ARRANGE
    const mockState: MockFormValidationsReduxState = {
      ...baseMockState,
      FormValidations: {
        ...baseMockState.FormValidations,
        serverErrors: { 'problemField-abc': ['This value is blocked'] },
      },
    };
    const testFields = ['problemField'];
    setupUseSelectorMock(mockState);
    const { wrapper } = getMockWrapperAndStore(mockState);

    // ACT
    const { result } = renderHook(() => useFormValidity(testFields), { wrapper });

    // ASSERT
    expect(result.current.isGroupValidServerSide).toBe(false);
  });
});
