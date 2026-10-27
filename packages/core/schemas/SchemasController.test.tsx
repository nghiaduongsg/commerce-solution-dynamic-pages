import React from 'react';
import { render, waitFor } from '@testing-library/react';
import axios from 'axios';
import SchemasController, { getStaticSchemas } from './SchemasController';
import { DETAIL_FORM, SEARCH_FORM, SINGLE_RECORD_FORM } from '@pkg-constants/screenTypeIds';

const mockSetApiData = jest.fn();
let mockType = '';
jest.mock('@pkg-core/apiData/hooks/useApiDataState', () => ({
  __esModule: true,
  default: () => ({ setApiData: mockSetApiData }),
}));
jest.mock('@pkg-setup/src/system/useSystem', () => ({
  __esModule: true,
  default: () => ({ useStaticSchemas: true, apiUrl: '/api/v1' }),
}));
jest.mock('@pkg-entity/hooks/useFormField', () => ({
  __esModule: true,
  default: () => ({ value: mockType }),
}));
jest.mock('axios');

const bundle = (field: string) => ({
  configuration: { tableId: 'Product' },
  schema: { type: 'object', properties: { query: { type: 'string' } } },
  uiSchema: { 'ui:labels': { namespace: 'products' } },
  pageSchema: { type: 'object', properties: { [field]: { type: 'string' } } },
  pageUiSchema: {
    'ui:page': { id: 'Product', idKey: 'id', url: 'products', subTypeKey: 'productTypeId' },
    callApis: [],
  },
});
beforeEach(() => {
  jest.clearAllMocks();
  mockType = '';
  window['FALLBACK_SCHEMAS'] = {
    Product: bundle('productTypeId'),
    Product_type1: bundle('customValue'),
  };
});
test('selects the search, form and subtype entries from the static contract', () => {
  expect(getStaticSchemas('Product', SEARCH_FORM, '').schema.properties).toHaveProperty('query');
  expect(getStaticSchemas('Product', SINGLE_RECORD_FORM, '').schema.properties).toHaveProperty(
    'productTypeId',
  );
  expect(getStaticSchemas('Product', SINGLE_RECORD_FORM, 'type1').schema.properties).toHaveProperty(
    'customValue',
  );
});
test('switches static form subtypes without contacting the remote schema service', async () => {
  const ready = jest.fn();
  const component = () => (
    <SchemasController pageId="Product" screenType={SINGLE_RECORD_FORM} onSchemasReady={ready}>
      <div>Form</div>
    </SchemasController>
  );
  const { rerender } = render(component());
  await waitFor(() => expect(ready).toHaveBeenCalled());
  mockType = 'type1';
  rerender(component());
  await waitFor(() =>
    expect(ready.mock.calls.at(-1)![0].schema.properties).toHaveProperty('customValue'),
  );
  expect(axios.get).not.toHaveBeenCalled();
  expect(mockSetApiData).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'Product_SINGLE_RECORD_FORM_type1_SCHEMAS' }),
  );
});

test('resolves independent declarative views without changing their JSON declarations', () => {
  const registry = {
    Product: {
      views: {
        list: {
          schema: { properties: { query: {} } },
          uiSchema: { tableId: 'Products', 'ui:filters': { query: { 'ui:widget': 'TextWidget' } } },
        },
        form: {
          schema: { properties: { editable: {} } },
          uiSchema: {
            'ui:page': { id: 'Product' },
            callApis: [
              {
                url: 'products/{id}',
                resourceId: 'Product',
                replacements: [{ key: '{id}', source: { type: 'ROUTER', code: 'idKey' } }],
              },
            ],
          },
        },
        detail: {
          schema: { properties: { summary: {} } },
          uiSchema: {
            'ui:page': { id: 'Product' },
            'ui:disabled': true,
            'ui:mainButton': { enabled: false },
          },
        },
      },
    },
  };
  const before = JSON.stringify(registry);
  expect(getStaticSchemas('Product', SEARCH_FORM, '', registry).listSchema.tableId).toBe(
    'Products',
  );
  expect(getStaticSchemas('Product', SEARCH_FORM, '', registry).uiSchema.query['ui:widget']).toBe(
    'TextWidget',
  );
  expect(
    getStaticSchemas('Product', SINGLE_RECORD_FORM, '', registry).schema.properties,
  ).toHaveProperty('editable');
  const detail = getStaticSchemas('Product', DETAIL_FORM, '', registry);
  expect(detail.schema.properties).toHaveProperty('summary');
  expect(detail.schema.properties).not.toHaveProperty('editable');
  expect(detail.uiSchema['ui:disabled']).toBe(true);
  expect(JSON.stringify(registry)).toBe(before);
});
