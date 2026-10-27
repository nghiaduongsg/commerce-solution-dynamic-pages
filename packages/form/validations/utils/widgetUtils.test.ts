import {
  getWidgetArrayPosition,
  getWidgetArrayParentId,
  getWidgetPropertyId,
  getContextValue,
  createCodelistKey,
  setFieldValue,
  deleteObjProp,
  getJsonPathFromWidgetId,
  hasValidValue,
  getFormIdFromWidgetId,
  getObjectFromJsonQueryPath,
  isParent,
  isValidWidgetId,
  getAccessibilityErrorProps,
  getWidgetImmediateParentId,
  getWidgetIdFromJsonPath,
  getFinalJsonPath,
  getTranslationParts,
  extractKeyArrayFromErrors,
  compareValues,
  getWidgetNameFromWidgetId,
  getFinalValidateFromStructure,
  getDebounceDelay,
  getWidgetSize,
} from './widgetUtils';
import { AnyType } from '@pkg-common/types';
import { hasValue } from '@pkg-common/utils';
import { hasValidDate } from './dateValidationUtils';
import { ValidateFromSchema } from '@pkg-form/types';
import { FILTER_FORM_DEBOUNCE_MS } from '@pkg-constants/formCommon';

describe('widget Utils Validations', () => {
  describe('isValidWidgetId', () => {
    it('should return false on falsy/undefined/null id', () => {
      expect(isValidWidgetId(undefined)).toEqual(false);
    });
    it('should return false when id contains -9', () => {
      expect(isValidWidgetId('Party_-9_code')).toEqual(false);
    });
    it('should return false when id contains -8987', () => {
      expect(isValidWidgetId('Party_-8987_code')).toEqual(false);
    });
    it('should return false when id contains -8987', () => {
      expect(isValidWidgetId('Party_22_identifiers_-19_code')).toEqual(false);
    });
    it('should return false when id contains the word undefined', () => {
      expect(isValidWidgetId('Party_undefined_9')).toEqual(false);
    });
    it('should true when id contains 0', () => {
      expect(isValidWidgetId('Party_0_code')).toEqual(true);
    });

    it('should true when id contains 15', () => {
      expect(isValidWidgetId('Party_15_code')).toEqual(true);
    });
  });

  describe('getAccessibilityErrorProps', () => {
    it('should return aria-invalid:false if valid', () => {
      expect(getAccessibilityErrorProps('testId', false)).toEqual({
        'aria-invalid': false,
      });
    });
    it('should return aria-invalid:true if invalid', () => {
      expect(getAccessibilityErrorProps('testId', true)).toEqual({
        'aria-invalid': true,
        'aria-errormessage': 'testId-error-container',
      });
    });
  });

  describe('getWidgetIdFromJsonPath', () => {
    it('should return the formId with the final json path', () => {
      expect(getWidgetIdFromJsonPath('formId', 'widgetId', ['json', 'test_path'])).toEqual(
        'formId_json_test_path',
      );
    });
  });

  describe('getFormIdFromWidgetId', () => {
    it('should return form id from widget id', () => {
      expect(getFormIdFromWidgetId('FORMID_labels')).toEqual('FORMID');
    });
    it('should return the form id when the string contains only the form id itself', () => {
      expect(getFormIdFromWidgetId('FORMID')).toEqual('FORMID');
    });
    it('should return empty string when widget id is not valid', () => {
      expect(getFormIdFromWidgetId('')).toEqual('');
    });
  });

  describe('getWidgetNameFromWidgetId', () => {
    it('should return form id from widget id', () => {
      expect(getWidgetNameFromWidgetId('FORMID_labels')).toEqual('labels');
    });
    it('should return the form id when the string contains only the form id itself', () => {
      expect(getWidgetNameFromWidgetId('FORMID')).toEqual('FORMID');
    });
    it('should return empty string when widget id is not valid', () => {
      expect(getWidgetNameFromWidgetId('')).toEqual('');
    });
  });

  describe('isValidWidgetId', () => {
    it('should return false when id contains -9', () => {
      expect(isValidWidgetId('Party_-9_code')).toEqual(false);
    });

    it('should return false when id contains -8987', () => {
      expect(isValidWidgetId('Party_-8987_code')).toEqual(false);
    });

    it('should return false when id contains -8987', () => {
      expect(isValidWidgetId('Party_22_identifiers_-19_code')).toEqual(false);
    });

    it('should true when id contains 0', () => {
      expect(isValidWidgetId('Party_0_code')).toEqual(true);
    });

    it('should true when id contains 15', () => {
      expect(isValidWidgetId('Party_15_code')).toEqual(true);
    });
  });

  describe('getJsonPathFromWidgetId', () => {
    it('should return json path (level 1) based on widget id', () => {
      expect(getJsonPathFromWidgetId('FORMID_labels')).toEqual(['labels']);
    });

    it('should return json path (level 2) based on widget id', () => {
      expect(getJsonPathFromWidgetId('FORMID_labels_25')).toEqual(['labels', '[25]']);
    });

    it('should return json path (level 3) based on widget id', () => {
      expect(getJsonPathFromWidgetId('FORMID_labels_25_description')).toEqual([
        'labels',
        '[25]',
        'description',
      ]);
    });

    it('should return json path (level 4) based on widget id', () => {
      expect(getJsonPathFromWidgetId('FORMID_labels_25_description_5_text')).toEqual([
        'labels',
        '[25]',
        'description',
        '[5]',
        'text',
      ]);
    });

    it('should return json path (more levels) based on widget id', () => {
      expect(getJsonPathFromWidgetId('FORMID_labels_25_description_5_text_id')).toEqual([
        'labels',
        '[25]',
        'description',
        '[5]',
        'text',
        'id',
      ]);
    });

    it('should return json path (more levels) based on widget id, without brackets', () => {
      expect(getJsonPathFromWidgetId('FORMID_labels_25_description_5_text_id', false)).toEqual([
        'labels',
        '25',
        'description',
        '5',
        'text',
        'id',
      ]);
    });
  });

  describe('getWidgetArrayPosition', () => {
    it('should return widget array position', () => {
      expect(getWidgetArrayPosition('Field_3_id')).toBe('3');
    });
    it('should return undefined array position when no number exists', () => {
      expect(getWidgetArrayPosition('Field_id')).toBe(undefined);
    });
  });

  describe('getContextValue', () => {
    it('should return value from the data', () => {
      const widgetId = 'Parties_identifiers_1_identifierTypeCL';
      const source = {
        jsonPath: ['identifiers', 'INDEX_PARAM', 'identifierTypeCL'],
      } as AnyType;

      const formData = {
        identifiers: [{ identifierTypeCL: 'test1' }, { identifierTypeCL: 'test2' }],
      };
      expect(getContextValue(widgetId, formData, source)).toBe('test2');
    });

    it('should return undefined if no json path was given', () => {
      const widgetId = 'Parties_identifiers_1_identifierTypeCL';
      const source = {
        jsonPath: null,
      } as AnyType;

      const formData = {
        identifiers: [{ identifierTypo: 'test1' }, { identifierTypo: 'test2' }],
      };
      expect(getContextValue(widgetId, formData, source)).toBe(undefined);
    });
  });

  it('should return widget parent name', () => {
    expect(getWidgetArrayParentId('Field_3_id')).toBe('Field');
  });

  it('should return widget property name', () => {
    expect(getWidgetPropertyId('Field_3_id')).toBe('id');
  });

  describe('createCodelistKey', () => {
    it('should return code if queries is undefined', () => {
      const code = 'code';
      expect(createCodelistKey(code, undefined)).toBe(code);
    });

    it('should return code if queries is not an object', () => {
      const code = 'code';
      const queries = 'queries';
      expect(createCodelistKey(code, queries)).toBe(code);
    });

    it('should return code if queries is an empty object', () => {
      const code = 'code';
      const queries = 'queries';
      expect(createCodelistKey(code, queries)).toBe(code);
    });

    it('should return code and queries combined as a key', () => {
      const code = 'code';
      const queries = {
        revenueTypeCode: 'RTRT00',
        effectiveDate: '2021-06-18',
      };
      const expected = `${code}|${JSON.stringify(queries)}`;
      expect(createCodelistKey(code, queries)).toBe(expected);
    });
  });

  describe('setFieldValue', () => {
    it('should return formData with changed value', () => {
      const widgetId =
        'RevenueCalendars_revenuePeriods_0_revenuePeriodActions_0_obligationActionCL';

      const formData = {
        code: 'Income Tax',
        labels: [
          { languageCL: 'EN', description: 'Income Tax' },
          { languageCL: 'EL', description: 'Φόρος Εισοδήματος' },
        ],
        frequencyCL: 'YEARLY',
        obligationActionsCL: ['FILING'],
        revenuePeriods: [
          {
            startDate: '2021-01-01',
            endDate: '2021-12-31',
            revenuePeriodActions: [
              {
                id: 'ccfe1736-688c-452c-a19a-829e1e7c1cd0',
                obligationActionCL: 'FILING',
                fromDate: '2022-06-01',
                dueDate: '2022-07-22',
                graceDate: null,
              },
            ],
          },
        ],
        ownerCL: 'DEMO',
      };

      const value = 'some value';

      const expected = {
        code: 'Income Tax',
        labels: [
          { languageCL: 'EN', description: 'Income Tax' },
          { languageCL: 'EL', description: 'Φόρος Εισοδήματος' },
        ],
        frequencyCL: 'YEARLY',
        obligationActionsCL: ['FILING'],
        revenuePeriods: [
          {
            startDate: '2021-01-01',
            endDate: '2021-12-31',
            revenuePeriodActions: [
              {
                id: 'ccfe1736-688c-452c-a19a-829e1e7c1cd0',
                obligationActionCL: value,
                fromDate: '2022-06-01',
                dueDate: '2022-07-22',
                graceDate: null,
              },
            ],
          },
        ],
        ownerCL: 'DEMO',
      };

      const result = setFieldValue(widgetId, formData, value);

      expect(result).toEqual(expected);
    });

    it('should return formData if value is missing or is undefined', () => {
      const widgetId =
        'RevenueCalendars_revenuePeriods_0_revenuePeriodActions_0_obligationActionCL';

      const formData = {
        code: 'Income Tax',
        labels: [
          { languageCL: 'EN', description: 'Income Tax' },
          { languageCL: 'EL', description: 'Φόρος Εισοδήματος' },
        ],
        frequencyCL: 'YEARLY',
        obligationActionsCL: ['FILING'],
        revenuePeriods: [
          {
            startDate: '2021-01-01',
            endDate: '2021-12-31',
            revenuePeriodActions: [
              {
                id: 'ccfe1736-688c-452c-a19a-829e1e7c1cd0',
                obligationActionCL: 'FILING',
                fromDate: '2022-06-01',
                dueDate: '2022-07-22',
                graceDate: null,
              },
            ],
          },
        ],
        ownerCL: 'DEMO',
      };

      const result = setFieldValue(widgetId, formData, undefined);
      expect(result).toEqual(formData);
    });
  });

  describe('deleteObjProp', () => {
    it('should return formData without the omitted property', () => {
      const widgetId =
        'RevenueCalendars_revenuePeriods_0_revenuePeriodActions_0_obligationActionCL';

      const formData = {
        code: 'Income Tax',
        labels: [
          { languageCL: 'EN', description: 'Income Tax' },
          { languageCL: 'EL', description: 'Φόρος Εισοδήματος' },
        ],
        frequencyCL: 'YEARLY',
        obligationActionsCL: ['FILING'],
        revenuePeriods: [
          {
            startDate: '2021-01-01',
            endDate: '2021-12-31',
            revenuePeriodActions: [
              {
                id: 'ccfe1736-688c-452c-a19a-829e1e7c1cd0',
                obligationActionCL: 'FILING',
                fromDate: '2022-06-01',
                dueDate: '2022-07-22',
                graceDate: null,
              },
            ],
          },
        ],
        ownerCL: 'DEMO',
      };

      const jsonPath = [
        'revenuePeriods',
        'INDEX_PARAM',
        'revenuePeriodActions',
        'INDEX_PARAM',
        'fromDate',
      ];

      const expected = {
        code: 'Income Tax',
        labels: [
          { languageCL: 'EN', description: 'Income Tax' },
          { languageCL: 'EL', description: 'Φόρος Εισοδήματος' },
        ],
        frequencyCL: 'YEARLY',
        obligationActionsCL: ['FILING'],
        revenuePeriods: [
          {
            startDate: '2021-01-01',
            endDate: '2021-12-31',
            revenuePeriodActions: [
              {
                id: 'ccfe1736-688c-452c-a19a-829e1e7c1cd0',
                obligationActionCL: 'FILING',
                dueDate: '2022-07-22',
                graceDate: null,
              },
            ],
          },
        ],
        ownerCL: 'DEMO',
      };

      const result = deleteObjProp(widgetId, formData, jsonPath);
      expect(result).toEqual(expected);
    });

    it('should return formData if jsonPath is missing or is empty', () => {
      const widgetId =
        'RevenueCalendars_revenuePeriods_0_revenuePeriodActions_0_obligationActionCL';

      const formData = {
        code: 'Income Tax',
        labels: [
          { languageCL: 'EN', description: 'Income Tax' },
          { languageCL: 'EL', description: 'Φόρος Εισοδήματος' },
        ],
        frequencyCL: 'YEARLY',
        obligationActionsCL: ['FILING'],
        revenuePeriods: [
          {
            startDate: '2021-01-01',
            endDate: '2021-12-31',
            revenuePeriodActions: [
              {
                id: 'ccfe1736-688c-452c-a19a-829e1e7c1cd0',
                obligationActionCL: 'FILING',
                fromDate: '2022-06-01',
                dueDate: '2022-07-22',
                graceDate: null,
              },
            ],
          },
        ],
        ownerCL: 'DEMO',
      };

      const jsonPath = [];
      const result = deleteObjProp(widgetId, formData, jsonPath);
      expect(result).toEqual(formData);
    });
  });

  describe('hasValidValue', () => {
    it('should return true if type is date & value is valid date', () => {
      const type = 'date';
      const value = '2021-06-21';
      expect(hasValidValue(type, value)).toBe(true);
    });
    it('should return false if type is date & value is invalid date', () => {
      const type = 'date';
      const value = 'invalid date';
      expect(hasValidValue(type, value)).toBe(false);
    });
    it('should return true if type exists, but no value and returnFalsyValues', () => {
      expect(hasValidValue('date', null)).toBe(true);
    });
    it('should handle results with mocks', () => {
      jest
        .spyOn({ hasValidDate }, 'hasValidDate')
        .mockImplementation((val) => val === 'valid-date');
      jest
        .spyOn({ hasValue }, 'hasValue')
        .mockImplementation((val) => val !== null && val !== undefined && val !== '');

      expect(hasValidValue('date', 'valid-date')).toBe(false);
      expect(hasValidValue('string', '')).toBe(false);
      expect(hasValidValue('number', 123)).toBe(true);
      jest.restoreAllMocks();
    });
  });

  describe('getObjectFromJsonQueryPath', () => {
    it('should return json object from query path when value is simple string', () => {
      const expected = {
        individual: { birthDate: '12-02-2010' },
      };
      expect(getObjectFromJsonQueryPath(['individual', 'birthDate'], '12-02-2010')).toEqual(
        expected,
      );
    });

    it('should return json object from query path when value is number', () => {
      const expected = {
        individual: { age: 42 },
      };
      expect(getObjectFromJsonQueryPath(['individual', 'age'], 42)).toEqual(expected);
    });

    it('should return json object from query path when value is boolean', () => {
      const expected = {
        individual: { employed: false },
      };
      expect(getObjectFromJsonQueryPath(['individual', 'employed'], false)).toEqual(expected);
    });

    it('should return json object from query path when value is array', () => {
      const value = ['a', 'b', 'c'];
      const expected = {
        individual: { names: value },
      };
      expect(getObjectFromJsonQueryPath(['individual', 'names'], value)).toEqual(expected);
    });

    it('should return json object from query path when value is array of different types', () => {
      const value = [
        'a',
        100,
        { prop1: 'prop1', prop2: [1, 2, 3], prop3: { other: 'other' }, is: false },
        ['one', 'two', { three: 'three' }],
      ];
      const expected = {
        individual: {
          names: value,
        },
      };
      expect(getObjectFromJsonQueryPath(['individual', 'names'], value)).toEqual(expected);
    });

    it('should return json object from query path when value is another object', () => {
      const value = {
        names: [
          'a',
          100,
          { prop1: 'prop1', prop2: [1, 2, 3], prop3: { other: 'other' } },
          ['one', 'two', { three: 'three' }],
        ],
        documents: ['a', 'b', 'c'],
        address: {
          city: 'city',
          number: 50,
          road: 'road',
          code: 78654,
        },
      };
      const expected = {
        individual: {
          personal: { info: value },
        },
      };
      expect(getObjectFromJsonQueryPath(['individual', 'personal', 'info'], value)).toEqual(
        expected,
      );
    });

    it('should return json object from query path when value only part of an array (1 level)', () => {
      const expected = {
        individual: {
          names: [{ legal: 'a' }],
        },
      };
      expect(getObjectFromJsonQueryPath(['individual', 'names', '[', 'legal'], 'a')).toEqual(
        expected,
      );
    });

    it('should return json object from query path when value only part of an array (2 levels)', () => {
      const expected = {
        individual: {
          names: [{ legal: [{ code: 'a' }] }],
        },
      };
      expect(
        getObjectFromJsonQueryPath(['individual', 'names', '[', 'legal', '[', 'code'], 'a'),
      ).toEqual(expected);
    });

    it('should return json object from query path when value only part of an array (3 levels)', () => {
      const expected = {
        individual: {
          names: [{ legal: [{ codes: ['a', 'b', 'c'] }] }],
        },
      };
      expect(
        getObjectFromJsonQueryPath(
          ['individual', 'names', '[', 'legal', '[', 'codes'],
          ['a', 'b', 'c'],
        ),
      ).toEqual(expected);
    });

    it('should return json object from query path when value only part of an array (4 levels)', () => {
      const expected = {
        individual: {
          names: [{ legal: [{ codes: { test: 'a' } }] }],
        },
      };
      expect(
        getObjectFromJsonQueryPath(
          ['individual', 'names', '[', 'legal', '[', 'codes', 'test'],
          'a',
        ),
      ).toEqual(expected);
    });

    it('should return json object from query path when value only part of an array (4 levels)', () => {
      const expected = {
        individual: {
          names: [{ legal: [{ codes: { test: [{ a: { b: { c: 'a' } } }] } }] }],
        },
      };
      expect(
        getObjectFromJsonQueryPath(
          ['individual', 'names', '[', 'legal', '[', 'codes', 'test', '[', 'a', 'b', 'c'],
          'a',
        ),
      ).toEqual(expected);
    });
  });

  describe('isParent', () => {
    it('should return true if parentId is exactly the first part of the childId ', () => {
      expect(isParent('FormId_array_1_labels', 'FormId_array_1')).toBe(true);
    });

    it('should return true if parentId is not exactly the first part of the childId ', () => {
      expect(isParent('FormId_array_11_labels', 'FormId_array_1')).toBe(false);
    });

    it('should return true if parentId is not exactly the first part of the childId ', () => {
      expect(isParent('x', 'FormId_array_1')).toBe(false);
    });

    it('should return true if parentId is not exactly the first part of the childId ', () => {
      expect(isParent('field_prop1_0_A', 'field')).toBe(true);
    });
    it('should return true if parentIq and childId are strictly equal', () => {
      expect(isParent('field', 'field')).toEqual(true);
    });
    it('should return startsWith value when an error occurs in try block', () => {
      const originalSplit = String.prototype.split;
      String.prototype.split = jest.fn(() => {
        throw new Error('Split error');
      });
      const result = isParent('parent_child', 'parent');
      expect(result).toBe(true);
      String.prototype.split = originalSplit;
    });
  });

  describe('getWidgetImmediateParentId', () => {
    it('should retrieve first part of the parameter', () => {
      expect(getWidgetImmediateParentId('test_parentTest')).toEqual('test');
    });
  });

  describe('getFinalJsonPath', () => {
    it('should reverse property path with marked index positions', () => {
      expect(
        getFinalJsonPath('testWidgetId_split', ['INDEX_PARAM', 'testJsonPath'], true, true),
      ).toEqual(['[testWidgetId]', 'testJsonPath']);
    });
    it('should reverse property path without marked index positions', () => {
      expect(
        getFinalJsonPath('testWidgetId_split', ['INDEX_PARAM', 'testJsonPath'], false, true),
      ).toEqual(['testWidgetId', 'testJsonPath']);
    });
    it('should reverse property path without marked index positions & without reverse', () => {
      expect(getFinalJsonPath('testWidgetId_split', ['INDEX_PARAM', 'testJsonPath'])).toEqual([
        'split',
        'testJsonPath',
      ]);
    });
  });

  describe('getTranslationParts', () => {
    it('should return an object with msg key when text is not Array', () => {
      expect(getTranslationParts('testTranslationText')).toEqual({ msg: 'testTranslationText' });
    });
    it('should split string on #', () => {
      expect(getTranslationParts('text#translation')).toEqual({ msg: 'text', options: {} });
    });
    it('should return first part of the text array with empty options object', () => {
      expect(getTranslationParts(['testArrTranslation', 'testOptions'])).toEqual({
        msg: 'testArrTranslation',
        options: {},
      });
    });
  });

  describe('extractKeyArrayFromErrors', () => {
    it('should extract unique lowercase keys from specified position, filtering out undefined values', () => {
      const errorsArray = {
        'USER.name.required': ['Name is required'],
        'user.email.invalid': ['Email is invalid'],
        'ADMIN.role.invalid': ['Role is invalid'],
        short: ['Error without separator'],
        'user.age.required': ['Age is required'],
        'GUEST.profile.missing': [],
      };
      const separator = '.';
      const elementPosition = 0;
      const result = extractKeyArrayFromErrors(errorsArray, separator, elementPosition);

      expect(result).toEqual(expect.arrayContaining(['user', 'admin', 'short']));
      expect(result).toHaveLength(3);
      expect(result).not.toContain(undefined);
      expect(result.every((item) => item === item.toLowerCase())).toBe(true);
    });
  });

  describe('compareValues', () => {
    it('should return true when propertyNumberEquality is false', () => {
      expect(compareValues({ current: 'testValueRef' }, ['values', 'array'])).toEqual(true);
    });
    it('should return false when propertyNumberEquality is true', () => {
      expect(compareValues('"testValueRef"', '"testValueArray"', true)).toEqual(false);
    });
  });

  describe('getFinalValidateFromStructure', () => {
    it('should return the array structure as is', () => {
      const input = [
        {
          attribute: 'minValue',
          source: {
            code: 'Party',
            jsonPath: ['startDate'],
          },
        },
        {
          attribute: 'maxValue',
          source: {
            code: 'Party',
            jsonPath: ['endDate'],
          },
        },
      ] as Array<ValidateFromSchema>;
      expect(getFinalValidateFromStructure(input)).toEqual(input);
    });

    it('should convert to array', () => {
      const input = {
        attribute: 'minValue',
        source: {
          code: 'Party',
          jsonPath: ['startDate'],
        },
      } as ValidateFromSchema;
      expect(getFinalValidateFromStructure(input)).toEqual([input]);
    });

    it('should return empty array', () => {
      const input = undefined;
      expect(getFinalValidateFromStructure(input)).toEqual([]);
    });
  });

  describe('getDebounceDelay', () => {
    it('should return FILTER_FORM_DEBOUNCE_MS ', () => {
      expect(getDebounceDelay(true)).toEqual(FILTER_FORM_DEBOUNCE_MS);
    });

    it('should return 200 if multiline ', () => {
      expect(getDebounceDelay(false, true)).toEqual(200);
    });

    it('should return 600 if other ', () => {
      expect(getDebounceDelay(false, false)).toEqual(600);
    });
  });

  describe('getWidgetSize', () => {
    it('should return configuration for XS ', () => {
      expect(getWidgetSize('xs')).toEqual({ width: '50%' });
    });

    it('should return configuration for SM ', () => {
      expect(getWidgetSize('sm')).toEqual({ width: '70%' });
    });

    it('should return configuration for MD ', () => {
      expect(getWidgetSize('md')).toEqual({
        minWidth: '267px',
        width: 'fit-content',
        maxWidth: '100%',
      });
    });

    it('should return configuration for LG ', () => {
      expect(getWidgetSize('lg')).toEqual({
        minWidth: '500px',
        width: 'fit-content',
        maxWidth: '100%',
      });
    });

    it('should return configuration for XL ', () => {
      expect(getWidgetSize('xl')).toEqual({
        minWidth: '550px',
        width: 'fit-content',
        maxWidth: '100%',
      });
    });

    it('should return configuration for LG ', () => {
      expect(getWidgetSize('md', true)).toEqual({ width: '100%' });
    });
  });
});
