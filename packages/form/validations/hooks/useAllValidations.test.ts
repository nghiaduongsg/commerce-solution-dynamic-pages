import { renderHook, act } from '@testing-library/react';
import useAllValidations from './useAllValidations';

// Mock the isParent utility function
jest.mock('@pkg-form/validations/utils/widgetUtils', () => ({
  isParent: jest.fn(),
}));

import { isParent } from '@pkg-form/validations/utils/widgetUtils';
const mockIsParent = isParent as jest.MockedFunction<typeof isParent>;

describe('useAllValidations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty errors', () => {
    const { result } = renderHook(() => useAllValidations());

    expect(result.current.errors).toEqual({});
  });

  describe('setFieldErrors', () => {
    it('should set errors for a field', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.setFieldErrors('field1', ['error1', 'error2']);
      });

      expect(result.current.errors).toEqual({
        field1: ['error1', 'error2'],
      });
    });

    it('should overwrite existing errors for a field', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.setFieldErrors('field1', ['error1']);
      });

      act(() => {
        result.current.setFieldErrors('field1', ['error2', 'error3']);
      });

      expect(result.current.errors).toEqual({
        field1: ['error2', 'error3'],
      });
    });
  });

  describe('getFieldErrors', () => {
    it('should return errors for existing field', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.setFieldErrors('field1', ['error1', 'error2']);
      });

      expect(result.current.getFieldErrors('field1')).toEqual(['error1', 'error2']);
    });

    it('should return undefined for non-existing field', () => {
      const { result } = renderHook(() => useAllValidations());

      expect(result.current.getFieldErrors('nonExistentField')).toBeUndefined();
    });
  });

  describe('addFieldErrors', () => {
    it('should add errors to existing field errors', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.setFieldErrors('field1', ['error1']);
      });

      act(() => {
        result.current.addFieldErrors('field1', ['error2', 'error3']);
      });

      expect(result.current.errors.field1).toEqual(['error1', 'error2', 'error3']);
    });

    it('should add errors to field with no existing errors', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.addFieldErrors('field1', ['error1', 'error2']);
      });

      expect(result.current.errors.field1).toEqual(['error1', 'error2']);
    });
  });

  describe('removeFieldErrors', () => {
    it('should remove specific errors from field', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.setFieldErrors('field1', ['error1', 'error2', 'error3']);
      });

      act(() => {
        result.current.removeFieldErrors('field1', ['error1', 'error3']);
      });

      expect(result.current.errors.field1).toEqual(['error2']);
    });

    it('should handle removing errors from field with no errors', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.removeFieldErrors('field1', ['error1']);
      });

      expect(result.current.errors.field1).toEqual([]);
    });

    it('should handle removing non-existent errors', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.setFieldErrors('field1', ['error1']);
      });

      act(() => {
        result.current.removeFieldErrors('field1', ['nonExistentError']);
      });

      expect(result.current.errors.field1).toEqual(['error1']);
    });
  });

  describe('removeMultipleFieldErrors', () => {
    it('should remove all errors from many field', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.setFieldErrors('field1', ['error1', 'error2', 'error3']);
        result.current.setFieldErrors('field2', ['error1', 'error2', 'error3']);
      });

      act(() => {
        result.current.removeMultipleFieldErrors(['field1', 'field2']);
      });

      expect(result.current.errors.field1).toEqual([]);
      expect(result.current.errors.field2).toEqual([]);
    });
  });

  describe('isFieldValid', () => {
    it('should return true for field with no errors', () => {
      const { result } = renderHook(() => useAllValidations());

      expect(result.current.isFieldValid('field1')).toBe(true);
    });

    it('should return true for field with empty errors array', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.setFieldErrors('field1', []);
      });

      expect(result.current.isFieldValid('field1')).toBe(true);
    });

    it('should return false for field with errors', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.setFieldErrors('field1', ['error1']);
      });

      expect(result.current.isFieldValid('field1')).toBe(false);
    });
  });

  describe('isFormValid', () => {
    beforeEach(() => {
      mockIsParent.mockImplementation((key: string, parent: string) => key.startsWith(parent));
    });

    it('should return true when no child fields have errors', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.setFieldErrors('parent.child1', []);
        result.current.setFieldErrors('parent.child2', []);
        result.current.setFieldErrors('otherField', ['error']);
      });

      expect(result.current.isFormValid('parent')).toBe(true);
    });

    it('should return false when child fields have errors', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.setFieldErrors('parent.child1', ['error1']);
        result.current.setFieldErrors('parent.child2', []);
      });

      expect(result.current.isFormValid('parent')).toBe(false);
    });

    it('should return true when no fields match parent', () => {
      const { result } = renderHook(() => useAllValidations());
      mockIsParent.mockReturnValue(false);

      act(() => {
        result.current.setFieldErrors('field1', ['error1']);
      });

      expect(result.current.isFormValid('parent')).toBe(true);
    });
  });

  describe('isGroupValid', () => {
    it('should return true when no group fields have errors', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.setFieldErrors('field1', []);
        result.current.setFieldErrors('field2', []);
        result.current.setFieldErrors('otherField', ['error']);
      });

      expect(result.current.isGroupValid(['field1', 'field2'])).toBe(true);
    });

    it('should return false when group fields have errors', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.setFieldErrors('field1', ['error1']);
        result.current.setFieldErrors('field2', []);
      });

      expect(result.current.isGroupValid(['field1', 'field2'])).toBe(false);
    });

    it('should handle partial field name matches', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.setFieldErrors('user.name', ['error1']);
        result.current.setFieldErrors('user.email', []);
      });

      expect(result.current.isGroupValid(['user'])).toBe(false);
    });

    it('should return true when no fields match group', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.setFieldErrors('field1', ['error1']);
      });

      expect(result.current.isGroupValid(['differentField'])).toBe(true);
    });
  });

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.setFieldErrors('field1', ['error1']);
        result.current.setFieldErrors('field2', ['error2']);
      });

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.errors).toEqual({});
    });
  });

  describe('clearParentFieldErrors', () => {
    it('should clear errors for fields starting with entityId', () => {
      const { result } = renderHook(() => useAllValidations());

      const initialErrors = {
        'entity1.field1': ['error1'],
        'entity1.field2': ['error2'],
        'entity2.field1': ['error3'],
        otherField: ['error4'],
      };

      act(() => {
        Object.entries(initialErrors).forEach(([fieldId, errors]) => {
          result.current.setFieldErrors(fieldId, errors);
        });
      });

      act(() => {
        result.current.clearParentFieldErrors('entity1');
      });

      expect(result.current.errors).toEqual({
        'entity2.field1': ['error3'],
        otherField: ['error4'],
      });
    });

    it('should handle empty errors object', () => {
      const { result } = renderHook(() => useAllValidations());

      act(() => {
        result.current.clearParentFieldErrors('entity1');
      });

      expect(result.current.errors).toEqual({});
    });
  });
});
