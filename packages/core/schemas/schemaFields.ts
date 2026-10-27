import cloneDeep from 'lodash/cloneDeep';

// Widget IDs use '_' to delimit paths. These helpers preserve arbitrary API keys
// without colliding with nested paths or each other.
export const camelKey = (key: string) =>
  key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
export const valueKey = (key: string) =>
  'field' +
  Array.from(key)
    .map((c) => c.codePointAt(0)!.toString(16).padStart(6, '0'))
    .join('');
export const originalValueKey = (key: string) =>
  key.startsWith('field') && /^([0-9a-f]{6})+$/.test(key.slice(5))
    ? (key.slice(5).match(/.{6}/g) || [])
        .map((code) => String.fromCodePoint(parseInt(code, 16)))
        .join('')
    : key;

export type SchemaSource = {
  url: string;
  selector: string;
  target: string[];
  fieldsPath: string[];
  keyEncoding?: 'widget';
  mapping: { key: string; label: string; type: string; required: string; validation: string };
};
export const pathValue = (data: any, path: string[]) =>
  path.reduce((value, key) => value?.[key], data);

/** Merge a declaratively selected field definition into independent form/detail schemas. */
export function applySchemaSource(schema: any, uiSchema: any, source: SchemaSource, response: any) {
  const nextSchema = cloneDeep(schema);
  const nextUiSchema = cloneDeep(uiSchema);
  const fields = pathValue(response, source.fieldsPath);
  if (!Array.isArray(fields))
    throw new Error('Schema source must return a field definition array.');
  let targetSchema = nextSchema;
  let targetUi = nextUiSchema;
  for (const key of source.target) {
    targetSchema.properties ||= {};
    targetSchema.properties[key] ||= { type: 'object', properties: {} };
    targetSchema = targetSchema.properties[key];
    targetUi[key] ||= {};
    targetUi = targetUi[key];
  }
  targetSchema.type = 'object';
  targetSchema.properties = {};
  targetSchema.required = [];
  const names: string[] = [];
  for (const field of fields) {
    const name = field[source.mapping.key];
    if (typeof name !== 'string' || !name)
      throw new Error('Schema fields require a non-empty key.');
    const key = source.keyEncoding === 'widget' ? valueKey(name) : name;
    if (names.includes(key)) throw new Error('Schema source contains duplicate field keys.');
    names.push(key);
    const type = field[source.mapping.type] === 'float' ? 'number' : field[source.mapping.type];
    if (!['string', 'number', 'integer', 'boolean'].includes(type))
      throw new Error('Unsupported schema field type.');
    const label = field[source.mapping.label] || name;
    const required = !!field[source.mapping.required];
    const rules = field[source.mapping.validation] || {};
    const minLength = rules.minLength ?? rules.min_length;
    const maxLength = rules.maxLength ?? rules.max_length;
    const definition: any = { type, title: label };
    if (type === 'string')
      Object.assign(definition, { minLength, maxLength, pattern: rules.regex });
    if (type === 'number' || type === 'integer')
      Object.assign(definition, { minimum: rules.min, maximum: rules.max });
    if (rules.enum?.length) definition.enum = rules.enum;
    if (type === 'boolean' && !definition.enum) definition.default = false;
    targetSchema.properties[key] = definition;
    if (required) targetSchema.required.push(key);
    targetUi[key] = {
      'ui:widget': definition.enum
        ? 'DropDownWidget'
        : type === 'boolean'
          ? 'CheckboxWidget'
          : 'TextWidget',
      'ui:options': {
        fullWidth: true,
        translation: { key: label },
        validations: {
          required,
          minLength,
          maxLength,
          regex: rules.regex,
          minValue: rules.min,
          maxValue: rules.max,
        },
      },
      ...(type === 'boolean' && !definition.enum && !nextUiSchema['ui:disabled']
        ? { 'ui:value': false }
        : {}),
    };
  }
  targetUi['ui:groups'] = [{ key: 'customFields', type: 'Default', widgets: names }];
  return { schema: nextSchema, uiSchema: nextUiSchema };
}
