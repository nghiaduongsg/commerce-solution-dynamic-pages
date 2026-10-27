export const mockSchemaUtilsElements = [
  {
    addressElementCL: 'ADDRESS2',
    orderNumber: 1,
    required: false,
    codelistCode: null,
    filteredByAddressElementCL: null,
    defaultValue: null,
    displayOnly: false,
    dataTypeCL: 'STRING',
    dataLength: 10,
    labels: [
      {
        languageCL: 'EL',
        description: 'Αριθμός οδού',
      },
      {
        languageCL: 'EN',
        description: 'House number',
      },
    ],
  },
  {
    addressElementCL: 'ADDRESS1',
    orderNumber: 2,
    required: false,
    codelistCode: null,
    filteredByAddressElementCL: null,
    defaultValue: 'TESTVALUE',
    displayOnly: true,
    dataLength: 10,
    labels: [
      {
        languageCL: 'EL',
        description: 'Οδός',
      },
      {
        languageCL: 'EN',
        description: 'Street name',
      },
    ],
  },
  {
    addressElementCL: 'ADDRESS6',
    orderNumber: 4,
    required: false,
    codelistCode: 'PARTY_CONTACT_LABELS',
    filteredByAddressElementCL: null,
    defaultValue: null,
    displayOnly: false,
    dataTypeCL: 'CODELIST',
    dataLength: 20,
    labels: [
      {
        languageCL: 'EL',
        description: 'Επικοινωνία',
      },
      {
        languageCL: 'EN',
        description: 'Communication',
      },
    ],
  },
  {
    addressElementCL: 'ADDRESS5',
    orderNumber: 5,
    required: true,
    codelistCode: null,
    filteredByAddressElementCL: null,
    defaultValue: '1',
    displayOnly: false,
    dataTypeCL: 'NUMBER',
    dataLength: 1,
    labels: [
      {
        languageCL: 'EL',
        description: 'Τ.Κ.',
      },
      {
        languageCL: 'EN',
        description: 'Postal code',
      },
    ],
  },
  {
    addressElementCL: 'ADDRESS8',
    orderNumber: 6,
    required: false,
    codelistCode: 'CONTACT_TYPES',
    filteredByAddressElementCL: 'ADDRESS6',
    defaultValue: null,
    displayOnly: false,
    dataTypeCL: 'CODELIST',
    dataLength: 20,
    labels: [
      {
        languageCL: 'EL',
        description: 'Tοποθεσία',
      },
      {
        languageCL: 'EN',
        description: 'Locality',
      },
    ],
  },
];

export const mockSchemaUtilsSchema = {
  type: 'object',
  properties: {
    id: {
      title: 'Id',
      type: 'string',
    },
    countryCL: {
      title: 'Country',
      type: 'string',
    },
    latitude: {
      title: 'Latitude',
      type: 'number',
    },
    longitude: {
      title: 'Longitude',
      type: 'number',
    },
    address1: {
      title: 'Floor',
      type: 'string',
    },
    address2: {
      title: 'Apartment',
      type: 'string',
    },
    address3: {
      title: 'Building',
      type: 'number',
    },
    address4: {
      title: 'House number',
      type: 'string',
    },
    address5: {
      title: 'Street name',
      type: 'string',
    },
    address6: {
      title: 'Dependent locality',
      type: 'string',
    },
    address7: {
      title: 'Locality',
      type: 'string',
    },
    address8: {
      title: 'Postal code',
      type: 'string',
    },
  },
  definitions: {},
  dependencies: {},
};

export const mockSchemaUtilsUiSchema = {
  id: {
    'ui:widget': 'hidden',
    'ui:options': {
      translation: {
        key: 'id',
        namespace: 'address',
      },
    },
  },
  countryCL: {
    'ui:widget': 'SelectCodeListWidget',
    'ui:options': {
      apiValues: {
        url: 'reference-data/codelists/COUNTRIES',
        codeList: 'COUNTRIES',
        jsonPath: ['items'],
      },
      translation: {
        key: 'countryCL',
        namespace: 'address',
      },
    },
  },
  latitude: {
    'ui:options': {
      translation: {
        key: 'latitude',
        namespace: 'address',
      },
      arrayColumns: {
        xs: 6,
        sm: 6,
        md: 6,
        lg: 6,
      },
      columns: {
        xs: 6,
        sm: 6,
        md: 6,
        lg: 6,
      },
    },
  },
  longitude: {
    'ui:options': {
      translation: {
        key: 'longitude',
        namespace: 'address',
      },
      arrayColumns: {
        xs: 6,
        sm: 6,
        md: 6,
        lg: 6,
      },
      columns: {
        xs: 6,
        sm: 6,
        md: 6,
        lg: 6,
      },
    },
  },
};

