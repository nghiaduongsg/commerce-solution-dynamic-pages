import { CODELIST_TYPE, STRING_TYPE, ENTITY_TYPE, DATE_TYPE } from '@pkg-constants/formIds';
import sortBy from 'lodash/sortBy';
import { cloneDeep, isUndefined } from 'lodash';

const getSelectWidget = (code: string, options = {}) => {
  return {
    'ui:widget': 'SelectCodeListWidget',
    'ui:options': {
      ...options,
      apiValues: {
        url: `reference-data/codelists/${code}`,
        codeList: code,
        jsonPath: ['items'],
      },
    },
  };
};

const getMaskForTextWidget = (pattern: string, options = {}) => ({
  'ui:widget': 'TextWidget',
  'ui:options': {
    ...options,
    mask: { pattern, mode: 'accept' },
  },
});

const isWidgetRequired = (element) => {
  return !!(element?.requiredSw || element?.required);
};

const getWidgetValidations = (element) => {
  const validations = {};

  validations['required'] = isWidgetRequired(element);

  if (element?.dataLength && element?.dataLength > 0) {
    if (element?.dataTypeCL === 'STRING' && element?.visualizationPattern) {
      const separators = ' _-+';
      const countSeparators = [...element.visualizationPattern].filter((val) =>
        separators.includes(val),
      ).length;
      validations['maxLength'] = element.dataLength + countSeparators;
    } else {
      validations['maxLength'] = element.dataLength;
    }
  }

  if (element?.regexString && element?.regexString.length > 0) {
    validations['regex'] = element.regexString;
  }
  return validations;
};

const getColumnOptions = () => {
  return {
    xs: 12,
    sm: 12,
    md: 6,
    lg: 6,
    xl: 6,
  };
};

const getWidgetType = (element) => {
  const isRequired = isWidgetRequired(element);

  if (!element?.dataTypeCL) {
    return isRequired ? 'string' : ['string', 'null'];
  }

  if (element?.dataTypeCL === ENTITY_TYPE) {
    return isRequired ? 'object' : ['object', 'null'];
  }
  return [CODELIST_TYPE, STRING_TYPE, DATE_TYPE].includes(element?.dataTypeCL.toUpperCase())
    ? isRequired
      ? 'string'
      : ['string', 'null']
    : isRequired
      ? 'number'
      : ['number', 'null'];
};

export const transformSchemas = (
  elements,
  schema,
  uiSchema,
  selectedLanguage,
  mainElementName,
  overrideOptions,
) => {
  const newSchema = {
    ...schema,
    properties: { ...schema.properties },
  };
  const newUiSchema = { ...uiSchema };

  // Setting the address elements got
  for (const element of elements) {
    if (!element.omit) {
      const currentElementName = element[mainElementName].replace(/_/g, '').toLowerCase();

      newSchema.properties[currentElementName] = {
        title:
          element?.labels?.find((label) => label.languageCL === selectedLanguage)?.description ||
          '-',
        type: getWidgetType(element),
      };

      if (element.defaultValue) {
        newSchema.properties[currentElementName]['default'] = element.defaultValue;
      }

      // Base options
      const baseOptions = {
        columns: getColumnOptions(),
        arrayColumns: getColumnOptions(),
      };

      // Merge overrideOptions (if any), with columns/arrayColumns prioritized
      const mergedOptions = {
        ...baseOptions,
        ...(overrideOptions ?? {}),
        columns: overrideOptions?.columns ?? baseOptions.columns,
        arrayColumns: overrideOptions?.arrayColumns ?? baseOptions.arrayColumns,
      };

      newUiSchema[currentElementName] = {
        'ui:options': mergedOptions,
      };

      if (element.dataTypeCL && element.dataTypeCL.toUpperCase() === CODELIST_TYPE) {
        newUiSchema[currentElementName] = getSelectWidget(
          element.codelistCode,
          newUiSchema[currentElementName]['ui:options'],
        );

        if (element.filteredByAddressElementCL) {
          const relatedItem = elements.find(
            (el) => el[mainElementName] === element.filteredByAddressElementCL,
          );

          if (relatedItem) {
            newUiSchema[currentElementName] = {
              'ui:widget': 'CodeListTree',
              'ui:options': {
                ...mergedOptions,
                clearFrom: {
                  ...mergedOptions?.clearFrom,
                  fields: [
                    ...(mergedOptions?.clearFrom?.fields ?? []),
                    {
                      key: 'value2',
                      source: {
                        code: 'Address',
                        jsonPath: [relatedItem[mainElementName].toLowerCase()],
                      },
                    },
                  ],
                },
                visibilityFrom: {
                  fields: [
                    {
                      key: 'value',
                      source: {
                        code: 'Address',
                        jsonPath: [relatedItem[mainElementName].toLowerCase()],
                      },
                    },
                  ],
                },
                disableFirstLevel: true,
                openByDefault: true,
                apiValues: {
                  url: `reference-data/codelists/${relatedItem.codelistCode}/items/{itemCode}`,
                  codeList: `${relatedItem.codelistCode}`,
                  replacements: [
                    {
                      key: '{itemCode}',
                      source: {
                        code: 'Address',
                        jsonPath: [relatedItem[mainElementName].toLowerCase()],
                      },
                    },
                  ],
                },
              },
            };
          }
        }
      }

      // Adding validations
      const validations = getWidgetValidations(element);
      if (Object.keys(validations).length > 0) {
        newUiSchema[currentElementName]['ui:options']['validations'] = validations;
      }

      newUiSchema[currentElementName]['ui:disabled'] = element.displayOnly;
    }
  }

  return { schema: newSchema, uiSchema: newUiSchema };
};

