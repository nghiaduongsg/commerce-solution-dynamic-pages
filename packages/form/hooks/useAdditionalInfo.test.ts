import { renderHook } from '@testing-library/react';
import useAdditionalInfo from './useAdditionalInfo';
import useMultipleFormData from '@pkg-common/dataResolver/useMultipleFormData';
import useSystem from '@pkg-setup/src/system/useSystem';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { useTranslation } from 'react-i18next';
import { InfoSchema } from '@pkg-common/types';

jest.mock('@pkg-common/dataResolver/useMultipleFormData');
jest.mock('@pkg-setup/src/system/useSystem');
jest.mock('react-i18next');
jest.mock('@pkg-common/dataResolver/useCheckFrom');

describe('useAdditionalInfo hook - allowHtml property', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useMultipleFormData as jest.Mock).mockReturnValue([]);
    (useSystem as jest.Mock).mockReturnValue({ selectedLanguage: 'en' });
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
    });
    (useCheckFrom as jest.Mock).mockReturnValue({ check: true });
  });

  it('returns allowHtml as false when not provided in info schema', () => {
    const info = {
      type: 'DEFAULT',
      infoMessage: 'test.message',
    } as InfoSchema;

    const { result } = renderHook(() => useAdditionalInfo('test-id', info));

    expect(result.current.allowHtml).toBe(false);
  });

  it('returns allowHtml as true when explicitly set in info schema', () => {
    const info = {
      type: 'DEFAULT',
      infoMessage: 'test.message',
      allowHtml: true,
    } as InfoSchema;

    const { result } = renderHook(() => useAdditionalInfo('test-id', info));

    expect(result.current.allowHtml).toBe(true);
  });

  it('includes allowHtml in return value', () => {
    const info = {
      type: 'DEFAULT',
      infoMessage: 'test.message',
      allowHtml: true,
    } as InfoSchema;

    const { result } = renderHook(() => useAdditionalInfo('test-id', info));

    expect(result.current).toHaveProperty('allowHtml');
    expect(typeof result.current.allowHtml).toBe('boolean');
  });

  it('returns allowHtml as false for tooltip type', () => {
    const info = {
      type: 'TOOLTIP',
      infoMessage: 'test.message',
    } as InfoSchema;

    const { result } = renderHook(() => useAdditionalInfo('test-id', info));

    expect(result.current.allowHtml).toBe(false);
  });

  it('returns allowHtml as true for tooltip type when explicitly set', () => {
    const info = {
      type: 'TOOLTIP',
      infoMessage: 'test.message',
      allowHtml: true,
    } as InfoSchema;

    const { result } = renderHook(() => useAdditionalInfo('test-id', info));

    expect(result.current.allowHtml).toBe(true);
  });

  it('handles null info object gracefully', () => {
    const { result } = renderHook(() =>
      useAdditionalInfo('test-id', null as unknown as InfoSchema),
    );

    expect(result.current.allowHtml).toBe(false);
  });

  it('handles undefined info object gracefully', () => {
    const { result } = renderHook(() =>
      useAdditionalInfo('test-id', undefined as unknown as InfoSchema),
    );

    expect(result.current.allowHtml).toBe(false);
  });
});
