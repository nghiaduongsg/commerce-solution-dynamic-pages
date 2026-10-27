# Declarative pages

Static registries can declare independent views:

```ts
const pages = {
  Example: {
    views: {
      list: { schema: listJsonSchema, uiSchema: listUiJsonSchema },
      form: { schema: formJsonSchema, uiSchema: formUiJsonSchema },
      detail: { schema: detailJsonSchema, uiSchema: detailUiJsonSchema },
    },
  },
};
```

Each imported document can be a plain JSON file. `list.schema` describes filters;
`list.uiSchema` declares the table configuration and embeds the filter UI under
`ui:filters`. Form and detail documents declare their own fields, groups, API
resources and actions. The resolver clones declarations before attaching runtime
behavior. Legacy `configuration`, `schema`, `uiSchema`, `pageSchema` and
`pageUiSchema` registries retain their existing behavior.

For the new registry, `/page/Example/list` selects the list, `/page/Example`
selects the create form, `/page/Example/id` selects the detail, and
`/page/Example/id/edit` selects the edit form. Hosts register those route patterns
against `DynamicPage`. Declare read-only detail fields with `ui:disabled: true`
and disable the main button; detail actions can link to the edit form.

## Field definitions supplied by an API

A form or detail UI document can declare sources that share one selector:

```json
{
  "ui:schemaSources": [{
    "url": "types/{value}",
    "selector": "typeId",
    "target": ["values"],
    "fieldsPath": ["fields"],
    "keyEncoding": "widget",
    "mapping": {
      "key": "key", "label": "label", "type": "dataType",
      "required": "required", "validation": "validation"
    }
  }]
}
```

The library loads the selected definition, validates its field metadata and
creates native TextWidget, CheckboxWidget or DropDownWidget declarations. It
supports string, integer, number/float and boolean values, required fields,
string lengths/patterns, numeric ranges and enums. `keyEncoding: widget`
preserves arbitrary keys when widget IDs use underscores as path separators.
Wire-format adapters can import the matching key helpers from `core.schemas`.

Loading blocks interaction, source failures use the page's error layout, and
responses for abandoned selections are ignored. Detail mode does not insert
draft defaults. Applications do not generate or register subtype schemas.
