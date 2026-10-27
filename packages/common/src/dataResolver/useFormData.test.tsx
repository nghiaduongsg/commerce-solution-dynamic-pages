import React, { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import useFormData from './useFormData';
import * as utils from './utils';
import * as commonUtils from '../utils';
import {
  getMockWrapperAndStore,
  getMockWrapperWithoutStoreData,
} from '@_jestHelpers/reactMockStore';
import { DataSourceSchema } from '@pkg-common/types';
import { useParams, useLocation } from 'react-router';

jest.mock('./utils');
jest.mock('../utils');
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: jest.fn(),
  useLocation: jest.fn(),
}));

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;
const mockResolveSourceData = utils.resolveSourceData as jest.MockedFunction<
  typeof utils.resolveSourceData
>;
const mockHasValue = commonUtils.hasValue as jest.MockedFunction<typeof commonUtils.hasValue>;
const { wrapper: ReduxProviderWrapper } = getMockWrapperWithoutStoreData();
const wrapper = ({ children }: { children: ReactNode }) => (
  <ReduxProviderWrapper>
    <MemoryRouter>{children} </MemoryRouter>
  </ReduxProviderWrapper>
);

describe('useFormData hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({});
    mockUseLocation.mockReturnValue({
      state: {},
      key: '',
      pathname: '',
      search: '',
      hash: '',
    });
  });

  describe('Initial value determination', () => {
    it('should return null for number type', () => {
      const { result } = renderHook(() => useFormData('widget1', undefined, 'number'), { wrapper });

      expect(result.current.value).toBe(null);
    });

    it('should return null for array type containing number', () => {
      const { result } = renderHook(
        () => useFormData('widget1', undefined, ['string', 'number', 'boolean']),
        {
          wrapper,
        },
      );

      expect(result.current.value).toBe(null);
    });

    it('should return empty string for non-number types', () => {
      const { result } = renderHook(() => useFormData('widget1', undefined, 'string'), { wrapper });

      expect(result.current.value).toBe('');
    });

    it('should return empty string for undefined type', () => {
      const { result } = renderHook(() => useFormData('widget1'), { wrapper });

      expect(result.current.value).toBe('');
    });
  });

  describe('Source data resolution', () => {
    it('should return initial value when no source is provided', () => {
      const { result } = renderHook(() => useFormData('widget1', undefined, 'string'), { wrapper });

      expect(result.current.value).toBe('');
    });

    it('should return initial value when source has no value', () => {
      mockHasValue.mockReturnValue(false);
      const source: DataSourceSchema = {
        type: 'SELF',
        code: '',
        performQuery: false,
      };

      const { result } = renderHook(() => useFormData('widget1', source, 'string'), { wrapper });

      expect(result.current.value).toBe('');
    });

    it('should return initial value when widgetId is empty', () => {
      const source: DataSourceSchema = {
        type: 'ENTITY',
        code: 'test',
        performQuery: true,
      };

      const { result } = renderHook(() => useFormData('', source, 'string'), { wrapper });

      expect(result.current.value).toBe('');
    });

    it('should call resolveSourceData with correct parameters', () => {
      const mockState = { user: { id: 1 } };
      const { wrapper } = getMockWrapperAndStore(mockState);
      const mockRouteParams = { id: '123' };
      const mockLocationState = { fromPage: 'dashboard' };
      const source: DataSourceSchema = {
        type: 'FILTERS',
        jsonPath: ['user', 'name'],
        performQuery: true,
      };

      mockHasValue.mockReturnValue(true);
      mockResolveSourceData.mockReturnValue({ value: 'John Doe', apply: true });
      mockUseParams.mockReturnValue(mockRouteParams);
      mockUseLocation.mockReturnValue({
        state: mockLocationState,
        key: '',
        pathname: '',
        search: '',
        hash: '',
      });

      renderHook(() => useFormData('widget1', source, 'string'), { wrapper });

      expect(mockResolveSourceData).toHaveBeenCalledWith(
        'widget1',
        {
          state: mockState,
          routeParams: mockRouteParams,
          routerData: mockLocationState,
        },
        { key: 'KEY', source },
      );
    });

    it('should return resolved data when source is valid', () => {
      const resolvedData = { value: 'Resolved Value', apply: true };
      mockHasValue.mockReturnValue(true);
      mockResolveSourceData.mockReturnValue(resolvedData);

      const source: DataSourceSchema = {
        type: 'STORE',
        jsonPath: ['user', 'name'],
        performQuery: true,
      };

      const { result } = renderHook(() => useFormData('widget1', source, 'string'), { wrapper });

      expect(result.current).toEqual(resolvedData);
    });
  });

  describe('Memoization and caching', () => {
    it('should return cached value when data has not changed', () => {
      const mockState = { user: { name: 'John' } };
      const resolvedData = { value: 'John', apply: false };

      mockHasValue.mockReturnValue(true);
      mockResolveSourceData.mockReturnValue(resolvedData);

      const source: DataSourceSchema = {
        type: 'SELF',
        code: '',
        performQuery: false,
      };

      const { result, rerender } = renderHook(() => useFormData('widget1', source, 'string'), {
        wrapper,
      });

      const firstResult = result.current;

      // Rerender with same data
      rerender();

      expect(result.current).toBe(firstResult);
    });

    it('should return new value when data changes', () => {
      const source: DataSourceSchema = {
        type: 'SELF',
        code: '',
        performQuery: false,
      };
      mockHasValue.mockReturnValue(true);

      // First render
      mockResolveSourceData.mockReturnValueOnce({ value: 'John', apply: false });

      const { result, rerender } = renderHook(
        ({ widgetId }) => useFormData(widgetId, source, 'string'),
        {
          wrapper,
          initialProps: { widgetId: 'widget1' },
        },
      );

      expect(result.current.value).toBe('John');

      // Change mock return value and trigger dependency change
      mockResolveSourceData.mockReturnValue({ value: 'Jane', apply: true });

      // Rerender with different widgetId to trigger useMemo re-evaluation
      rerender({ widgetId: 'widget2' });

      expect(result.current.value).toBe('Jane');
    });

    it('should handle empty value correctly in comparison', () => {
      mockHasValue
        .mockReturnValueOnce(true) // for source check
        .mockReturnValueOnce(false); // for value check
      mockResolveSourceData.mockReturnValue({ value: null, apply: false });

      const source: DataSourceSchema = {
        type: 'SELF',
        code: '',
        performQuery: false,
      };

      const { result } = renderHook(() => useFormData('widget1', source, 'string'), { wrapper });

      // Should use empty string in comparison when value has no value
      expect(result.current).toEqual({ value: '' });
    });
  });

  describe('Router params and location changes', () => {
    it('should update when route params change', () => {
      mockHasValue.mockReturnValue(true);
      mockResolveSourceData
        .mockReturnValueOnce({ value: 'param1', apply: false })
        .mockReturnValueOnce({ value: 'param2', apply: false });

      mockUseParams.mockReturnValueOnce({ id: '1' }).mockReturnValueOnce({ id: '2' });

      const source: DataSourceSchema = { type: 'STORE' };

      const { result, rerender } = renderHook(() => useFormData('widget1', source, 'string'), {
        wrapper,
      });

      expect(result.current.value).toBe('param1');

      rerender();

      expect(result.current.value).toBe('param2');
    });

    it('should update when location state changes', () => {
      mockHasValue.mockReturnValue(true);
      mockResolveSourceData
        .mockReturnValueOnce({ value: 'state1', apply: true })
        .mockReturnValueOnce({ value: 'state2', apply: true });

      mockUseLocation
        .mockReturnValueOnce({
          state: { data: 'value1' },
          key: '',
          pathname: '',
          search: '',
          hash: '',
        })
        .mockReturnValueOnce({
          state: { data: 'value2' },
          key: '',
          pathname: '',
          search: '',
          hash: '',
        });

      const source: DataSourceSchema = { type: 'STORE' };

      const { result, rerender } = renderHook(() => useFormData('widget1', source, 'string'), {
        wrapper,
      });

      expect(result.current.value).toBe('state1');

      rerender();

      expect(result.current.value).toBe('state2');
    });
  });

  describe('Edge cases', () => {
    it('should handle null widgetId', () => {
      const { result } = renderHook(() => useFormData(null as any, { type: 'SELF' }), { wrapper });

      expect(result.current.value).toBe('');
    });

    it('should handle empty array type', () => {
      const { result } = renderHook(() => useFormData('widget1', undefined, []), { wrapper });

      expect(result.current.value).toBe(''); // empty array doesn't include 'number'
    });
  });
});
