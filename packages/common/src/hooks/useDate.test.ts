import { renderHook } from '@testing-library/react';
import useDate from './useDate';
import useCodeListAttributes from '@pkg-core/codeList/hooks/useCodeListAttributes';

// Mock the useCodeListAttributes hook
jest.mock('@pkg-core/codeList/hooks/useCodeListAttributes');

const mockUseCodeListAttributes = useCodeListAttributes as jest.MockedFunction<
  typeof useCodeListAttributes
>;

describe('useDate', () => {
  const mockGetAttribute = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCodeListAttributes.mockReturnValue({
      getAttribute: mockGetAttribute,
    } as any);
  });

  describe('fallback behavior when no dateCode available', () => {
    beforeEach(() => {
      // Mock to return null/undefined to trigger fallback logic
      mockGetAttribute.mockReturnValue(null);
    });

    it('should return "HH:mm" for time type', () => {
      const { result } = renderHook(() => useDate('time'));
      expect(result.current).toBe('HH:mm');
    });

    it('should return "yyyy-MM-dd HH:mm:ss" for dateTimeNoTimeZone type', () => {
      const { result } = renderHook(() => useDate('dateTimeNoTimeZone'));
      expect(result.current).toBe('yyyy-MM-dd HH:mm:ss');
    });

    it('should return "yyyy-MM-dd HH:mm:ss" for dateTimeWithTimeZone type', () => {
      const { result } = renderHook(() => useDate('dateTimeWithTimeZone'));
      expect(result.current).toBe('yyyy-MM-dd HH:mm:ss');
    });

    it('should return "yyyy-MM-dd" for default case', () => {
      const { result } = renderHook(() => useDate('date'));
      expect(result.current).toBe('yyyy-MM-dd');
    });

    it('should return "yyyy-MM-dd" for unknown type', () => {
      const { result } = renderHook(() => useDate('unknown'));
      expect(result.current).toBe('yyyy-MM-dd');
    });
  });

  describe('fallback behavior when dateCode is empty array', () => {
    beforeEach(() => {
      mockGetAttribute.mockReturnValue([]);
    });

    it('should return fallback for time when empty array', () => {
      const { result } = renderHook(() => useDate('time'));
      expect(result.current).toBe('HH:mm');
    });

    it('should return fallback for dateTimeNoTimeZone when empty array', () => {
      const { result } = renderHook(() => useDate('dateTimeNoTimeZone'));
      expect(result.current).toBe('yyyy-MM-dd HH:mm:ss');
    });

    it('should return fallback for dateTimeWithTimeZone when empty array', () => {
      const { result } = renderHook(() => useDate('dateTimeWithTimeZone'));
      expect(result.current).toBe('yyyy-MM-dd HH:mm:ss');
    });
  });

  describe('when dateCode is available', () => {
    it('should return first element from dateCode array', () => {
      mockGetAttribute.mockReturnValue(['dd-MM-yyyy', 'MM/dd/yyyy']);

      const { result } = renderHook(() => useDate('date'));

      expect(result.current).toBe('dd-MM-yyyy');
    });

    it('should return first element even for time type when dateCode exists', () => {
      mockGetAttribute.mockReturnValue(['HH:mm:ss']);

      const { result } = renderHook(() => useDate('time'));

      expect(result.current).toBe('HH:mm:ss');
    });
  });
});
