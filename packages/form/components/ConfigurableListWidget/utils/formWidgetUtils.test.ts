import {
  getFieldLabel,
  getFieldValue,
  getRawValue,
  getLinkRoute,
  widgetHasValue,
} from './formWidgetUtils';

describe('formWidgetUtils', () => {
  describe('getFieldLabel', () => {
    it('should return undefined when value has no value', () => {
      expect(getFieldLabel(undefined, false, ['name'], [], 'id')).toBeUndefined();
      expect(getFieldLabel(null, false, ['name'], [], 'id')).toBeUndefined();
      expect(getFieldLabel('', false, ['name'], [], 'id')).toBeUndefined();
    });

    it('should return value as is when isFlat is true', () => {
      expect(getFieldLabel('flat value', true, ['name'], [], 'id')).toBe('flat value');
      expect(getFieldLabel(123, true, ['name'], [], 'id')).toBe(123);
    });

    it('should return joined fields when isFlat is false', () => {
      const value = { name: 'John', surname: 'Doe', id: '1' };
      expect(getFieldLabel(value, false, ['name', 'surname'], [], 'id')).toBe('John - Doe');
    });

    it('should exclude fields from label when excludeFromLabel is provided', () => {
      const value = { name: 'John', surname: 'Doe', id: '1' };
      expect(getFieldLabel(value, false, ['name', 'surname'], ['surname'], 'id')).toBe('John');
    });

    it('should return idKey value when all fields are empty', () => {
      const value = { name: '', surname: '', id: '1' };
      expect(getFieldLabel(value, false, ['name', 'surname'], [], 'id')).toBe('1');
    });

    it('should return idKey when nested property path resolves to undefined', () => {
      const value = { address: { city: 'Athens' }, id: '1' };
      expect(getFieldLabel(value, false, ['address.city'], [], 'id')).toBe('1');
    });

    it('should filter out empty field values before joining', () => {
      const value = { name: 'John', surname: '', id: '1' };
      expect(getFieldLabel(value, false, ['name', 'surname'], [], 'id')).toBe('John');
    });

    it('should handle missing fields gracefully', () => {
      const value = { name: 'John', id: '1' };
      expect(getFieldLabel(value, false, ['name', 'missing'], [], 'id')).toBe('John');
    });

    it('should handle empty fields array', () => {
      const value = { name: 'John', id: '1' };
      expect(getFieldLabel(value, false, [], [], 'id')).toBe('1');
    });
  });

  describe('getFieldValue', () => {
    it('should return raw value from jsonpath when isFlat is true', () => {
      const entity = { id: '123', name: 'John' };
      expect(getFieldValue(true, entity, 'id', undefined, undefined, undefined)).toBe('123');
    });

    it('should return object with idKey when isFlat is false', () => {
      const entity = { id: '123', name: 'John' };
      const result = getFieldValue(false, entity, 'id', undefined, undefined, undefined);
      expect(result).toEqual({ id: '123' });
    });

    it('should use idKeyAs for key name when provided', () => {
      const entity = { id: '123', name: 'John' };
      const result = getFieldValue(false, entity, 'id', undefined, 'entityId', undefined);
      expect(result).toEqual({ entityId: '123' });
    });

    it('should include entityFields in result when provided', () => {
      const entity = { id: '123', name: 'John', surname: 'Doe' };
      const result = getFieldValue(false, entity, 'id', ['name', 'surname'], undefined, undefined);
      expect(result).toEqual({ id: '123', name: 'John', surname: 'Doe' });
    });

    it('should use fieldKeyAs for field property names when provided', () => {
      const entity = { id: '123', name: 'John' };
      const result = getFieldValue(false, entity, 'id', ['name'], undefined, 'fieldName');
      expect(result).toEqual({ id: '123', fieldName: 'John' });
    });

    it('should handle nested paths in entityIdKey', () => {
      const entity = { inner: { id: '456' }, name: 'John' };
      expect(getFieldValue(true, entity, 'inner.id', undefined, undefined, undefined)).toBe('456');
    });

    it('should handle nested paths in entityFields', () => {
      const entity = { id: '123', address: { city: 'Athens' } };
      const result = getFieldValue(false, entity, 'id', ['address.city'], undefined, undefined);
      expect(result).toEqual({ id: '123', city: 'Athens' });
    });

    it('should handle empty entityFields array', () => {
      const entity = { id: '123', name: 'John' };
      const result = getFieldValue(false, entity, 'id', [], undefined, undefined);
      expect(result).toEqual({ id: '123' });
    });

    it('should handle undefined entityFields', () => {
      const entity = { id: '123', name: 'John' };
      const result = getFieldValue(false, entity, 'id', undefined, undefined, undefined);
      expect(result).toEqual({ id: '123' });
    });
  });

  describe('getRawValue', () => {
    it('should return value as is when isFlat is true', () => {
      expect(getRawValue(true, 'test', 'id')).toBe('test');
      expect(getRawValue(true, 123, 'id')).toBe(123);
    });

    it('should return value from jsonpath when isFlat is false', () => {
      const value = { id: '456', name: 'John' };
      expect(getRawValue(false, value, 'id')).toBe('456');
    });

    it('should return empty string when value is falsy and isFlat is false', () => {
      expect(getRawValue(false, null, 'id')).toBe('');
      expect(getRawValue(false, undefined, 'id')).toBe('');
    });

    it('should handle nested path in entityIdKey', () => {
      const value = { inner: { id: '789' } };
      expect(getRawValue(false, value, 'inner.id')).toBe('789');
    });
  });

  describe('getLinkRoute', () => {
    it('should return undefined when url is empty', () => {
      expect(getLinkRoute('someId', null, '', 'value')).toBeUndefined();
    });

    it('should return undefined when value has no value', () => {
      expect(getLinkRoute('someId', null, '/page/{id}', undefined)).toBeUndefined();
      expect(getLinkRoute('someId', null, '/page/{id}', null)).toBeUndefined();
    });

    it('should return undefined when url does not have all params', () => {
      expect(getLinkRoute('someId', null, '/page/{id}/detail/{detail}', 'value')).toBeUndefined();
    });

    it('should return undefined when id is in INVALID_REDIRECT_IDS', () => {
      expect(getLinkRoute('PaymentSegment', null, '/page/{id}', 'value')).toBeUndefined();
      expect(getLinkRoute('PartyDetails', null, '/page/{id}', 'value')).toBeUndefined();
      expect(getLinkRoute('Attachment', null, '/page/{id}', 'value')).toBeUndefined();
    });

    it('should return url with entitySource when entitySource is true', () => {
      const result = getLinkRoute('someId', true, '', 'value123');
      expect(result).toEqual({
        url: '/page/someId/value123',
        replacements: [],
      });
    });

    it('should return undefined when redirectUrl contains unresolved params', () => {
      const result = getLinkRoute('someId', false, '/redirect/{id}', 'value123');
      expect(result).toBeUndefined();
    });

    it('should return url with redirectUrl when entitySource is false and url has no params', () => {
      const result = getLinkRoute('someId', false, '/redirect', 'value123');
      expect(result).toEqual({
        url: '/redirect/value123',
        replacements: [],
      });
    });

    it('should return undefined for valid id but missing redirectUrl and entitySource', () => {
      expect(getLinkRoute('someId', false, '', 'value')).toBeUndefined();
    });
  });

  describe('widgetHasValue', () => {
    it('should return false when selectedValue is empty object with all falsy values', () => {
      expect(widgetHasValue({ a: '', b: null }, false, 'id', false)).toBe(false);
      expect(widgetHasValue({ a: 0, b: false }, false, 'id', false)).toBe(false);
    });

    it('should return false when selectedValue is falsy', () => {
      expect(widgetHasValue(null, false, 'id', false)).toBe(false);
      expect(widgetHasValue(undefined, false, 'id', false)).toBe(false);
      expect(widgetHasValue('', false, 'id', false)).toBe(false);
    });

    it('should return true when isFlat is true and selectedValue is truthy', () => {
      expect(widgetHasValue('value', true, 'id', false)).toBe(true);
      expect(widgetHasValue(123, true, 'id', false)).toBe(true);
    });

    it('should return false for empty object even when isFlat is true', () => {
      expect(widgetHasValue({}, true, 'id', false)).toBe(false);
    });

    it('should return false when isFlat is true and selectedValue is falsy', () => {
      expect(widgetHasValue('', true, 'id', false)).toBe(false);
      expect(widgetHasValue(null, true, 'id', false)).toBe(false);
    });

    it('should return false when entityIdKey is missing and multiple is false', () => {
      expect(widgetHasValue({ name: 'John' }, false, 'id', false)).toBe(false);
    });

    it('should return true when entityIdKey exists and multiple is false', () => {
      expect(widgetHasValue({ id: '123', name: 'John' }, false, 'id', false)).toBe(true);
    });

    it('should return false when selectedValue has no length and multiple is true', () => {
      expect(widgetHasValue({}, false, 'id', true)).toBe(false);
    });

    it('should return true when selectedValue is array with items and multiple is true', () => {
      expect(widgetHasValue([{ id: '1' }], false, 'id', true)).toBe(true);
    });

    it('should return true when selectedValue is non-empty object with truthy values', () => {
      expect(widgetHasValue({ id: '123' }, false, 'id', false)).toBe(true);
    });
  });
});
