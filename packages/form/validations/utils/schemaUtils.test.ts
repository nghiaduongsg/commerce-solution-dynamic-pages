import { cloneDeep } from 'lodash';
import { getSchemas } from './schemaUtils';
import {
  expectedMockSchemaUtilsBankResult,
  expectedMockSchemaUtilsBankResultOverriddenOptions,
  expectedMockSchemaUtilsResult,
  mockedMaskedSchemaResult,
  mockMaskedBankElement,
  mockSchemaUtilsElements,
  mockSchemaUtilsSchema,
  mockSchemaUtilsUiSchema,
} from './schemaUtils.mock';

describe('transformSchemas', () => {
  const selectedLanguage = 'EN';
  const mainElementName = 'addressElementCL';
  let elements: typeof mockSchemaUtilsElements;
  let schema: typeof mockSchemaUtilsSchema;
  let uiSchema: typeof mockSchemaUtilsUiSchema;

  beforeEach(() => {
    elements = cloneDeep(mockSchemaUtilsElements);
    schema = cloneDeep(mockSchemaUtilsSchema);
    uiSchema = cloneDeep(mockSchemaUtilsUiSchema);
  });
  afterEach(() => jest.clearAllMocks());

  describe('transformSchemas - default ', () => {
    it('should return default schema if no elements are given', () => {
      const elements = [];
      const schema = { test: '123' };
      const uiSchema = { test: '456' };
      const mainElementName = '';
      const selectedLanguage = 'EN';
      expect(
        getSchemas(elements, schema, uiSchema, mainElementName, selectedLanguage),
      ).toStrictEqual({ schema, uiSchema });
    });
    it('should return correct schema, uiSchema', () => {
      expect(
        getSchemas(elements, schema, uiSchema, mainElementName, selectedLanguage),
      ).toStrictEqual(expectedMockSchemaUtilsResult);
    });
  });

  describe('transformBankAccountSchemas', () => {
    it('should return correct schema, uiSchema with bankElements true', () => {
      expect(
        getSchemas(elements, schema, uiSchema, mainElementName, selectedLanguage, true),
      ).toStrictEqual(expectedMockSchemaUtilsBankResult);
    });

    it('should return correct schema, uiSchema with bankElements & maskedOptions', () => {
      expect(
        getSchemas(
          [{ ...elements[0], ...mockMaskedBankElement }],
          schema,
          uiSchema,
          mainElementName,
          selectedLanguage,
          true,
        ),
      ).toStrictEqual(mockedMaskedSchemaResult);
    });
    it('should return correct schema, uiSchema with bankElements & overridden options', () => {
      const overriddenOptions = {
        clearFrom: {},
        columns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
      };

      const result = getSchemas(
        elements,
        schema,
        uiSchema,
        mainElementName,
        selectedLanguage,
        true,
        overriddenOptions,
      );
      expect(result).toStrictEqual(expectedMockSchemaUtilsBankResultOverriddenOptions);
    });
  });

  describe('transformSchemas (non-bank elements)', () => {
    const selectedLanguage = 'EN';
    const mainElementName = 'addressElementCL';

    it('applies overrideOptions columns/arrayColumns', () => {
      const overriddenOptions = {
        columns: { xs: 12, sm: 12, md: 3, lg: 3, xl: 3 },
        arrayColumns: { xs: 12, sm: 12, md: 3, lg: 3, xl: 3 },
        // include any other options you might pass through
        clearFrom: {},
      };

      const result = getSchemas(
        elements,
        schema,
        uiSchema,
        mainElementName,
        selectedLanguage,
        false,
        overriddenOptions,
      );

      // pick one known field key from your mock elements
      const firstFieldKey = elements[0][mainElementName].replace(/_/g, '').toLowerCase();
      const options = result.uiSchema[firstFieldKey]['ui:options'];

      expect(options.columns).toEqual(overriddenOptions.columns);
      expect(options.arrayColumns).toEqual(overriddenOptions.arrayColumns);
      // ensure other override options were merged
      expect(options.clearFrom).toEqual({});
    });

    it('uses default columns when overrideOptions is not provided', () => {
      const result = getSchemas(elements, schema, uiSchema, mainElementName, selectedLanguage);

      const firstFieldKey = elements[0][mainElementName].replace(/_/g, '').toLowerCase();
      const options = result.uiSchema[firstFieldKey]['ui:options'];

      expect(options.columns).toEqual({ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 });
      expect(options.arrayColumns).toEqual({ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 });
    });

    it('keeps defaults if overrideOptions has undefined columns', () => {
      const overriddenOptions = { columns: undefined, arrayColumns: undefined };

      const result = getSchemas(
        elements,
        schema,
        uiSchema,
        mainElementName,
        selectedLanguage,
        false,
        overriddenOptions,
      );

      const firstFieldKey = elements[0][mainElementName].replace(/_/g, '').toLowerCase();
      const options = result.uiSchema[firstFieldKey]['ui:options'];

      expect(options.columns).toEqual({ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 });
      expect(options.arrayColumns).toEqual({ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 });
    });
  });
});
