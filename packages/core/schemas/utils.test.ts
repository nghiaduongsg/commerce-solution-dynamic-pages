import {
  attachObjectAccessGroups,
  attachAttachments,
  attachLogs,
  attachHistory,
} from '../schemas/utils';
import { AnyType, ApiValuesSchema } from '@pkg-common/types';

describe('schema attachment utilities', () => {
  describe('attachObjectAccessGroups', () => {
    it('returns objectAccessGroups schema with correct key', () => {
      const result = attachObjectAccessGroups('id', 'Party', '/party');

      expect(result.key).toBe('objectAccessGroups');
      expect(result.schema).toBeDefined();
      expect(result.uiSchema).toBeDefined();
    });

    it('injects entity into API values and visibility rules', () => {
      const result = attachObjectAccessGroups('id', 'Party', '/party');

      const apiValues =
        result.uiSchema.objectAccessGroupsTable['ui:options'].dependency.configuration.apiValues;

      expect(apiValues.url).toContain('object-access-group-included-entity');
      expect(apiValues.replacements[0].source.code).toBe('Party');

      const visibilityField = result.visibilityFrom.fields[0];
      expect(visibilityField.source.code).toBe('Entities');
    });
  });

  describe('attachAttachments', () => {
    it('returns attachments schema with correct key', () => {
      const result = attachAttachments('id', 'Asset', '/asset');

      expect(result.key).toBe('attachments');
      expect(result.schema).toBeDefined();
      expect(result.uiSchema).toBeDefined();
    });

    it('injects entity into attachment ui options', () => {
      const result = attachAttachments('id', 'Asset', '/asset');

      const options = result.uiSchema.attachmentDetails['ui:options'];

      expect(options.entity).toBe('Asset');
      expect(options.baseUrl).toBe('document-management/attachments');
      expect(options.permissionKey).toContain('attachments/upload');
    });
  });

  describe('attachLogs', () => {
    it('returns logs schema with correct key', () => {
      const result = attachLogs('id', 'Party', '/party');

      expect(result.key).toBe('logs');
      expect(result.schema).toBeDefined();
      expect(result.uiSchema).toBeDefined();
    });

    it('injects entityIdKey into log API replacements', () => {
      const result = attachLogs('entityId', 'Party', '/party');

      const replacements =
        result.uiSchema.logs['ui:options'].dependency.configuration.apiValues.replacements;

      expect(replacements[0].source.jsonPath).toEqual(['entityId']);
    });

    it('uses entity name in log API url', () => {
      const result = attachLogs('id', 'Party', '/party');

      const url = result.uiSchema.logs['ui:options'].dependency.configuration.apiValues.url;

      expect(url).toContain('objectType=Party');
    });
  });

  describe('attachHistory', () => {
    const schema = {
      type: 'object',
      properties: {
        identificationLabel: {
          type: ['string', 'null'],
        },
        text: {
          type: 'string',
        },
      },
    };

    const uiSchema = {
      'ui:page': {
        url: 'registration/parties',
        idKey: 'id',
        id: 'Party',
        customFieldsKey: 'partyDataArea',
        subTypeKey: 'partyTypeCode',
        permissionKey: 'PAGE/registration/parties/VIEW',
        back: {
          url: '/page/Party/list',
        },
        labelKey: 'identificationLabel',
      },
      disabledFrom: {
        fields: [
          {
            key: 'id',
            source: {
              type: 'API_DATA',
              code: 'Party',
              jsonPath: ['id'],
            },
          },
        ],
      },
      callApis: [
        {
          url: 'registration/parties/{partyId}',
          replacements: [
            {
              key: '{partyId}',
              source: {
                type: 'ROUTER',
                code: 'idKey',
              },
            },
          ],
          queryFrom: [
            {
              key: 'validOnDate',
              defaultValue: '__TODAY__',
            },
          ],
          initiateClone: 'History',
          resourceToEntity: 'Party',
          resourceId: 'Party',
          refreshFromButtons: ['buttonPress'],
        },
        {
          url: 'registration/party-types/{partyTypeId}',
          replacements: [
            {
              key: '{partyTypeId}',
              source: {
                code: 'Party',
                jsonPath: ['partyTypeCode'],
              },
            },
          ],
          resourceId: 'PartyType',
        },
        {
          url: 'reference-data/codelists?codeListCodes=COUNTRIES,IDENTIFIER_TYPES,PARTY_STATES,NAME_TYPES,CONTACT_TYPES,GENDERS,ADDRESS_TYPES,ADDRESS_SEQUENCES,PARTY_CONTACT_LABELS,PARTY_ADDITIONAL_INFO_TYPES,PARTY_CLASSIFICATION_TYPES,PARTY_PREFERENCE_TYPES,VALID_PAYMENT_METHODS',
          saveAs: 'CODELISTS',
        },
        {
          url: 'registration/name-standards/dropdown',
          resourceId: 'NAME_STANDARD',
          saveAs: 'CODELIST',
        },
      ],
      'ui:labels': {
        namespace: 'parties',
      },
      sidePanelInfo: [{}, {}],
      historyExtraValues: {
        schema: {
          type: 'object',
          properties: {
            extraProperty: {
              type: 'string',
            },
          },
        },
        uiSchema: {
          'ui:labels': {
            namespace: 'something',
          },
          extraProperty: {
            'ui:widget': 'a-widget',
          },
        },
      },
    };

    const uiSchemaToday = {
      'ui:page': {
        url: 'registration/parties',
        idKey: 'id',
        id: 'Party',
        customFieldsKey: 'partyDataArea',
        subTypeKey: 'partyTypeCode',
        permissionKey: 'PAGE/registration/parties/VIEW',
        back: {
          url: '/page/Party/list',
        },
        labelKey: 'identificationLabel',
      },

      callApis: [
        {
          url: 'registration/parties/{partyId}',
          replacements: [
            {
              key: '{partyId}',
              source: {
                type: 'ROUTER',
                code: 'idKey',
              },
            },
          ],

          initiateClone: 'Other',
          resourceToEntity: 'Party',
          resourceId: 'Party',
          refreshFromButtons: ['buttonPress'],
        },
        {
          url: 'registration/party-types/{partyTypeId}',
          replacements: [
            {
              key: '{partyTypeId}',
              source: {
                code: 'Party',
                jsonPath: ['partyTypeCode'],
              },
            },
          ],
          resourceId: 'PartyType',
        },
        {
          url: 'reference-data/codelists?codeListCodes=COUNTRIES,IDENTIFIER_TYPES,PARTY_STATES,NAME_TYPES,CONTACT_TYPES,GENDERS,ADDRESS_TYPES,ADDRESS_SEQUENCES,PARTY_CONTACT_LABELS,PARTY_ADDITIONAL_INFO_TYPES,PARTY_CLASSIFICATION_TYPES,PARTY_PREFERENCE_TYPES,VALID_PAYMENT_METHODS',
          saveAs: 'CODELISTS',
        },
        {
          url: 'registration/name-standards/dropdown',
          resourceId: 'NAME_STANDARD',
          saveAs: 'CODELIST',
        },
      ],
      'ui:labels': {
        namespace: 'parties',
      },
      sidePanelInfo: [{}, {}],
    };

    it('returns History view', () => {
      const result = attachHistory(
        schema,
        uiSchema,
        'Party',
        uiSchema.callApis as Array<ApiValuesSchema>,
      ) as AnyType;

      expect(result.key).toEqual('History');

      result.uiSchema.callApis.forEach((api) => {
        expect(api.resourceId).toBe('History');
        expect(api.resourceToEntity).toBe('History');
        expect(api.initiateClone).toBeUndefined();
      });

      expect(result.uiSchema.callApis[0].queryFrom[0].key).toBe('validOnDate');
      expect(result.type).toBe('History');
      expect(result.uiSchema.sidePanelInfo).toBeUndefined();
      expect(result.uiSchema.historyExtraValues).toBeUndefined();
      expect(result.uiSchema['ui:labels']).toEqual({
        namespace: 'something',
      });
      expect(result.uiSchema['extraProperty']).toEqual({
        'ui:widget': 'a-widget',
      });

      expect(result.schema).toEqual({
        type: 'object',
        properties: {
          identificationLabel: {
            type: ['string', 'null'],
          },
          text: {
            type: 'string',
          },
          extraProperty: {
            type: 'string',
          },
        },
      });
    });

    it('returns Today view', () => {
      const result = attachHistory(
        schema,
        uiSchemaToday,
        'Party',
        uiSchemaToday.callApis as Array<ApiValuesSchema>,
      ) as AnyType;

      expect(result.key).toEqual('Other');

      result.uiSchema.callApis.forEach((api) => {
        expect(api.resourceId).toBe('Other');
        expect(api.resourceToEntity).toBe('Other');
        expect(api.initiateClone).toBe('Other');
        expect(api.queryFrom).toEqual([
          {
            key: 'validOnDate',
            defaultValue: '__TODAY__',
          },
        ]);
      });

      expect(result.uiSchema.callApis[0].queryFrom[0].key).toBe('validOnDate');
      expect(result.type).toBe('Other');
      expect(result.uiSchema.disabledFrom).toEqual({
        fields: [
          {
            key: 'id',
            source: {
              type: 'API_DATA',
              code: 'Other',
              jsonPath: ['id'],
            },
          },
        ],
      });

      expect(result.schema).toEqual(schema);
    });

    it('sets ui:mainButton.enabled to true when ui:mainButton.enabled is undefined', () => {
      const uiSchemaWithoutMainButtonEnabled = {
        ...uiSchemaToday,
        'ui:mainButton': {
          label: 'Some label',
        },
      };

      const result = attachHistory(
        schema,
        uiSchemaWithoutMainButtonEnabled,
        'Other',
        uiSchemaWithoutMainButtonEnabled.callApis as Array<ApiValuesSchema>,
      ) as AnyType;

      expect(result.uiSchema['ui:mainButton']).toBeDefined();
      expect(result.uiSchema['ui:mainButton'].enabled).toBe(true);
    });
  });
});
