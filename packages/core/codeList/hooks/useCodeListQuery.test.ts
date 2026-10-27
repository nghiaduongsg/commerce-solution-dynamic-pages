import { renderHook } from '@testing-library/react';
import useCodeListQuery from './useCodeListQuery';
import useCodeList from './useCodeList';
import useMultipleFormData from '@pkg-common/dataResolver/useMultipleFormData';
import { createCodelistKey, getContextValue } from '@pkg-form/validations/utils/widgetUtils';

jest.mock('./useCodeList');
jest.mock('@pkg-common/dataResolver/useMultipleFormData');
jest.mock('@pkg-form/validations/utils/widgetUtils');

describe('useCodeListQuery', () => {
  const mockUseCodeList = useCodeList as jest.MockedFunction<typeof useCodeList>;
  const mockUseMultipleFormData = useMultipleFormData as jest.MockedFunction<
    typeof useMultipleFormData
  >;
  const mockCreateCodelistKey = createCodelistKey as jest.MockedFunction<typeof createCodelistKey>;
  const mockGetContextValue = getContextValue as jest.MockedFunction<typeof getContextValue>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMultipleFormData.mockReturnValue({ field1: 'value1' });
    mockCreateCodelistKey.mockReturnValue('codelistKey');
    mockUseCodeList.mockReturnValue({ list: [{ code: 'TEST', label: 'Test' }] } as any);
    mockGetContextValue.mockReturnValue([{ code: 'TEST' }] as any);
  });

  it('should return true when performQuery is false', () => {
    const objConfig = {
      code: 'code',
      replacements: [{ path: 'replacement1' }],
      queryFrom: [{ path: 'query1' }],
      performQuery: false,
    } as any;

    const { result } = renderHook(() => useCodeListQuery('widgetId', objConfig));

    expect(result.current).toBe(true);
  });

  it('should return boolean based on queryValues when performQuery is true', () => {
    const objConfig = {
      code: 'code',
      attribute: 'attr',
      value: 'value',
      performQuery: true,
    } as any;

    mockGetContextValue.mockReturnValue([{ code: 'TEST1' }, { code: 'TEST2' }]);
    const { result: resultWithValues } = renderHook(() => useCodeListQuery('widgetId', objConfig));
    expect(resultWithValues.current).toBe(true);

    mockGetContextValue.mockReturnValue([]);
    const { result: resultEmpty } = renderHook(() => useCodeListQuery('widgetId', objConfig));
    expect(resultEmpty.current).toBe(false);
  });
});
