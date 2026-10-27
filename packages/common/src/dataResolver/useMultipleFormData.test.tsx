import { renderHook } from '@testing-library/react';
import { MemoryRouter, useParams, useLocation } from 'react-router';
import useMultipleFormData from './useMultipleFormData';
import * as utils from './utils';
import {
  getMockWrapperAndStore,
  getMockWrapperWithoutStoreData,
} from '@_jestHelpers/reactMockStore';
import React, { ReactNode } from 'react';
import { mockUseDateHook } from '@_jestHelpers/useDateMock';

jest.mock('./utils');
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: jest.fn(),
  useLocation: jest.fn(),
}));

const mockResolveData = utils.resolveData as jest.MockedFunction<typeof utils.resolveData>;
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;

const { wrapper: ReduxProviderWrapper } = getMockWrapperWithoutStoreData();
const wrapper = ({ children }: { children: ReactNode }) => (
  <ReduxProviderWrapper>
    <MemoryRouter>{children} </MemoryRouter>
  </ReduxProviderWrapper>
);

describe('useMultipleFormData hook', () => {
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

    mockUseDateHook();
  });

  describe('Guard conditions hook', () => {
    it('should return empty object when no widgetId provided', () => {
      const sources = [{ type: 'state', path: 'user.name' }];

      // @ts-ignore
      const { result } = renderHook(() => useMultipleFormData('', sources), { wrapper });

      expect(result.current).toEqual({});
      expect(mockResolveData).not.toHaveBeenCalled();
    });

    it('should return empty object when no sources provided', () => {
      const { result } = renderHook(() => useMultipleFormData('widget1', undefined), { wrapper });

      expect(result.current).toEqual({});
      expect(mockResolveData).not.toHaveBeenCalled();
    });

    it('should return empty object when sources array is empty', () => {
      const { result } = renderHook(() => useMultipleFormData('widget1', []), { wrapper });

      expect(result.current).toEqual({});
      expect(mockResolveData).not.toHaveBeenCalled();
    });
  });

  describe('Data resolution', () => {
    it('should call resolveData with correct parameters', () => {
      const mockState = { user: { name: 'John' } };
      const { wrapper } = getMockWrapperAndStore(mockState);
      const mockRouteParams = { id: '123' };
      const mockLocationState = { fromPage: 'dashboard' };
      const sources = [
        { type: 'state', path: 'user.name' },
        { type: 'params', path: 'id' },
      ];
      const resourceData = { additional: 'data' };

      mockResolveData.mockReturnValue({ field1: 'value1', field2: 'value2' });
      mockUseParams.mockReturnValue(mockRouteParams);
      mockUseLocation.mockReturnValue({
        state: mockLocationState,
        key: '',
        pathname: '',
        search: '',
        hash: '',
      });

      // @ts-ignore
      renderHook(() => useMultipleFormData('widget1', sources, true, resourceData), { wrapper });

      expect(mockResolveData).toHaveBeenCalledWith(
        'widget1',
        {
          state: mockState,
          routeParams: mockRouteParams,
          routerData: mockLocationState,
          dateFormat: 'yyyy-MM-dd',
        },
        sources,
        true,
        resourceData,
      );
    });

    it('should return resolved data when valid sources provided', () => {
      const resolvedData = {
        userName: 'John Doe',
        userId: '123',
      };
      mockResolveData.mockReturnValue(resolvedData);

      const sources = [{ type: 'state', path: 'user' }];

      // @ts-ignore
      const { result } = renderHook(() => useMultipleFormData('widget1', sources), { wrapper });

      expect(result.current).toEqual(resolvedData);
    });

    it('should return empty object when resolveData returns empty object', () => {
      mockResolveData.mockReturnValue({});

      const sources = [{ type: 'state', path: 'nonexistent' }];

      // @ts-ignore
      const { result } = renderHook(() => useMultipleFormData('widget1', sources), { wrapper });

      expect(result.current).toEqual({});
    });
  });

  describe('Memoization', () => {
    it('should return same reference when dependencies unchanged', () => {
      const mockState = { user: { name: 'John' } };
      const { wrapper } = getMockWrapperAndStore(mockState);
      const resolvedData = { field: 'value' };
      mockResolveData.mockReturnValue(resolvedData);

      const sources = [{ type: 'state', path: 'user.name' }];

      // @ts-ignore
      const { result, rerender } = renderHook(() => useMultipleFormData('widget1', sources), {
        wrapper,
      });

      const firstResult = result.current;
      rerender();

      expect(result.current).toBe(firstResult);
    });

    it('should recalculate when sources change', () => {
      mockResolveData
        .mockReturnValueOnce({ field1: 'value1' })
        .mockReturnValueOnce({ field2: 'value2' });

      const { result, rerender } = renderHook(
        // @ts-ignore
        ({ sources }) => useMultipleFormData('widget1', sources),
        {
          wrapper,
          initialProps: { sources: [{ type: 'state', path: 'user.name' }] },
        },
      );

      expect(result.current).toEqual({ field1: 'value1' });

      rerender({ sources: [{ type: 'state', path: 'user.email' }] });

      expect(result.current).toEqual({ field2: 'value2' });
      expect(mockResolveData).toHaveBeenCalledTimes(2);
    });
  });

  describe('Optional parameters', () => {
    it('should handle returnFalsyValues parameter', () => {
      const resolvedData = { field: null, anotherField: '' };
      mockResolveData.mockReturnValue(resolvedData);

      const sources = [{ type: 'state', path: 'user' }];

      // @ts-ignore
      const { result } = renderHook(() => useMultipleFormData('widget1', sources, true), {
        wrapper,
      });

      expect(mockResolveData).toHaveBeenCalledWith(
        'widget1',
        expect.any(Object),
        sources,
        true,
        undefined,
      );
      expect(result.current).toEqual(resolvedData);
    });

    it('should handle resourceData parameter', () => {
      const resourceData = { config: { theme: 'dark' } };
      mockResolveData.mockReturnValue({ field: 'value' });

      const sources = [{ type: 'resource', path: 'config' }];

      // @ts-ignore
      renderHook(() => useMultipleFormData('widget1', sources, false, resourceData), { wrapper });

      expect(mockResolveData).toHaveBeenCalledWith(
        'widget1',
        expect.any(Object),
        sources,
        false,
        resourceData,
      );
    });
  });
});
