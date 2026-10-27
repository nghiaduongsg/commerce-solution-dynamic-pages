import { renderHook } from '@testing-library/react';
import useDateWidgetValidations from './useDateWidgetValidations';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import useValidations from '@pkg-form/validations/hooks/useValidations';
import useFormData from '@pkg-common/dataResolver/useFormData';
import { mockDate } from '@_jestHelpers/dateMock';
import { startOfDay } from 'date-fns';

jest.mock('@pkg-common/dataResolver/useFormData');
jest.mock('@pkg-common/dataResolver/useCheckFrom');
jest.mock('@pkg-form/validations/hooks/useValidations');

describe('useDateWidgetValidations', () => {
  const originalDate = Date;

  const mockUseCheckFrom = useCheckFrom as jest.Mock;
  const mockUseValidations = useValidations as jest.Mock;
  const mockUseFormData = useFormData as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    global.Date = originalDate;
  });

  it('should return expected structure when shouldValidate = true', () => {
    const widgetId = 'widget-1';
    const shouldValidate = true;
    const format = 'dd-MM-yyyy';
    const validations = { required: true };
    const validateFrom = {};
    const validateWhen = {};
    const serverErrors = ['server-error'];
    const errors = ['error'];

    mockUseFormData.mockReturnValue({ value: 'a' });
    mockUseCheckFrom.mockReturnValue({ check: shouldValidate });
    mockUseValidations.mockReturnValue({
      errors,
      valid: false,
      dynamicValidations: {},
    });

    const { result } = renderHook(() =>
      useDateWidgetValidations(
        widgetId,
        '01-05-2025',
        validations,
        validateFrom,
        // @ts-ignore
        validateWhen,
        serverErrors,
        format,
      ),
    );

    expect(mockUseCheckFrom).toHaveBeenCalledWith(widgetId, validateWhen, true);
    expect(mockUseValidations).toHaveBeenCalledWith(
      widgetId,
      '01-05-2025',
      format,
      { required: true, shouldValidate },
      validateFrom,
      serverErrors,
    );

    expect(result.current.errors).toEqual(errors);
    expect(result.current.valid).toEqual(false);
    expect(result.current.minDate).toEqual(undefined);
    expect(result.current.maxDate).toEqual(undefined);
    expect(result.current.minTime).toEqual(undefined);
    expect(result.current.maxTime).toEqual(undefined);
    expect(result.current.disableDates('02-09-2034')).toEqual(false);
  });

  it('should return expected structure when shouldValidate = false', () => {
    const widgetId = 'widget-1';
    const shouldValidate = false;
    const format = 'dd-MM-yyyy';
    const validations = { required: true };
    const validateFrom = {};
    const validateWhen = {};
    const serverErrors = ['server-error'];
    const errors = ['error'];

    mockUseCheckFrom.mockReturnValue({ check: shouldValidate });
    mockUseValidations.mockReturnValue({
      errors,
      valid: false,
      dynamicValidations: {},
    });

    const { result } = renderHook(() =>
      useDateWidgetValidations(
        widgetId,
        '01-05-2025',
        validations,
        validateFrom,
        // @ts-ignore
        validateWhen,
        serverErrors,
        format,
      ),
    );

    expect(mockUseCheckFrom).toHaveBeenCalledWith(widgetId, validateWhen, true);
    expect(mockUseValidations).toHaveBeenCalledWith(
      widgetId,
      '01-05-2025',
      format,
      {},
      undefined,
      serverErrors,
    );

    expect(result.current.errors).toEqual(errors);
    expect(result.current.valid).toEqual(false);
    expect(result.current.minDate).toEqual(undefined);
    expect(result.current.maxDate).toEqual(undefined);
    expect(result.current.minTime).toEqual(undefined);
    expect(result.current.maxTime).toEqual(undefined);
    expect(result.current.disableDates('02-09-2034')).toEqual(false);
  });

  it('should return expected structure when shouldValidate = true and there is minValue=today validation', () => {
    mockDate(1234);
    const widgetId = 'widget-1';
    const shouldValidate = true;
    const format = 'dd-MM-yyyy';
    const validations = { required: true, minValue: 'today' };
    const validateFrom = {};
    const validateWhen = {};
    const serverErrors = ['server-error'];
    const errors = ['error'];

    mockUseFormData.mockReturnValue({ value: 'a' });
    mockUseCheckFrom.mockReturnValue({ check: shouldValidate });
    mockUseValidations.mockReturnValue({
      errors,
      valid: false,
      dynamicValidations: {},
    });

    const { result } = renderHook(() =>
      useDateWidgetValidations(
        widgetId,
        '01-05-2025',
        validations,
        validateFrom,
        // @ts-ignore
        validateWhen,
        serverErrors,
        format,
      ),
    );

    expect(mockUseCheckFrom).toHaveBeenCalledWith(widgetId, validateWhen, true);
    expect(mockUseValidations).toHaveBeenCalledWith(
      widgetId,
      '01-05-2025',
      format,
      { required: true, minValue: 'today', shouldValidate },
      {},
      serverErrors,
    );

    expect(result.current.errors).toEqual(errors);
    expect(result.current.valid).toEqual(false);
    expect(result.current.minDate?.getTime()).toEqual(1234);
    expect(result.current.maxDate).toEqual(undefined);
    expect(result.current.minTime).toEqual(undefined);
    expect(result.current.maxTime).toEqual(undefined);
    expect(result.current.disableDates('02-09-2034')).toEqual(false);
  });

  it('should return expected structure when shouldValidate = true and there is minValue=tomorrow validation', () => {
    mockDate(1234, 1235);
    const widgetId = 'widget-1';
    const shouldValidate = true;
    const format = 'dd-MM-yyyy';
    const validations = { required: true, minValue: 'tomorrow' };
    const validateFrom = {};
    const validateWhen = {};
    const serverErrors = ['server-error'];
    const errors = ['error'];

    mockUseFormData.mockReturnValue({ value: 'a' });
    mockUseCheckFrom.mockReturnValue({ check: shouldValidate });
    mockUseValidations.mockReturnValue({
      errors,
      valid: false,
      dynamicValidations: {},
    });

    const { result } = renderHook(() =>
      useDateWidgetValidations(
        widgetId,
        '01-05-2025',
        validations,
        validateFrom,
        // @ts-ignore
        validateWhen,
        serverErrors,
        format,
      ),
    );

    expect(mockUseCheckFrom).toHaveBeenCalledWith(widgetId, validateWhen, true);
    expect(mockUseValidations).toHaveBeenCalledWith(
      widgetId,
      '01-05-2025',
      format,
      { required: true, minValue: 'tomorrow', shouldValidate },
      {},
      serverErrors,
    );

    expect(result.current.errors).toEqual(errors);
    expect(result.current.valid).toEqual(false);
    expect(result.current.minDate?.getTime()).toEqual(1235);
    expect(result.current.maxDate).toEqual(undefined);
    expect(result.current.minTime).toEqual(undefined);
    expect(result.current.maxTime).toEqual(undefined);
    expect(result.current.disableDates('02-09-2034')).toEqual(false);
  });

  it('should return expected structure when shouldValidate = true and there is maxValue=today validation', () => {
    mockDate(1234, 1235);
    const widgetId = 'widget-1';
    const shouldValidate = true;
    const format = 'dd-MM-yyyy';
    const validations = { required: true, maxValue: 'today' };
    const validateFrom = {};
    const validateWhen = {};
    const serverErrors = ['server-error'];
    const errors = ['error'];

    mockUseFormData.mockReturnValue({ value: 'a' });
    mockUseCheckFrom.mockReturnValue({ check: shouldValidate });
    mockUseValidations.mockReturnValue({
      errors,
      valid: false,
      dynamicValidations: {},
    });

    const { result } = renderHook(() =>
      useDateWidgetValidations(
        widgetId,
        '01-05-2025',
        validations,
        validateFrom,
        // @ts-ignore
        validateWhen,
        serverErrors,
        format,
      ),
    );

    expect(mockUseCheckFrom).toHaveBeenCalledWith(widgetId, validateWhen, true);
    expect(mockUseValidations).toHaveBeenCalledWith(
      widgetId,
      '01-05-2025',
      format,
      { required: true, maxValue: 'today', shouldValidate },
      {},
      serverErrors,
    );

    expect(result.current.errors).toEqual(errors);
    expect(result.current.valid).toEqual(false);
    expect(result.current.minDate).toEqual(undefined);
    expect(result.current.maxDate?.getTime()).toEqual(1234);
    expect(result.current.minTime).toEqual(undefined);
    expect(result.current.maxTime).toEqual(undefined);
    expect(result.current.disableDates('02-09-2034')).toEqual(false);
  });

  it('should return expected structure when shouldValidate = true and there is minValue=today validation and dynamicValidations exist with a minimum value AFTER today', () => {
    const widgetId = 'widget-1';
    const shouldValidate = true;
    const format = 'dd-MM-yyyy';
    const validations = { required: true, minValue: 'today' };
    const validateFrom = {};
    const validateWhen = {};
    const serverErrors = ['server-error'];
    const errors = ['error'];

    const today = startOfDay(new Date()); // Today

    const today2 = startOfDay(new Date());
    const dynamic = startOfDay(today2.setDate(today2.getDate() + 5)).toString(); // Dynamic validation = 5 days later

    mockUseFormData.mockReturnValue({ value: 'a' });
    mockUseCheckFrom.mockReturnValue({ check: shouldValidate });
    mockUseValidations.mockReturnValue({
      errors,
      valid: false,
      dynamicValidations: { minValue: dynamic },
    });

    const { result } = renderHook(() =>
      useDateWidgetValidations(
        widgetId,
        today,
        validations,
        validateFrom,
        // @ts-ignore
        validateWhen,
        serverErrors,
        format,
      ),
    );

    expect(mockUseCheckFrom).toHaveBeenCalledWith(widgetId, validateWhen, true);
    expect(mockUseValidations).toHaveBeenCalledWith(
      widgetId,
      today,
      format,
      { required: true, minValue: 'today', shouldValidate },
      {},
      serverErrors,
    );

    expect(result.current.minDate).toEqual(startOfDay(dynamic));
  });

  it('should return expected structure when shouldValidate = true and there is minValue=tomorrow validation and dynamicValidations exist with a minimum value AFTER tomorrow', () => {
    const widgetId = 'widget-1';
    const shouldValidate = true;
    const format = 'dd-MM-yyyy';
    const validations = { required: true, minValue: 'tomorrow' };
    const validateFrom = {};
    const validateWhen = {};
    const serverErrors = ['server-error'];
    const errors = ['error'];

    const today = startOfDay(new Date()); // Today

    const today2 = startOfDay(new Date());
    const dynamic = startOfDay(today2.setDate(today2.getDate() + 5)).toString(); // Dynamic validation = 5 days later

    mockUseFormData.mockReturnValue({ value: 'a' });
    mockUseCheckFrom.mockReturnValue({ check: shouldValidate });
    mockUseValidations.mockReturnValue({
      errors,
      valid: false,
      dynamicValidations: { minValue: dynamic },
    });

    const { result } = renderHook(() =>
      useDateWidgetValidations(
        widgetId,
        today,
        validations,
        validateFrom,
        // @ts-ignore
        validateWhen,
        serverErrors,
        format,
      ),
    );

    expect(mockUseCheckFrom).toHaveBeenCalledWith(widgetId, validateWhen, true);
    expect(mockUseValidations).toHaveBeenCalledWith(
      widgetId,
      today,
      format,
      { required: true, minValue: 'tomorrow', shouldValidate },
      {},
      serverErrors,
    );

    expect(result.current.minDate).toEqual(startOfDay(dynamic));
  });

  it('should return expected structure when shouldValidate = true and there is minValue=today validation and dynamicValidations exist with a minimum value BEFORE today', () => {
    const widgetId = 'widget-1';
    const shouldValidate = true;
    const format = 'dd-MM-yyyy';
    const validations = { required: true, minValue: 'today' };
    const validateFrom = {};
    const validateWhen = {};
    const serverErrors = ['server-error'];
    const errors = ['error'];

    const today = startOfDay(new Date());
    const today2 = new Date();
    today2.setDate(today2.getDate() - 3);
    const dynamic = startOfDay(today2).toString(); // Dynamic validation = 3 days before

    mockUseFormData.mockReturnValue({ value: 'a' });
    mockUseCheckFrom.mockReturnValue({ check: shouldValidate });
    mockUseValidations.mockReturnValue({
      errors,
      valid: false,
      dynamicValidations: { minValue: dynamic },
    });

    const { result } = renderHook(() =>
      useDateWidgetValidations(
        widgetId,
        today,
        validations,
        validateFrom,
        // @ts-ignore
        validateWhen,
        serverErrors,
        format,
      ),
    );

    expect(mockUseCheckFrom).toHaveBeenCalledWith(widgetId, validateWhen, true);
    expect(mockUseValidations).toHaveBeenCalledWith(
      widgetId,
      today,
      format,
      { required: true, minValue: 'today', shouldValidate },
      {},
      serverErrors,
    );

    expect(startOfDay(result.current.minDate as Date)).toEqual(today);
  });

  it('should return expected structure when shouldValidate = true and there is minValue=tomorrow validation and dynamicValidations exist with a minimum value BEFORE tomorrow', () => {
    const widgetId = 'widget-1';
    const shouldValidate = true;
    const format = 'dd-MM-yyyy';
    const validations = { required: true, minValue: 'tomorrow' };
    const validateFrom = {};
    const validateWhen = {};
    const serverErrors = ['server-error'];
    const errors = ['error'];

    const today = startOfDay(new Date()); // Today
    const today2 = new Date();
    today2.setDate(today2.getDate() - 5);
    const dynamic = startOfDay(today2).toString(); // Dynamic validation = 5 days before

    mockUseFormData.mockReturnValue({ value: 'a' });
    mockUseCheckFrom.mockReturnValue({ check: shouldValidate });
    mockUseValidations.mockReturnValue({
      errors,
      valid: false,
      dynamicValidations: { minValue: dynamic },
    });

    const { result } = renderHook(() =>
      useDateWidgetValidations(
        widgetId,
        today,
        validations,
        validateFrom,
        // @ts-ignore
        validateWhen,
        serverErrors,
        format,
      ),
    );

    expect(mockUseCheckFrom).toHaveBeenCalledWith(widgetId, validateWhen, true);
    expect(mockUseValidations).toHaveBeenCalledWith(
      widgetId,
      today,
      format,
      { required: true, minValue: 'tomorrow', shouldValidate },
      {},
      serverErrors,
    );

    expect(startOfDay(result.current.minDate as Date)).toEqual(
      startOfDay(today.setDate(today.getDate() + 1)),
    ); // because minValue is tomorrow
  });

  it('should return expected structure when shouldValidate = true and there is maxValue=today validation and dynamicValidations exist with a maximum value AFTER today', () => {
    const widgetId = 'widget-1';
    const shouldValidate = true;
    const format = 'dd-MM-yyyy';
    const validations = { required: true, maxValue: 'today' };
    const validateFrom = {};
    const validateWhen = {};
    const serverErrors = ['server-error'];
    const errors = ['error'];

    const today = startOfDay(new Date()); // Today
    const today2 = new Date();
    today2.setDate(today2.getDate() + 5);
    const dynamic = startOfDay(today2).toString(); // Dynamic validation = 5 days later

    mockUseFormData.mockReturnValue({ value: 'a' });
    mockUseCheckFrom.mockReturnValue({ check: shouldValidate });
    mockUseValidations.mockReturnValue({
      errors,
      valid: false,
      dynamicValidations: { maxValue: dynamic },
    });

    const { result } = renderHook(() =>
      useDateWidgetValidations(
        widgetId,
        today,
        validations,
        validateFrom,
        // @ts-ignore
        validateWhen,
        serverErrors,
        format,
      ),
    );

    expect(mockUseCheckFrom).toHaveBeenCalledWith(widgetId, validateWhen, true);
    expect(mockUseValidations).toHaveBeenCalledWith(
      widgetId,
      today,
      format,
      { required: true, maxValue: 'today', shouldValidate },
      {},
      serverErrors,
    );

    expect(startOfDay(result.current.maxDate as Date)).toEqual(startOfDay(today));
  });

  it('should return expected structure when shouldValidate = true and there is maxValue=today validation and dynamicValidations exist with a maximum value BEFORE today', () => {
    const widgetId = 'widget-1';
    const shouldValidate = true;
    const format = 'dd-MM-yyyy';
    const validations = { required: true, maxValue: 'today' };
    const validateFrom = {};
    const validateWhen = {};
    const serverErrors = ['server-error'];
    const errors = ['error'];

    const today = startOfDay(new Date()); // Today

    const today2 = startOfDay(new Date());
    const dynamic = startOfDay(today2.setDate(today2.getDate() - 3)).toString(); // Dynamic validation = 3 days before

    mockUseFormData.mockReturnValue({ value: 'a' });
    mockUseCheckFrom.mockReturnValue({ check: shouldValidate });
    mockUseValidations.mockReturnValue({
      errors,
      valid: false,
      dynamicValidations: { maxValue: dynamic },
    });

    const { result } = renderHook(() =>
      useDateWidgetValidations(
        widgetId,
        today,
        validations,
        validateFrom,
        // @ts-ignore
        validateWhen,
        serverErrors,
        format,
      ),
    );

    expect(mockUseCheckFrom).toHaveBeenCalledWith(widgetId, validateWhen, true);
    expect(mockUseValidations).toHaveBeenCalledWith(
      widgetId,
      today,
      format,
      { required: true, maxValue: 'today', shouldValidate },
      {},
      serverErrors,
    );

    expect(result.current.maxDate).toEqual(startOfDay(dynamic));
  });
});
