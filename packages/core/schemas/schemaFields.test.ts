import { applySchemaSource, SchemaSource, originalValueKey, valueKey } from './schemaFields';
const source: SchemaSource = {
  url: 'types/{value}',
  selector: 'typeId',
  target: ['values'],
  fieldsPath: ['fields'],
  keyEncoding: 'widget',
  mapping: {
    key: 'key',
    label: 'label',
    type: 'dataType',
    required: 'required',
    validation: 'validation',
  },
};
test('generates native typed widgets without mutating the declared schemas', () => {
  const schema = { type: 'object', properties: { values: { type: 'object', properties: {} } } };
  const ui = { values: { 'ui:options': { visible: true } } };
  const result = applySchemaSource(schema, ui, source, {
    fields: [
      {
        key: 'unit_cost',
        label: 'Unit cost',
        dataType: 'float',
        required: true,
        validation: { min: 0, max: 5 },
      },
      { key: 'is_active', label: 'Active', dataType: 'boolean', required: true },
      { key: 'size', label: 'Size', dataType: 'string', validation: { enum: ['S', 'M'] } },
    ],
  });
  const price = valueKey('unit_cost');
  expect(result.schema.properties.values.properties[price]).toMatchObject({
    type: 'number',
    minimum: 0,
    maximum: 5,
  });
  expect(result.schema.properties.values.required).toContain(price);
  expect(result.uiSchema.values[price]['ui:options'].validations).toMatchObject({
    required: true,
    minValue: 0,
  });
  expect(result.uiSchema.values[valueKey('is_active')]['ui:widget']).toBe('CheckboxWidget');
  expect(result.uiSchema.values[valueKey('size')]['ui:widget']).toBe('DropDownWidget');
  expect(schema.properties.values.properties).toEqual({});
  expect(ui.values).not.toHaveProperty(price);
  expect(originalValueKey(valueKey('item_name'))).toBe('item_name');
  expect(valueKey('item_name')).not.toBe(valueKey('itemName'));
});
test('keeps detail schemas read-only without inserting draft defaults', () => {
  const result = applySchemaSource(
    { type: 'object', properties: {} },
    { 'ui:disabled': true },
    source,
    { fields: [{ key: 'enabled', dataType: 'boolean' }] },
  );
  expect(result.uiSchema['ui:disabled']).toBe(true);
  expect(result.uiSchema.values[valueKey('enabled')]).not.toHaveProperty('ui:value');
});
test('rejects invalid definitions instead of silently producing incomplete forms', () => {
  expect(() => applySchemaSource({}, {}, source, {})).toThrow('field definition array');
  expect(() =>
    applySchemaSource({}, {}, source, { fields: [{ key: 'x', dataType: 'unknown' }] }),
  ).toThrow('Unsupported');
  expect(() =>
    applySchemaSource({}, {}, source, {
      fields: [
        { key: 'x', dataType: 'string' },
        { key: 'x', dataType: 'string' },
      ],
    }),
  ).toThrow('duplicate');
});