export const expectedMockSchemaUtilsResult = {
  schema: {
    type: 'object',
    properties: {
      id: {
        title: 'Id',
        type: 'string',
      },
      countryCL: {
        title: 'Country',
        type: 'string',
      },
      latitude: {
        title: 'Latitude',
        type: 'number',
      },
      longitude: {
        title: 'Longitude',
        type: 'number',
      },
      address1: {
        default: 'TESTVALUE',
        title: 'Street name',
        type: ['string', 'null'],
      },
      address2: {
        title: 'House number',
        type: ['string', 'null'],
      },
      address3: {
        title: 'Building',
        type: 'number',
      },
      address4: {
        title: 'House number',
        type: 'string',
      },
      address5: {
        default: '1',
        title: 'Postal code',
        type: 'number',
      },
      address6: {
        title: 'Communication',
        type: ['string', 'null'],
      },
      address7: {
        title: 'Locality',
        type: 'string',
      },
      address8: {
        title: 'Locality',
        type: ['string', 'null'],
      },
    },
    definitions: {},
    dependencies: {},
  },
  uiSchema: {
    id: {
      'ui:widget': 'hidden',
      'ui:options': {
        translation: {
          key: 'id',
          namespace: 'address',
        },
      },
    },
    countryCL: {
      'ui:widget': 'SelectCodeListWidget',
      'ui:options': {
        apiValues: {
          url: 'reference-data/codelists/COUNTRIES',
          codeList: 'COUNTRIES',
          jsonPath: ['items'],
        },
        translation: {
          key: 'countryCL',
          namespace: 'address',
        },
      },
    },
    latitude: {
      'ui:options': {
        translation: {
          key: 'latitude',
          namespace: 'address',
        },
        arrayColumns: {
          xs: 6,
          sm: 6,
          md: 6,
          lg: 6,
        },
        columns: {
          xs: 6,
          sm: 6,
          md: 6,
          lg: 6,
        },
      },
    },
    longitude: {
      'ui:options': {
        translation: {
          key: 'longitude',
          namespace: 'address',
        },
        arrayColumns: {
          xs: 6,
          sm: 6,
          md: 6,
          lg: 6,
        },
        columns: {
          xs: 6,
          sm: 6,
          md: 6,
          lg: 6,
        },
      },
    },
    address2: {
      'ui:options': {
        validations: {
          required: false,
          maxLength: 10,
        },
        columns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
        arrayColumns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
      },
      'ui:disabled': false,
    },
    address1: {
      'ui:options': {
        validations: {
          maxLength: 10,
          required: false,
        },
        columns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
        arrayColumns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
      },
      'ui:disabled': true,
    },
    address6: {
      'ui:widget': 'SelectCodeListWidget',
      'ui:options': {
        apiValues: {
          url: 'reference-data/codelists/PARTY_CONTACT_LABELS',
          codeList: 'PARTY_CONTACT_LABELS',
          jsonPath: ['items'],
        },
        validations: {
          required: false,
          maxLength: 20,
        },
        columns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
        arrayColumns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
      },
      'ui:disabled': false,
    },
    address5: {
      'ui:options': {
        validations: {
          maxLength: 1,
          required: true,
        },
        columns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
        arrayColumns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
      },
      'ui:disabled': false,
    },
    address8: {
      'ui:widget': 'CodeListTree',
      'ui:options': {
        apiValues: {
          url: 'reference-data/codelists/PARTY_CONTACT_LABELS/items/{itemCode}',
          codeList: 'PARTY_CONTACT_LABELS',
          replacements: [
            {
              key: '{itemCode}',
              source: {
                code: 'Address',
                jsonPath: ['address6'],
              },
            },
          ],
        },
        clearFrom: {
          fields: [
            {
              key: 'value2',
              source: {
                code: 'Address',
                jsonPath: ['address6'],
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
                jsonPath: ['address6'],
              },
            },
          ],
        },
        disableFirstLevel: true,
        openByDefault: true,
        columns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
        arrayColumns: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        },
        validations: {
          required: false,
          maxLength: 20,
        },
      },
      'ui:disabled': false,
    },
  },
};

