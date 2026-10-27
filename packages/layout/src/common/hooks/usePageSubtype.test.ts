import { renderHook } from '@testing-library/react';
import usePageSubtype from './usePageSubtype';

jest.mock('react-router', () => ({
  useParams: jest.fn(),
  useLocation: jest.fn(),
}));

jest.mock('@pkg-core/apiData', () => ({
  useApiDataState: jest.fn(),
}));

jest.mock('@pkg-setup/src/system/useSystem', () => jest.fn());
jest.mock('@pkg-entity/hooks/useFormField', () => jest.fn());
jest.mock('@pkg-core/schemas/SchemasController', () => ({
  getSchemasStoreId: jest.fn(),
}));

import { useParams, useLocation } from 'react-router';
import { useApiDataState } from '@pkg-core/apiData';
import useSystem from '@pkg-setup/src/system/useSystem';
import useFormField from '@pkg-entity/hooks/useFormField';

describe('usePageSubtype', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useParams as jest.Mock).mockReturnValue({ category: 'TestPage' });
    (useSystem as jest.Mock).mockReturnValue({ application: 'OTHER' });
    (useApiDataState as jest.Mock).mockReturnValue({
      data: { uiSchema: { 'ui:page': { subTypeKey: 'typeKey' } } },
    });
  });

  it('returns query subType when present', () => {
    (useLocation as jest.Mock).mockReturnValue({ search: '?subType=abc' });
    (useFormField as jest.Mock).mockReturnValue({ value: 'formValue' });

    const { result } = renderHook(() => usePageSubtype());

    expect(result.current).toBe('abc');
  });

  it('falls back to form value', () => {
    (useLocation as jest.Mock).mockReturnValue({ search: '' });
    (useFormField as jest.Mock).mockReturnValue({ value: 'formValue' });

    const { result } = renderHook(() => usePageSubtype());

    expect(result.current).toBe('formValue');
  });

  it('returns null when nothing exists', () => {
    (useLocation as jest.Mock).mockReturnValue({ search: '' });
    (useFormField as jest.Mock).mockReturnValue({ value: null });

    const { result } = renderHook(() => usePageSubtype());

    expect(result.current).toBeNull();
  });
});
