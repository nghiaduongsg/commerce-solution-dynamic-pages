import { renderHook } from '@testing-library/react';
import useTextWidgetValidations from './useTextWidgetValidations';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import useValidations from '@pkg-form/validations/hooks/useValidations';

jest.mock('@pkg-common/dataResolver/useCheckFrom');
jest.mock('@pkg-form/validations/hooks/useValidations');
jest.mock('@pkg-form/validations/hooks/useValidations', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    errors: ['mock-error'],
    valid: true,
  })),
}));

describe('useTextWidgetValidations', () => {
  const mockUseCheckFrom = useCheckFrom as jest.Mock;
  const mockUseValidations = useValidations as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return expected structure with validation enabled', () => {
    mockUseCheckFrom.mockReturnValue({ check: true });
    mockUseValidations.mockReturnValue({
      errors: ['Some error'],
      valid: false,
    });

    const { result } = renderHook(() =>
      useTextWidgetValidations(
        'widget-1',
        'value',
        { required: true },
        ['Server error'],
        { some: 'schema' } as any,
        { other: 'check' } as any,
      ),
    );

    expect(mockUseCheckFrom).toHaveBeenCalledWith('widget-1', { other: 'check' }, true);
    expect(mockUseValidations).toHaveBeenCalledWith(
      'widget-1',
      'value',
      'string',
      expect.objectContaining({
        required: true,
        shouldValidate: true,
      }),
      { some: 'schema' },
      ['Server error'],
    );

    expect(result.current).toEqual({
      errors: ['Some error'],
      valid: false,
      shouldValidate: true,
    });
  });

  it('should disable required validation when shouldValidate is false', () => {
    mockUseCheckFrom.mockReturnValue({ check: false });
    mockUseValidations.mockReturnValue({
      errors: [],
      valid: true,
    });

    const { result } = renderHook(() =>
      useTextWidgetValidations('widget-2', '', { required: true }, []),
    );

    expect(mockUseValidations).toHaveBeenCalledWith(
      'widget-2',
      '',
      'string',
      expect.objectContaining({
        required: false,
        shouldValidate: false,
      }),
      undefined,
      [],
    );

    expect(result.current.shouldValidate).toBe(false);
    expect(result.current.valid).toBe(true);
  });

  it('should handle undefined validations gracefully', () => {
    mockUseCheckFrom.mockReturnValue({ check: true });
    mockUseValidations.mockReturnValue({
      errors: [],
      valid: true,
    });

    const { result } = renderHook(() =>
      useTextWidgetValidations('widget-3', 'value', undefined, []),
    );

    expect(mockUseValidations).toHaveBeenCalledWith(
      'widget-3',
      'value',
      'string',
      expect.objectContaining({
        shouldValidate: true,
      }),
      undefined,
      [],
    );
    expect(result.current.errors).toEqual([]);
  });
});