export const expectedMockSchemaUtilsBankResult = {
  schema: {
    type: 'object',
    definitions: {},
    dependencies: {},
    properties: {
      countryCL: { title: 'Country', type: 'string' },
      latitude: { title: 'Latitude', type: 'number' },
      longitude: { title: 'Longitude', type: 'number' },
      address1: { title: 'Floor', type: 'string' },
      address2: { title: 'Apartment', type: 'string' },
      address3: { title: 'Building', type: 'number' },
      address4: { title: 'House number', type: 'string' },
      address5: { title: 'Street name', type: 'string' },
      address6: { title: 'Dependent locality', type: 'string' },
      address7: { title: 'Locality', type: 'string' },
      address8: { title: 'Postal code', type: 'string' },
      addressElementCL1: { title: 'House number', type: ['string', 'null'] },
      addressElementCL2: { title: 'Street name', type: ['string', 'null'] },
      addressElementCL3: { title: 'Communication', type: ['string', 'null'] },
      addressElementCL4: { title: 'Postal code', type: 'number' },
      addressElementCL5: { title: 'Locality', type: ['string', 'null'] },
      id: {
        title: 'Id',
        type: 'string',
      },
    },
  },
  uiSchema: {
    addressElementCL1: {
      'ui:disabled': false,
      'ui:options': {
        arrayColumns: {
          lg: 6,
          md: 6,
          sm: 12,
          xl: 6,
          xs: 12,
        },
        clearFrom: {
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
          operator: 'some',
        },
        columns: {
          lg: 6,
          md: 6,
          sm: 12,
          xl: 6,
          xs: 12,
        },
        validations: {
          maxLength: 10,
          required: false,
        },
        visibilityFrom: {
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
          operator: 'some',
        },
      },
    },
    addressElementCL2: {
      'ui:disabled': true,
      'ui:options': {
        arrayColumns: {
          lg: 6,
          md: 6,
          sm: 12,
          xl: 6,
          xs: 12,
        },
        clearFrom: {
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
          operator: 'some',
        },
        columns: {
          lg: 6,
          md: 6,
          sm: 12,
          xl: 6,
          xs: 12,
        },
        validations: {
          maxLength: 10,
          required: false,
        },
        visibilityFrom: {
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
          operator: 'some',
        },
      },
      'ui:value': 'TESTVALUE',
    },
    addressElementCL3: {
      'ui:disabled': false,
      'ui:options': {
        apiValues: {
          codeList: 'PARTY_CONTACT_LABELS',
          jsonPath: ['items'],
          url: 'reference-data/codelists/PARTY_CONTACT_LABELS',
        },
        arrayColumns: {
          lg: 6,
          md: 6,
          sm: 12,
          xl: 6,
          xs: 12,
        },
        clearFrom: {
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
          operator: 'some',
        },
        columns: {
          lg: 6,
          md: 6,
          sm: 12,
          xl: 6,
          xs: 12,
        },
        validations: {
          maxLength: 20,
          required: false,
        },
        visibilityFrom: {
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
          operator: 'some',
        },
      },
      'ui:widget': 'SelectCodeListWidget',
    },
    addressElementCL4: {
      'ui:disabled': false,
      'ui:options': {
        arrayColumns: {
          lg: 6,
          md: 6,
          sm: 12,
          xl: 6,
          xs: 12,
        },
        clearFrom: {
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
          operator: 'some',
        },
        columns: {
          lg: 6,
          md: 6,
          sm: 12,
          xl: 6,
          xs: 12,
        },
        validations: {
          maxLength: 1,
          required: true,
        },
        visibilityFrom: {
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
          operator: 'some',
        },
      },
      'ui:value': '1',
    },
    addressElementCL5: {
      'ui:disabled': false,
      'ui:options': {
        apiValues: {
          codeList: 'CONTACT_TYPES',
          jsonPath: ['items'],
          url: 'reference-data/codelists/CONTACT_TYPES',
        },
        arrayColumns: {
          lg: 6,
          md: 6,
          sm: 12,
          xl: 6,
          xs: 12,
        },
        clearFrom: {
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
          operator: 'some',
        },
        columns: {
          lg: 6,
          md: 6,
          sm: 12,
          xl: 6,
          xs: 12,
        },
        validations: {
          maxLength: 20,
          required: false,
        },
        visibilityFrom: {
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
          operator: 'some',
        },
      },
      'ui:widget': 'SelectCodeListWidget',
    },
    countryCL: {
      'ui:options': {
        apiValues: {
          codeList: 'COUNTRIES',
          jsonPath: ['items'],
          url: 'reference-data/codelists/COUNTRIES',
        },
        translation: {
          key: 'countryCL',
          namespace: 'address',
        },
      },
      'ui:widget': 'SelectCodeListWidget',
    },
    id: {
      'ui:options': {
        translation: {
          key: 'id',
          namespace: 'address',
        },
      },
      'ui:widget': 'hidden',
    },
    latitude: {
      'ui:options': {
        arrayColumns: {
          lg: 6,
          md: 6,
          sm: 6,
          xs: 6,
        },
        columns: {
          lg: 6,
          md: 6,
          sm: 6,
          xs: 6,
        },
        translation: {
          key: 'latitude',
          namespace: 'address',
        },
      },
    },
    longitude: {
      'ui:options': {
        arrayColumns: {
          lg: 6,
          md: 6,
          sm: 6,
          xs: 6,
        },
        columns: {
          lg: 6,
          md: 6,
          sm: 6,
          xs: 6,
        },
        translation: {
          key: 'longitude',
          namespace: 'address',
        },
      },
    },
  },
};