export const transformBankAccountSchemas = (
  elements,
  schema,
  uiSchema,
  selectedLanguage,
  mainElementName,
  overrideOptions,
) => {
  const newSchema = cloneDeep(schema);
  const newUiSchema = cloneDeep(uiSchema);

  elements
    ?.filter((element) => !element.omit)
    .forEach((element, index) => {
      const currentElementName = `${mainElementName}${index + 1}`;

      const bankAccountProperties = {
        title:
          element?.labels?.find((label) => label.languageCL === selectedLanguage)?.description ||
          '-',
        type: getWidgetType(element),
      };

      newSchema.properties[currentElementName] = bankAccountProperties;

      // Construct uiSchema for the new field
      const elementUiSchema = {
        'ui:options': overrideOptions ?? {
          visibilityFrom: {
            operator: 'some',
            fields: [
              {
                key: 'formatCodeParty',
                source: {
                  code: 'Party',
                  jsonPath: ['bankAccounts', 'INDEX_PARAM', 'formatCode'],
                },
              },
              {
                key: 'formatCodePartyVersion',
                source: {
                  code: 'PartyVersion',
                  jsonPath: ['bankAccounts', 'INDEX_PARAM', 'formatCode'],
                },
              },
              {
                key: 'formatCodeOrgUnit',
                source: {
                  code: 'OrganizationalUnit',
                  jsonPath: ['bankAccounts', 'INDEX_PARAM', 'formatCode'],
                },
              },
            ],
          },
          clearFrom: {
            operator: 'some',
            fields: [
              {
                key: 'formatCodeParty',
                source: {
                  code: 'Party',
                  jsonPath: ['bankAccounts', 'INDEX_PARAM', 'formatCode'],
                },
              },
              {
                key: 'formatCodePartyVersion',
                source: {
                  code: 'PartyVersion',
                  jsonPath: ['bankAccounts', 'INDEX_PARAM', 'formatCode'],
                },
              },
              {
                key: 'formatCodeOrgUnit',
                source: {
                  code: 'OrganizationalUnit',
                  jsonPath: ['bankAccounts', 'INDEX_PARAM', 'formatCode'],
                },
              },
            ],
          },
          columns: {
            xs: 12,
            sm: 6,
            md: 6,
            lg: 6,
            xl: 6,
          },
        },
      };

      if (element.dataTypeCL === 'CODELIST') {
        const updatedOptions = getSelectWidget(element.codelistCode, elementUiSchema['ui:options']);
        Object.assign(elementUiSchema, updatedOptions);
      }
      if (element.dataTypeCL === 'STRING' && element.visualizationPattern) {
        const maskOptions = getMaskForTextWidget(
          element.visualizationPattern,
          elementUiSchema['ui:options'],
        );
        Object.assign(elementUiSchema, maskOptions);
      }

      elementUiSchema['ui:options']['columns'] = overrideOptions?.columns ?? getColumnOptions();

      elementUiSchema['ui:options']['arrayColumns'] =
        overrideOptions?.arrayColumns ?? getColumnOptions();

      const validations = getWidgetValidations(element);
      if (Object.keys(validations).length > 0) {
        elementUiSchema['ui:options']['validations'] = validations;
      }

      elementUiSchema['ui:disabled'] = element.displayOnly;

      if (element.defaultValue) {
        elementUiSchema['ui:value'] = element.defaultValue;
      }
      newUiSchema[currentElementName] = elementUiSchema;
    });

  return { schema: newSchema, uiSchema: newUiSchema };
};

export const getSchemas = (
  elements,
  schema,
  uiSchema,
  mainElement,
  language,
  bankElements = false,
  overrideOptions?,
) => {
  if (elements && elements.length > 0) {
    const elementsSorted = sortBy(elements, ['orderNumber']);

    if (elementsSorted.length > 0) {
      return bankElements
        ? transformBankAccountSchemas(
            elementsSorted,
            schema,
            uiSchema,
            language,
            mainElement,
            overrideOptions,
          )
        : transformSchemas(
            elementsSorted,
            schema,
            uiSchema,
            language,
            mainElement,
            overrideOptions,
          );
    }
  }

  return { schema, uiSchema };
};

export const keepSchemaProps = (schema, object) => {
  const copyObject = JSON.parse(JSON.stringify(object || {}));
  for (const prop of Object.keys(object)) {
    if (isUndefined(schema.properties[prop])) {
      delete copyObject[prop];
    }
  }
  return copyObject;
};

export const ViewModes = {
  Today: 'Today',
  History: 'History',
} as const;

export const HISTORY_ENTITY = ViewModes.History;
export const TODAY_ENTITY = ViewModes.Today;
