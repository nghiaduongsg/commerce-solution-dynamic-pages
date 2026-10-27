import { renderHook } from '@testing-library/react';
import { useParams } from 'react-router';
import useClearApiData from '@pkg-core/apiData/hooks/useClearApiData';
import useFieldReady from './useFieldReady';
import { getMockWrapperWithFormManagerContext } from '@_jestHelpers/reactMockStore';

jest.mock('react-router');
jest.mock('@pkg-core/apiData/hooks/useClearApiData');

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseClearApiData = useClearApiData as jest.MockedFunction<typeof useClearApiData>;
const mockFieldId = 'testFieldId';

const formManagerContext = {
  isFieldVisible: () => false,
  isFieldDirty: jest.fn(),
};

const wrapper = getMockWrapperWithFormManagerContext(formManagerContext);

beforeEach(() => jest.clearAllMocks());

describe('useFieldReady', () => {
  it('should return true when APIs are finished and form is new (no idKey) regardless of form being dirty', () => {
    (mockUseClearApiData as jest.Mock).mockReturnValue({ apisFinished: true });
    formManagerContext.isFieldDirty.mockReturnValue(true);
    mockUseParams.mockReturnValue({});

    const { result } = renderHook(() => useFieldReady(mockFieldId), { wrapper });

    expect(result.current).toBe(true);
  });

  it('should return false when form has been saved (has idKey) and is not dirty', () => {
    (mockUseClearApiData as jest.Mock).mockReturnValue({ apisFinished: true });
    mockUseParams.mockReturnValue({ idKey: 'existing-id-123' });
    formManagerContext.isFieldDirty.mockReturnValue(false);

    const { result } = renderHook(() => useFieldReady(mockFieldId), { wrapper });

    expect(result.current).toBe(false);
    expect(mockUseParams).toHaveBeenCalled();
  });

  it('should return false when APIs are not finished regardless of other conditions', () => {
    (mockUseClearApiData as jest.Mock).mockReturnValue({ apisFinished: false });
    mockUseParams.mockReturnValue({ idKey: '' });
    formManagerContext.isFieldDirty.mockReturnValue(true);
    const { result } = renderHook(() => useFieldReady(mockFieldId), { wrapper });
    expect(result.current).toBe(false);
  });

  it('should return true when form has been saved but is dirty', () => {
    (mockUseClearApiData as jest.Mock).mockReturnValue({ apisFinished: true });
    mockUseParams.mockReturnValue({ idKey: 'existing-id-123' });
    formManagerContext.isFieldDirty.mockReturnValue(true);

    const { result } = renderHook(() => useFieldReady(mockFieldId), { wrapper });
    expect(result.current).toBe(true);
  });
});