export const expectedMockSchemaUtilsBankResultOverriddenOptions = {
  schema: {
    type: 'object',
    definitions: {},
    dependencies: {},
    properties: {
      id: { title: 'Id', type: 'string' },
      countryCL: { title: 'Country', type: 'string' },
      latitude: { title: 'Latitude', type: 'number' },
      longitude: { title: 'Longitude', type: 'number' },
      address1: { title: 'Floor', type: 'string' },
      address2: { title: 'Apartment', type: 'string' },
      address3: { title: 'Building', type: 'number' },
      address4: { title: 'House number', type: 'string' },
      address5: { title: 'Street name', type: 'string' },
      address6: { title: 'Dependent locality', type: 'string' },
      address7: { title: 'Locality', type: 'string' },
      address8: { title: 'Postal code', type: 'string' },
      addressElementCL1: { title: 'House number', type: ['string', 'null'] },
      addressElementCL2: { title: 'Street name', type: ['string', 'null'] },
      addressElementCL3: { title: 'Communication', type: ['string', 'null'] },
      addressElementCL4: { title: 'Postal code', type: 'number' },
      addressElementCL5: { title: 'Locality', type: ['string', 'null'] },
    },
  },

  uiSchema: {
    id: {
      'ui:widget': 'hidden',
      'ui:options': { translation: { key: 'id', namespace: 'address' } },
    },
    countryCL: {
      'ui:widget': 'SelectCodeListWidget',
      'ui:options': {
        apiValues: {
          url: 'reference-data/codelists/COUNTRIES',
          codeList: 'COUNTRIES',
          jsonPath: ['items'],
        },
        translation: { key: 'countryCL', namespace: 'address' },
      },
    },
    latitude: {
      'ui:options': {
        columns: { xs: 6, sm: 6, md: 6, lg: 6 },
        arrayColumns: { xs: 6, sm: 6, md: 6, lg: 6 },
        translation: { key: 'latitude', namespace: 'address' },
      },
    },
    longitude: {
      'ui:options': {
        columns: { xs: 6, sm: 6, md: 6, lg: 6 },
        arrayColumns: { xs: 6, sm: 6, md: 6, lg: 6 },
        translation: { key: 'longitude', namespace: 'address' },
      },
    },
    addressElementCL1: {
      'ui:disabled': false,
      'ui:options': {
        columns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        arrayColumns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        validations: { required: true, maxLength: 1 },
        clearFrom: {},
      },
    },
    addressElementCL2: {
      'ui:disabled': true,
      'ui:options': {
        columns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        arrayColumns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        validations: { required: true, maxLength: 1 },
        clearFrom: {},
      },
      'ui:value': 'TESTVALUE',
    },
    addressElementCL3: {
      'ui:disabled': false,
      'ui:widget': 'SelectCodeListWidget',
      'ui:options': {
        columns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        arrayColumns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        validations: { required: false, maxLength: 20 },
        clearFrom: {},
        apiValues: {
          url: 'reference-data/codelists/PARTY_CONTACT_LABELS',
          codeList: 'PARTY_CONTACT_LABELS',
          jsonPath: ['items'],
        },
      },
    },
    addressElementCL4: {
      'ui:disabled': false,
      'ui:options': {
        columns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        arrayColumns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        validations: { required: true, maxLength: 1 },
        clearFrom: {},
      },
      'ui:value': '1',
    },
    addressElementCL5: {
      'ui:disabled': false,
      'ui:widget': 'SelectCodeListWidget',
      'ui:options': {
        columns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        arrayColumns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        validations: { required: false, maxLength: 20 },
        clearFrom: {},
        apiValues: {
          url: 'reference-data/codelists/CONTACT_TYPES',
          codeList: 'CONTACT_TYPES',
          jsonPath: ['items'],
        },
      },
    },
  },
};

