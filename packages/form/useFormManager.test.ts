import { renderHook, act } from '@testing-library/react';
import useFormManager from './useFormManager';

describe('useFormManager', () => {
  describe('initial state', () => {
    it('should initialize with empty disabledValues', () => {
      const { result } = renderHook(() => useFormManager());

      expect(result.current.disabledValues).toEqual({});
    });

    it('should initialize with empty visibility', () => {
      const { result } = renderHook(() => useFormManager());

      expect(result.current.visibility).toEqual({});
    });

    it('should initialize with empty component value types', () => {
      const { result } = renderHook(() => useFormManager());

      expect(result.current.componentTypes).toEqual({});
    });

    it('should provide setFieldDisabledValues function', () => {
      const { result } = renderHook(() => useFormManager());

      expect(typeof result.current.setFieldDisabledValues).toBe('function');
    });

    it('should provide getFieldDisabledValues function', () => {
      const { result } = renderHook(() => useFormManager());

      expect(typeof result.current.getFieldDisabledValues).toBe('function');
    });

    it('should provide clearAllDisabledValues function', () => {
      const { result } = renderHook(() => useFormManager());

      expect(typeof result.current.clearAllDisabledValues).toBe('function');
    });

    it('should provide setFieldVisibility function', () => {
      const { result } = renderHook(() => useFormManager());

      expect(typeof result.current.setFieldVisibility).toBe('function');
    });

    it('should provide isFieldVisible function', () => {
      const { result } = renderHook(() => useFormManager());

      expect(typeof result.current.isFieldVisible).toBe('function');
    });
  });

  describe('setFieldDisabledValues', () => {
    it('should set disabled values for a field', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDisabledValues('fieldA', { prop: ['value1', 'value2'] } as any);
      });

      expect(result.current.disabledValues).toEqual({
        fieldA: { prop: ['value1', 'value2'] },
      });
    });

    it('should merge with existing disabled values for different fields', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDisabledValues('fieldA', { prop: ['value1'] } as any);
      });

      act(() => {
        result.current.setFieldDisabledValues('fieldB', { prop: ['value2'] } as any);
      });

      expect(result.current.disabledValues).toEqual({
        fieldA: { prop: ['value1'] },
        fieldB: { prop: ['value2'] },
      });
    });

    it('should overwrite existing values for the same field', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDisabledValues('fieldA', { prop: ['value1'] } as any);
      });

      act(() => {
        result.current.setFieldDisabledValues('fieldA', { prop: ['value2', 'value3'] } as any);
      });

      expect(result.current.disabledValues).toEqual({
        fieldA: { prop: ['value2', 'value3'] },
      });
    });

    it('should handle multiple properties per field', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDisabledValues('fieldA', {
          prop1: ['a', 'b'],
          prop2: ['c'],
        } as any);
      });

      expect(result.current.disabledValues).toEqual({
        fieldA: {
          prop1: ['a', 'b'],
          prop2: ['c'],
        },
      });
    });

    it('should handle array values with different types', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDisabledValues('fieldA', {
          prop: ['string', 123, true],
        } as any);
      });

      expect(result.current.disabledValues).toEqual({
        fieldA: {
          prop: ['string', 123, true],
        },
      });
    });
  });

  describe('getFieldDisabledValues', () => {
    it('should retrieve disabled values for a field and property', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDisabledValues('fieldA', { prop: ['value1', 'value2'] } as any);
      });

      const disabledValues = result.current.getFieldDisabledValues('fieldA', 'prop');

      expect(disabledValues).toEqual(['value1', 'value2']);
    });

    it('should return empty array for non-existent field', () => {
      const { result } = renderHook(() => useFormManager());

      const disabledValues = result.current.getFieldDisabledValues('nonexistent', 'prop');

      expect(disabledValues).toEqual([]);
    });

    it('should return empty array for non-existent property', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDisabledValues('fieldA', { prop: ['value1'] } as any);
      });

      const disabledValues = result.current.getFieldDisabledValues('fieldA', 'nonexistent');

      expect(disabledValues).toEqual([]);
    });

    it('should retrieve from multiple properties independently', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDisabledValues('fieldA', {
          prop1: ['a', 'b'],
          prop2: ['c', 'd'],
        } as any);
      });

      const prop1Values = result.current.getFieldDisabledValues('fieldA', 'prop1');
      const prop2Values = result.current.getFieldDisabledValues('fieldA', 'prop2');

      expect(prop1Values).toEqual(['a', 'b']);
      expect(prop2Values).toEqual(['c', 'd']);
    });

    it('should handle dot notation in property names', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDisabledValues('fieldA', {
          'nested.prop': ['value1'],
        } as any);
      });

      const disabledValues = result.current.getFieldDisabledValues('fieldA', 'nested.prop');

      expect(disabledValues).toEqual(['value1']);
    });
  });

  describe('clearAllDisabledValues', () => {
    it('should clear all disabled values', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDisabledValues('fieldA', { prop: ['value1'] } as any);
        result.current.setFieldDisabledValues('fieldB', { prop: ['value2'] } as any);
      });

      act(() => {
        result.current.clearAllDisabledValues();
      });

      expect(result.current.disabledValues).toEqual({});
    });

    it('should be safe to call on empty state', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.clearAllDisabledValues();
      });

      expect(result.current.disabledValues).toEqual({});
    });

    it('should clear data properly when called after multiple sets', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDisabledValues('fieldA', { prop: ['value1'] } as any);
      });

      act(() => {
        result.current.setFieldDisabledValues('fieldB', { prop: ['value2'] } as any);
      });

      act(() => {
        result.current.clearAllDisabledValues();
      });

      const fieldAValues = result.current.getFieldDisabledValues('fieldA', 'prop');
      const fieldBValues = result.current.getFieldDisabledValues('fieldB', 'prop');

      expect(fieldAValues).toEqual([]);
      expect(fieldBValues).toEqual([]);
    });
  });

  describe('setFieldVisibility', () => {
    it('should set field visibility to true by default', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldVisibility('fieldA');
      });

      expect(result.current.visibility).toEqual({
        fieldA: true,
      });
    });

    it('should set field visibility to true explicitly', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldVisibility('fieldA', true);
      });

      expect(result.current.visibility).toEqual({
        fieldA: true,
      });
    });

    it('should set field visibility to false', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldVisibility('fieldA', false);
      });

      expect(result.current.visibility).toEqual({
        fieldA: false,
      });
    });

    it('should handle multiple fields visibility independently', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldVisibility('fieldA', true);
      });

      act(() => {
        result.current.setFieldVisibility('fieldB', false);
      });

      expect(result.current.visibility).toEqual({
        fieldA: true,
        fieldB: false,
      });
    });

    it('should overwrite existing visibility for the same field', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldVisibility('fieldA', true);
      });

      act(() => {
        result.current.setFieldVisibility('fieldA', false);
      });

      expect(result.current.visibility).toEqual({
        fieldA: false,
      });
    });

    it('should preserve other fields visibility when updating one field', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldVisibility('fieldA', true);
        result.current.setFieldVisibility('fieldB', false);
      });

      act(() => {
        result.current.setFieldVisibility('fieldA', false);
      });

      expect(result.current.visibility).toEqual({
        fieldA: false,
        fieldB: false,
      });
    });
  });

  describe('setManyFieldsVisibility', () => {
    it('should set visibility to true for multiple fields', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setManyFieldsVisibility(['fieldA', 'fieldB']);
      });

      expect(result.current.visibility).toEqual({
        fieldA: true,
        fieldB: true,
      });
    });

    it('should set visibility to false for multiple fields', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setManyFieldsVisibility(['fieldA', 'fieldB'], false);
      });

      expect(result.current.visibility).toEqual({
        fieldA: false,
        fieldB: false,
      });
    });

    it('should set field visibility to false', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldVisibility('fieldA', false);
      });

      expect(result.current.visibility).toEqual({
        fieldA: false,
      });
    });

    it('should handle multiple fields visibility independently', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldVisibility('fieldA', true);
      });

      act(() => {
        result.current.setFieldVisibility('fieldB', false);
      });

      expect(result.current.visibility).toEqual({
        fieldA: true,
        fieldB: false,
      });
    });

    it('should overwrite existing visibility for the same field', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldVisibility('fieldA', true);
      });

      act(() => {
        result.current.setFieldVisibility('fieldA', false);
      });

      expect(result.current.visibility).toEqual({
        fieldA: false,
      });
    });

    it('should preserve other fields visibility when updating one field', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldVisibility('fieldA', true);
        result.current.setFieldVisibility('fieldB', false);
      });

      act(() => {
        result.current.setFieldVisibility('fieldA', false);
      });

      expect(result.current.visibility).toEqual({
        fieldA: false,
        fieldB: false,
      });
    });
  });

  describe('isFieldVisible', () => {
    it('should return true for non-existent field', () => {
      const { result } = renderHook(() => useFormManager());

      const isVisible = result.current.isFieldVisible('nonexistent');

      expect(isVisible).toBe(true);
    });

    it('should handle falsy values correctly', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldVisibility('fieldA', false);
      });

      const isVisible = result.current.isFieldVisible('fieldA');

      expect(isVisible).toBe(false);
    });

    it('should handle truthy values correctly', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldVisibility('fieldA', true);
      });

      const isVisible = result.current.isFieldVisible('fieldA');

      expect(isVisible).toBe(true);
    });

    it('should return correct visibility for multiple fields', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldVisibility('fieldA', true);
        result.current.setFieldVisibility('fieldB', false);
        result.current.setFieldVisibility('fieldC', true);
      });

      expect(result.current.isFieldVisible('fieldA')).toBe(true);
      expect(result.current.isFieldVisible('fieldB')).toBe(false);
      expect(result.current.isFieldVisible('fieldC')).toBe(true);
      expect(result.current.isFieldVisible('nonexistent')).toBe(true);
    });
  });

  describe('setFieldDirty', () => {
    it('should set field dirty', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDirty('fieldA');
      });

      expect(result.current.dirtyFlags).toEqual({
        fieldA: true,
      });
    });

    it('should set field dirty to true explicitly', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDirty('fieldA', true);
      });

      expect(result.current.dirtyFlags).toEqual({
        fieldA: true,
      });
    });

    it('should set field dirty to false', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDirty('fieldA', false);
      });

      expect(result.current.dirtyFlags).toEqual({
        fieldA: false,
      });
    });

    it('should handle multiple fields dirty flags independently', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDirty('fieldA', true);
      });

      act(() => {
        result.current.setFieldDirty('fieldB', false);
      });

      expect(result.current.dirtyFlags).toEqual({
        fieldA: true,
        fieldB: false,
      });
    });

    it('should overwrite existing dirty flag for the same field', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDirty('fieldA', true);
      });

      act(() => {
        result.current.setFieldDirty('fieldA', false);
      });

      expect(result.current.dirtyFlags).toEqual({
        fieldA: false,
      });
    });

    it('should preserve other fields dirty flags when updating one field', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDirty('fieldA', true);
        result.current.setFieldDirty('fieldB', false);
      });

      act(() => {
        result.current.setFieldDirty('fieldA', false);
      });

      expect(result.current.dirtyFlags).toEqual({
        fieldA: false,
        fieldB: false,
      });
    });
  });

  describe('forceDirty', () => {
    it('should set field dirty', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.forceDirty('formId');
        result.current.forceDirty('formId2');
      });

      expect(result.current.forceDirtyOn).toEqual({
        formId: true,
        formId2: true,
      });
    });
  });

  describe('isFieldDirty', () => {
    it('should return false for non-existent field', () => {
      const { result } = renderHook(() => useFormManager());

      const isDirty = result.current.isFieldDirty('nonexistent');

      expect(isDirty).toBe(false);
    });

    it('should handle falsy values correctly', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDirty('fieldA', false);
      });

      const isDirty = result.current.isFieldDirty('fieldA');

      expect(isDirty).toBe(false);
    });

    it('should handle truthy values correctly', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDirty('fieldA', true);
      });

      const isDirty = result.current.isFieldDirty('fieldA');

      expect(isDirty).toBe(true);
    });

    it('should handle truthy values correctly in combination with forceDirty=true and checkDirty=true', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.forceDirty('form');
      });

      const isDirty = result.current.isFieldDirty('form_fieldA');

      expect(isDirty).toBe(true);
    });

    it('should handle truthy values correctly in combination with forceDirty=true and checkDirty=false', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.forceDirty('form');
      });

      const isDirty = result.current.isFieldDirty('form_fieldA', false);

      expect(isDirty).toBe(false);
    });

    it('should return correct flags for multiple fields', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDirty('fieldA', true);
        result.current.setFieldDirty('fieldB', false);
        result.current.setFieldDirty('fieldC', true);
        result.current.forceDirty('formD');
      });

      expect(result.current.isFieldDirty('fieldA')).toBe(true);
      expect(result.current.isFieldDirty('fieldB')).toBe(false);
      expect(result.current.isFieldDirty('fieldC')).toBe(true);
      expect(result.current.isFieldDirty('nonexistent')).toBe(false);
      expect(result.current.isFieldDirty('formD')).toBe(true);
      expect(result.current.isFieldDirty('formD_A')).toBe(true);
      expect(result.current.isFieldDirty('formD_A', false)).toBe(false);
    });
  });

  describe('isFormDirty', () => {
    it('should handle dirty values for parent field ids', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDirty('form1_fieldA', true);
        result.current.setFieldDirty('form2_fieldA', false);
      });

      const isForm1Dirty = result.current.isFormDirty('form1');
      const isForm2Dirty = result.current.isFormDirty('form2');

      expect(isForm1Dirty).toBe(true);
      expect(isForm2Dirty).toBe(false);
    });

    it('should handle dirty values with forceDirty=true', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.forceDirty('form1');
      });

      const isForm1Dirty = result.current.isFormDirty('form1');
      const isForm2Dirty = result.current.isFormDirty('form2');

      expect(isForm1Dirty).toBe(true);
      expect(isForm2Dirty).toBe(false);
    });
  });

  describe('clearDirtyFlags', () => {
    it('should handle clearDirtyFlags', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDirty('form1_fieldA', true);
        result.current.setFieldDirty('form2_fieldA', false);
        result.current.forceDirty('form2');
      });

      act(() => {
        result.current.clearDirtyFlags('form2');
      });

      const isForm1Dirty = result.current.isFormDirty('form1');
      const isForm2Dirty = result.current.isFormDirty('form2');

      expect(isForm1Dirty).toBe(true);
      expect(isForm2Dirty).toBe(false);
    });
  });

  describe('combined operations', () => {
    it('should handle set, get, and clear operations in sequence', () => {
      const { result } = renderHook(() => useFormManager());

      // Set
      act(() => {
        result.current.setFieldDisabledValues('fieldA', { prop: ['value1'] } as any);
      });

      expect(result.current.disabledValues).toEqual({
        fieldA: { prop: ['value1'] },
      });

      // Get
      const values = result.current.getFieldDisabledValues('fieldA', 'prop');
      expect(values).toEqual(['value1']);

      // Clear
      act(() => {
        result.current.clearAllDisabledValues();
      });

      expect(result.current.disabledValues).toEqual({});
    });

    it('should allow re-setting after clearing', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDisabledValues('fieldA', { prop: ['value1'] } as any);
      });

      act(() => {
        result.current.clearAllDisabledValues();
      });

      act(() => {
        result.current.setFieldDisabledValues('fieldB', { prop: ['value2'] } as any);
      });

      expect(result.current.disabledValues).toEqual({
        fieldB: { prop: ['value2'] },
      });
    });

    it('should update state reactively across multiple calls', () => {
      const { result, rerender } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDisabledValues('fieldA', { prop: ['value1'] } as any);
      });

      let disabledValues = result.current.getFieldDisabledValues('fieldA', 'prop');
      expect(disabledValues).toEqual(['value1']);

      act(() => {
        result.current.setFieldDisabledValues('fieldA', { prop: ['value2'] } as any);
      });

      rerender();

      disabledValues = result.current.getFieldDisabledValues('fieldA', 'prop');
      expect(disabledValues).toEqual(['value2']);
    });

    it('should handle both disabled values and visibility independently', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDisabledValues('fieldA', { prop: ['value1'] } as any);
        result.current.setFieldVisibility('fieldA', false);
      });

      expect(result.current.disabledValues).toEqual({
        fieldA: { prop: ['value1'] },
      });
      expect(result.current.visibility).toEqual({
        fieldA: false,
      });
      expect(result.current.getFieldDisabledValues('fieldA', 'prop')).toEqual(['value1']);
      expect(result.current.isFieldVisible('fieldA')).toBe(false);
    });

    it('should maintain visibility state when clearing disabled values', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDisabledValues('fieldA', { prop: ['value1'] } as any);
        result.current.setFieldVisibility('fieldA', true);
      });

      act(() => {
        result.current.clearAllDisabledValues();
      });

      expect(result.current.disabledValues).toEqual({});
      expect(result.current.visibility).toEqual({
        fieldA: true,
      });
      expect(result.current.isFieldVisible('fieldA')).toBe(true);
    });

    it('should handle complex scenarios with multiple fields and states', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.setFieldDisabledValues('fieldA', { prop: ['value1'] } as any);
        result.current.setFieldDisabledValues('fieldB', { prop: ['value2'] } as any);
        result.current.setFieldVisibility('fieldA', true);
        result.current.setFieldVisibility('fieldB', false);
        result.current.setFieldVisibility('fieldC', true);
      });

      expect(result.current.disabledValues).toEqual({
        fieldA: { prop: ['value1'] },
        fieldB: { prop: ['value2'] },
      });
      expect(result.current.visibility).toEqual({
        fieldA: true,
        fieldB: false,
        fieldC: true,
      });

      // Update visibility of existing field
      act(() => {
        result.current.setFieldVisibility('fieldA', false);
      });

      expect(result.current.isFieldVisible('fieldA')).toBe(false);
      expect(result.current.isFieldVisible('fieldB')).toBe(false);
      expect(result.current.isFieldVisible('fieldC')).toBe(true);
      expect(result.current.getFieldDisabledValues('fieldA', 'prop')).toEqual(['value1']);
    });
  });

  describe('registerReadOnlyField & getReadOnlyFields', () => {
    it('should initialize with empty read-only fields', () => {
      const { result } = renderHook(() => useFormManager());
      expect(result.current.getReadOnlyFields().size).toBe(0);
    });
    it('should provide registerReadOnlyField function', () => {
      const { result } = renderHook(() => useFormManager());
      expect(typeof result.current.registerReadOnlyField).toBe('function');
    });
    it('should provide getReadOnlyFields function', () => {
      const { result } = renderHook(() => useFormManager());
      expect(typeof result.current.getReadOnlyFields).toBe('function');
    });
    it('should add field to set when readMode is true', () => {
      const { result } = renderHook(() => useFormManager());
      act(() => {
        result.current.registerReadOnlyField('FormDef_myField', true);
      });
      expect(result.current.getReadOnlyFields().has('FormDef_myField')).toBe(true);
    });
    it('should remove field from set when readMode is false', () => {
      const { result } = renderHook(() => useFormManager());
      act(() => {
        result.current.registerReadOnlyField('FormDef_myField', true);
      });
      act(() => {
        result.current.registerReadOnlyField('FormDef_myField', false);
      });
      expect(result.current.getReadOnlyFields().has('FormDef_myField')).toBe(false);
    });
    it('should handle multiple fields independently', () => {
      const { result } = renderHook(() => useFormManager());
      act(() => {
        result.current.registerReadOnlyField('FormDef_fieldA', true);
        result.current.registerReadOnlyField('FormDef_fieldB', false);
        result.current.registerReadOnlyField('FormDef_fieldC', true);
      });
      const fields = result.current.getReadOnlyFields();
      expect(fields.has('FormDef_fieldA')).toBe(true);
      expect(fields.has('FormDef_fieldB')).toBe(false);
      expect(fields.has('FormDef_fieldC')).toBe(true);
    });
    it('should be idempotent — registering same field as true twice does not duplicate', () => {
      const { result } = renderHook(() => useFormManager());
      act(() => {
        result.current.registerReadOnlyField('FormDef_fieldA', true);
        result.current.registerReadOnlyField('FormDef_fieldA', true);
      });
      expect(result.current.getReadOnlyFields().size).toBe(1);
    });
    it('should return a snapshot copy — mutations to returned Set do not affect internal state', () => {
      const { result } = renderHook(() => useFormManager());
      act(() => {
        result.current.registerReadOnlyField('FormDef_fieldA', true);
      });
      const snapshot = result.current.getReadOnlyFields();
      snapshot.add('FormDef_injected');
      expect(result.current.getReadOnlyFields().has('FormDef_injected')).toBe(false);
    });
    it('should not trigger re-renders when registering fields', () => {
      let renderCount = 0;
      const { result } = renderHook(() => {
        renderCount++;
        return useFormManager();
      });
      const renderCountBefore = renderCount;
      act(() => {
        result.current.registerReadOnlyField('FormDef_fieldA', true);
        result.current.registerReadOnlyField('FormDef_fieldB', true);
        result.current.registerReadOnlyField('FormDef_fieldC', false);
      });
      expect(renderCount).toBe(renderCountBefore);
    });
    it('should not affect disabledValues or visibility state', () => {
      const { result } = renderHook(() => useFormManager());
      act(() => {
        result.current.setFieldDisabledValues('fieldA', { prop: ['value1'] } as any);
        result.current.setFieldVisibility('fieldA', true);
        result.current.registerReadOnlyField('FormDef_fieldA', true);
      });
      expect(result.current.disabledValues).toEqual({ fieldA: { prop: ['value1'] } });
      expect(result.current.visibility).toEqual({ fieldA: true });
      expect(result.current.getReadOnlyFields().has('FormDef_fieldA')).toBe(true);
    });
  });

  describe('addComponentValueType', () => {
    it('should set component value type', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.addComponentValueType('a', 'codelist1');
        result.current.addComponentValueType('b', 'codelist2');
      });

      expect(result.current.componentTypes).toEqual({
        a: 'codelist1',
        b: 'codelist2',
      });
    });

    it('should not set component value type if already present', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.addComponentValueType('a', 'codelist1');
        result.current.addComponentValueType('b', 'codelist2');
      });

      act(() => {
        result.current.addComponentValueType('b', 'codelist3');
      });

      expect(result.current.componentTypes).toEqual({
        a: 'codelist1',
        b: 'codelist2',
      });
    });

    it('should not set component value type if not a valid componentId', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.addComponentValueType('a', 'codelist1');
        result.current.addComponentValueType('b', 'codelist2');
        result.current.addComponentValueType('', 'codelist3');
      });

      expect(result.current.componentTypes).toEqual({
        a: 'codelist1',
        b: 'codelist2',
      });
    });
  });

  describe('getComponentValueType', () => {
    it('should return the value type if id exists', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.addComponentValueType('a', 'codelist1');
        result.current.addComponentValueType('b', 'codelist2');
      });

      expect(result.current.getComponentValueType('b')).toEqual('codelist2');
    });

    it('should return undefined if id does not exist', () => {
      const { result } = renderHook(() => useFormManager());

      act(() => {
        result.current.addComponentValueType('a', 'codelist1');
        result.current.addComponentValueType('b', 'codelist2');
      });

      expect(result.current.getComponentValueType('c')).toEqual(undefined);
    });
  });
});