export const mockMaskedBankElement = {
  addressElementCL1: { title: 'House number', type: ['string', 'null'] },
  addressElementCL2: { title: 'Street name', type: ['string', 'null'] },
  addressElementCL3: { title: 'Communication', type: ['string', 'null'] },
  addressElementCL4: { title: 'Postal code', type: 'number' },
  addressElementCL5: { title: 'Locality', type: ['string', 'null'] },
  visualizationPattern: 'aa00 0000 0000',
  regexString: '^*',
};

export const mockedMaskedSchemaResult = {
  schema: {
    type: 'object',
    properties: {
      id: { title: 'Id', type: 'string' },
      countryCL: { title: 'Country', type: 'string' },
      latitude: { title: 'Latitude', type: 'number' },
      longitude: { title: 'Longitude', type: 'number' },
      address1: { title: 'Floor', type: 'string' },
      address2: { title: 'Apartment', type: 'string' },
      address3: { title: 'Building', type: 'number' },
      address4: { title: 'House number', type: 'string' },
      address5: { title: 'Street name', type: 'string' },
      address6: { title: 'Dependent locality', type: 'string' },
      address7: { title: 'Locality', type: 'string' },
      address8: { title: 'Postal code', type: 'string' },
      addressElementCL1: { title: 'House number', type: ['string', 'null'] },
    },
    definitions: {},
    dependencies: {},
  },
  uiSchema: {
    id: {
      'ui:widget': 'hidden',
      'ui:options': { translation: { key: 'id', namespace: 'address' } },
    },
    countryCL: {
      'ui:widget': 'SelectCodeListWidget',
      'ui:options': {
        apiValues: {
          url: 'reference-data/codelists/COUNTRIES',
          codeList: 'COUNTRIES',
          jsonPath: ['items'],
        },
        translation: { key: 'countryCL', namespace: 'address' },
      },
    },
    latitude: {
      'ui:options': {
        translation: { key: 'latitude', namespace: 'address' },
        columns: { xs: 6, sm: 6, md: 6, lg: 6 },
        arrayColumns: { xs: 6, sm: 6, md: 6, lg: 6 },
      },
    },
    longitude: {
      'ui:options': {
        translation: { key: 'longitude', namespace: 'address' },
        columns: { xs: 6, sm: 6, md: 6, lg: 6 },
        arrayColumns: { xs: 6, sm: 6, md: 6, lg: 6 },
      },
    },
    addressElementCL1: {
      'ui:widget': 'TextWidget',
      'ui:disabled': false,
      'ui:options': {
        visibilityFrom: {
          operator: 'some',
          fields: [
            {
              key: 'formatCodeParty',
              source: { code: 'Party', jsonPath: ['bankAccounts', 'INDEX_PARAM', 'formatCode'] },
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
              source: { code: 'Party', jsonPath: ['bankAccounts', 'INDEX_PARAM', 'formatCode'] },
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
        columns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        arrayColumns: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        validations: { required: false, maxLength: 12, regex: '^*' },
        mask: { pattern: 'aa00 0000 0000', mode: 'accept' },
      },
    },
  },
};
