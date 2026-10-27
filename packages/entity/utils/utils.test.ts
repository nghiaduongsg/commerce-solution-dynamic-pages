import {
  handlePayloadErrors,
  handlePayloadErrorsForToolkit,
  mergeSubSchemas,
  unwrapEntityDataArea,
  unwrapEntityDataAreaWithSkipKeys,
  wrapEntityDataArea,
  getTargetDataInForm,
  clearFormStepperFieldsOnly,
} from './utils';
import { EnqueueSnackbar } from '@pkg-common/notifier/reducers';
import { mockDate } from '@_jestHelpers/dateMock';
import { AppError } from '@pkg-common/types';

describe('util tests', () => {
  mockDate('mockDate');

  it('handlePayloadErrorsForToolkit should return one error', () => {
    const error: AppError = { message: 'error' };
    expect(handlePayloadErrorsForToolkit(error)).toEqual({
      key: 'mockDate',
      message: error.message,
      severity: 'error',
    });
  });

  it('handlePayloadErrorsForToolkit should return one error for all violations found', () => {
    const error: AppError = {
      message: 'error',
      violations: [
        {
          fieldName: '',
          message: 'a',
          rejectedValue: 'a',
        },
        {
          fieldName: '[]',
          message: 'b',
          rejectedValue: 'a',
        },
      ],
    };
    expect(handlePayloadErrorsForToolkit(error)).toEqual({
      key: 'mockDate',
      message: 'error \na \nb',
      severity: 'error',
    });
  });

  it('handlePayloadErrors should raise one Snackbar for generic message', () => {
    const error: AppError = { message: 'error' };
    expect(handlePayloadErrors(error)).toEqual([
      EnqueueSnackbar({
        key: 'mockDate',
        message: error.message,
        severity: 'error',
      }),
    ]);
  });

  it('handlePayloadErrors should raise Snackbars for each violation', () => {
    const error: AppError = {
      message: 'error',
      violations: [
        {
          fieldName: '',
          message: 'a',
          rejectedValue: 'a',
        },
        {
          fieldName: '[]',
          message: 'b',
          rejectedValue: 'a',
        },
      ],
    };
    expect(handlePayloadErrors(error)).toEqual([
      EnqueueSnackbar({
        key: 'mockDate',
        message: error.message,
        severity: 'error',
      }),
      EnqueueSnackbar({
        key: 'mockDate_0',
        message: 'a',
        severity: 'error',
      }),
      EnqueueSnackbar({
        key: 'mockDate_1',
        message: 'b',
        severity: 'error',
      }),
    ]);
  });

  describe('wrapEntityDataArea & unwrapEntityDataArea', () => {
    const entity = {
      name: 'A',
      surname: 'B',
      age: 15,
      gender: 'M',
      otherPersonalInfo: {
        birthDate: '15-06-1980',
        residence: 'FR',
        nationality: 'EL',
        __STATUS__: 'a',
        addressInfo: {
          addressName: 'xx',
          addressNumber: '45B',
          TK: '45673',
          __STATUS__: 'a',
          otherAddressInfo: {
            apartment: '45C',
            stairs: 'left',
            __STATUS__: 'a',
          },
        },
      },
      contactInfo: [
        { type: 'phone', value: '6789876544', active: true, __STATUS__: 'a' },
        { type: 'email', value: 'k@gmail.com', active: true, primary: true, __STATUS__: 'a' },
        { type: 'fax', value: '6789876544', active: false, primary: false, __STATUS__: 'a' },
      ],
    };
    const entityWithoutStatus = {
      name: 'A',
      surname: 'B',
      age: 15,
      gender: 'M',
      otherPersonalInfo: {
        birthDate: '15-06-1980',
        residence: 'FR',
        nationality: 'EL',
        addressInfo: {
          addressName: 'xx',
          addressNumber: '45B',
          TK: '45673',
          otherAddressInfo: {
            apartment: '45C',
            stairs: 'left',
          },
        },
      },
      contactInfo: [
        { type: 'phone', value: '6789876544', active: true },
        { type: 'email', value: 'k@gmail.com', active: true, primary: true },
        { type: 'fax', value: '6789876544', active: false, primary: false },
      ],
    };

    const entity2 = {
      name: 'A',
      surname: 'B',
      age: 15,
      gender: 'M',
      otherPersonalInfo: {
        birthDate: '15-06-1980',
        residence: 'FR',
        nationality: 'EL',
        __STATUS__: 'a',
        addressInfo: {
          addressName: 'xx',
          addressNumber: '45B',
          TK: '45673',
          __STATUS__: 'a',
          otherAddressInfo: {
            apartment: '45C',
            stairs: 'left',
            __STATUS__: 'a',
            info: [
              { garden: true, balcony: false, __STATUS__: 'a' },
              { garden: false, balcony: false, __STATUS__: 'a' },
            ],
          },
        },
      },
      contactInfo: [
        { type: 'phone', value: '6789876544', active: true, __STATUS__: 'a' },
        { type: 'email', value: 'k@gmail.com', active: true, primary: true, __STATUS__: 'a' },
        { type: 'fax', value: '6789876544', active: false, primary: false, __STATUS__: 'a' },
      ],
    };

    const entity2WithoutStatus = {
      name: 'A',
      surname: 'B',
      age: 15,
      gender: 'M',
      otherPersonalInfo: {
        birthDate: '15-06-1980',
        residence: 'FR',
        nationality: 'EL',
        addressInfo: {
          addressName: 'xx',
          addressNumber: '45B',
          TK: '45673',
          otherAddressInfo: {
            apartment: '45C',
            stairs: 'left',
            info: [
              { garden: true, balcony: false },
              { garden: false, balcony: false },
            ],
          },
        },
      },
      contactInfo: [
        { type: 'phone', value: '6789876544', active: true },
        { type: 'email', value: 'k@gmail.com', active: true, primary: true },
        { type: 'fax', value: '6789876544', active: false, primary: false },
      ],
    };

    const entity3 = {
      name: 'A',
      surname: 'B',
      age: 15,
      gender: 'M',
      otherPersonalInfo: {
        birthDate: '15-06-1980',
        residence: 'FR',
        nationality: 'EL',
        __STATUS__: 'a',
        addressInfo: {
          addressName: 'xx',
          addressNumber: '45B',
          TK: '45673',
          __STATUS__: 'a',
          otherAddressInfo: {
            apartment: '45C',
            stairs: 'left',
            __STATUS__: 'a',
            info: [
              {
                garden: true,
                balcony: false,
                __STATUS__: 'a',
                __ACTION__: 'add',
                __INDEX__: 0,
                __JSON_PATH__: 'b',
                __LEVEL__: 0,
              },
              {
                garden: false,
                balcony: false,
                __STATUS__: 'a',
                __ACTION__: 'add',
                __INDEX__: 1,
                __JSON_PATH__: 'b',
                __LEVEL__: 0,
              },
            ],
          },
        },
      },
      contactInfo: [
        {
          type: 'phone',
          value: '6789876544',
          active: true,
          __STATUS__: 'a',
          __ACTION__: 'add',
          __INDEX__: 0,
          __JSON_PATH__: 'b',
          __LEVEL__: 0,
        },
        {
          type: 'email',
          value: 'k@gmail.com',
          active: true,
          primary: true,
          __STATUS__: 'a',
          __ACTION__: 'edit',
          __INDEX__: 1,
          __JSON_PATH__: 'b',
          __LEVEL__: 1,
        },
        {
          type: 'fax',
          value: '6789876544',
          active: false,
          primary: false,
          __STATUS__: 'a',
          __ACTION__: 'add',
          __INDEX__: 2,
          __JSON_PATH__: 'b',
          __LEVEL__: 0,
        },
      ],
    };

    const entity3WithoutMetadata = {
      name: 'A',
      surname: 'B',
      age: 15,
      gender: 'M',
      otherPersonalInfo: {
        birthDate: '15-06-1980',
        residence: 'FR',
        nationality: 'EL',
        addressInfo: {
          addressName: 'xx',
          addressNumber: '45B',
          TK: '45673',
          otherAddressInfo: {
            apartment: '45C',
            stairs: 'left',
            info: [
              { garden: true, balcony: false },
              { garden: false, balcony: false },
            ],
          },
        },
      },
      contactInfo: [
        { type: 'phone', value: '6789876544', active: true },
        { type: 'email', value: 'k@gmail.com', active: true, primary: true },
        { type: 'fax', value: '6789876544', active: false, primary: false },
      ],
    };

    const entityDataAreaKey = 'formData';

    const uiSchema1 = {
      name: {},
      surname: {},
      age: {
        'ui:options': {
          formData: true,
        },
      },
      gender: {
        'ui:options': {
          formData: true,
        },
      },
      otherPersonalInfo: {
        'ui:options': {
          formData: true,
        },
        birthDate: {},
        residence: {},
        nationality: {},
        addressInfo: {
          addressName: {},
          addressNumber: {},
          TK: {},
          otherAddressInfo: {
            apartment: {},
            stairs: {},
          },
        },
      },
      contactInfo: {
        'ui:options': {
          formData: true,
        },
        items: {
          type: {},
          value: {},
          primary: {},
          active: {},
        },
      },
    };

    const uiSchema2 = {
      name: {},
      surname: {},
      age: {
        'ui:options': {
          formData: true,
        },
      },
      gender: {
        'ui:options': {
          formData: true,
        },
      },
      otherPersonalInfo: {
        customFieldsKey: 'personalInfo',
        'ui:options': {
          personalInfo: true,
        },
        birthDate: {},
        residence: {},
        nationality: {},
        addressInfo: {
          addressName: {},
          addressNumber: {},
          TK: {},
          otherAddressInfo: {
            apartment: {},
            stairs: {},
          },
        },
      },
      contactInfo: {
        customFieldsKey: 'contactInfoModel',
        'ui:options': {
          contactInfoModel: true,
        },
        items: {
          type: {},
          value: {},
          primary: {},
          active: {},
        },
      },
    };

    const uiSchema3 = {
      name: {},
      surname: {},
      age: {
        'ui:options': {
          formData: true,
        },
      },
      gender: {
        'ui:options': {
          formData: true,
        },
      },
      otherPersonalInfo: {
        customFieldsKey: 'other',
        'ui:options': {
          other: true,
        },
        birthDate: {},
        residence: {},
        nationality: {},
        addressInfo: {
          addressName: {},
          addressNumber: {},
          TK: {},
          otherAddressInfo: {
            apartment: {},
            stairs: {},
          },
        },
      },
      contactInfo: {
        customFieldsKey: 'other',
        'ui:options': {
          other: true,
        },
        items: {
          type: {},
          value: {},
          primary: {},
          active: {},
        },
      },
    };

    const uiSchema4 = {
      name: {},
      surname: {},
      age: {
        'ui:options': {
          formData: true,
        },
      },
      gender: {
        'ui:options': {
          formData: true,
        },
      },
      otherPersonalInfo: {
        customFieldsKey: 'katerina',
        'ui:options': {},
        birthDate: {},
        residence: {},
        nationality: {},
        addressInfo: {
          'ui:options': {
            katerina: true,
          },
          addressName: {},
          addressNumber: {},
          TK: {},
          otherAddressInfo: {
            apartment: {},
            stairs: {},
          },
        },
      },
      contactInfo: {
        customFieldsKey: 'other',
        'ui:options': {},
        items: {
          type: {},
          value: {},
          primary: {
            'ui:options': {
              other: true,
            },
          },
          active: {
            'ui:options': {
              other: true,
            },
          },
        },
      },
    };

    const uiSchema5 = {
      name: {},
      surname: {},
      age: {
        'ui:options': {
          formData: true,
        },
      },
      gender: {
        'ui:options': {
          formData: true,
        },
      },
      otherPersonalInfo: {
        // 'ui:options': {},
        birthDate: {},
        residence: {},
        nationality: {},
        addressInfo: {
          customFieldsKey: 'addressInfoExtras',
          addressName: {
            'ui:options': {
              addressInfoExtras: true,
            },
          },
          addressNumber: {
            'ui:options': {
              addressInfoExtras: true,
            },
          },
          TK: {},
          otherAddressInfo: {
            'ui:options': {
              addressInfoExtras: true,
            },
            apartment: {},
            stairs: {},
          },
        },
      },
      contactInfo: {
        customFieldsKey: 'other',
        'ui:options': {
          other: true,
        },
        items: {
          type: {},
          value: {},
          primary: {},
          active: {},
        },
      },
    };

    const uiSchema6 = {
      name: {},
      surname: {},
      age: {
        'ui:options': {
          formData: true,
        },
      },
      gender: {
        'ui:options': {
          formData: true,
        },
      },
      otherPersonalInfo: {
        birthDate: {},
        residence: {},
        nationality: {},
        addressInfo: {
          customFieldsKey: 'addressInfoExtras',
          addressName: {},
          addressNumber: {},
          TK: {},
          otherAddressInfo: {
            apartment: {},
            stairs: {
              'ui:options': {
                addressInfoExtras: true,
              },
            },
          },
        },
      },
      contactInfo: {
        'ui:options': {},
        items: {
          type: {},
          value: {},
          primary: {},
          active: {},
        },
      },
    };

    const uiSchema7 = {
      name: {},
      surname: {},
      age: {
        'ui:options': {
          formData: true,
        },
      },
      gender: {
        'ui:options': {
          formData: true,
        },
      },
      otherPersonalInfo: {
        birthDate: {},
        residence: {},
        nationality: {},
        addressInfo: {
          addressName: {},
          addressNumber: {},
          TK: {},
          otherAddressInfo: {
            customFieldsKey: 'hoho',
            apartment: {},
            stairs: {
              'ui:options': {
                hoho: true,
              },
            },
          },
        },
      },
      contactInfo: {
        'ui:options': {},
        items: {
          type: {},
          value: {},
          primary: {},
          active: {},
        },
      },
    };

    const uiSchema8 = {
      name: {},
      surname: {},
      age: {
        'ui:options': {
          formData: true,
        },
      },
      gender: {
        'ui:options': {
          formData: true,
        },
      },
      otherPersonalInfo: {
        birthDate: {},
        residence: {},
        nationality: {},
        addressInfo: {
          addressName: {},
          addressNumber: {},
          TK: {},
          otherAddressInfo: {
            customFieldsKey: 'hoho',
            apartment: {},
            stairs: {
              'ui:options': {
                hoho: true,
              },
            },
            info: {
              'ui:options': {
                hoho: true,
              },
              items: {
                garden: {},
                balcony: {},
              },
            },
          },
        },
      },
      contactInfo: {
        'ui:options': {},
        items: {
          type: {},
          value: {},
          primary: {},
          active: {},
        },
      },
    };

    const uiSchema9 = {
      sidePanelInfo: [
        {
          key: 'contactInfo',
          uiSchema: {
            contactInfo: {
              'ui:options': {},
              items: {
                type: {
                  'ui:options': { formData: true },
                },
                value: {
                  'ui:options': { formData: true },
                },
                primary: {},
                active: {},
              },
            },
          },
        },
      ],
      name: {},
      surname: {},
      age: {
        'ui:options': {
          formData: true,
        },
      },
      gender: {
        'ui:options': {
          formData: true,
        },
      },
      otherPersonalInfo: {
        birthDate: {},
        residence: {},
        nationality: {},
        addressInfo: {
          addressName: {},
          addressNumber: {},
          TK: {},
          otherAddressInfo: {
            customFieldsKey: 'hoho',
            apartment: {},
            stairs: {
              'ui:options': {
                hoho: true,
              },
            },
            info: {
              'ui:options': {
                hoho: true,
              },
              items: {
                garden: {},
                balcony: {},
              },
            },
          },
        },
      },
    };

    describe('wrapEntityDataArea test cases', () => {
      it('case 1', () => {
        const expected = {
          name: entityWithoutStatus.name,
          surname: entityWithoutStatus.surname,
          formData: JSON.stringify({
            age: entityWithoutStatus.age,
            gender: entityWithoutStatus.gender,
            otherPersonalInfo: entityWithoutStatus.otherPersonalInfo,
            contactInfo: entityWithoutStatus.contactInfo,
          }),
        };

        expect(wrapEntityDataArea({ ...entity }, entityDataAreaKey, uiSchema1)).toEqual(expected);
      });

      it('case 2', () => {
        const expected = {
          name: entityWithoutStatus.name,
          surname: entityWithoutStatus.surname,
          formData: JSON.stringify({
            age: entityWithoutStatus.age,
            gender: entityWithoutStatus.gender,
          }),
          personalInfo: JSON.stringify({
            otherPersonalInfo: entityWithoutStatus.otherPersonalInfo,
          }),
          contactInfoModel: JSON.stringify({
            contactInfo: entityWithoutStatus.contactInfo,
          }),
        };

        expect(wrapEntityDataArea({ ...entity }, entityDataAreaKey, uiSchema2)).toEqual(expected);
      });

      it('case 3', () => {
        const expected = {
          name: entityWithoutStatus.name,
          surname: entityWithoutStatus.surname,
          formData: JSON.stringify({
            age: entityWithoutStatus.age,
            gender: entityWithoutStatus.gender,
          }),
          other: JSON.stringify({
            otherPersonalInfo: entityWithoutStatus.otherPersonalInfo,
            contactInfo: entityWithoutStatus.contactInfo,
          }),
        };

        expect(wrapEntityDataArea({ ...entity }, entityDataAreaKey, uiSchema3)).toEqual(expected);
      });

      it('case 4', () => {
        const expected = {
          name: entityWithoutStatus.name,
          surname: entityWithoutStatus.surname,
          formData: JSON.stringify({
            age: entityWithoutStatus.age,
            gender: entityWithoutStatus.gender,
          }),
          otherPersonalInfo: {
            birthDate: entityWithoutStatus.otherPersonalInfo.birthDate,
            residence: entityWithoutStatus.otherPersonalInfo.residence,
            nationality: entityWithoutStatus.otherPersonalInfo.nationality,
            katerina: JSON.stringify({
              addressInfo: entityWithoutStatus.otherPersonalInfo.addressInfo,
            }),
          },

          contactInfo: [
            { type: 'phone', value: '6789876544', other: JSON.stringify({ active: true }) },
            {
              type: 'email',
              value: 'k@gmail.com',
              other: JSON.stringify({ primary: true, active: true }),
            },
            {
              type: 'fax',
              value: '6789876544',
              other: JSON.stringify({ primary: false, active: false }),
            },
          ],
        };

        expect(wrapEntityDataArea({ ...entity }, 'formData', uiSchema4)).toEqual(expected);
      });

      it('case 5', () => {
        const expected = {
          name: entityWithoutStatus.name,
          surname: entityWithoutStatus.surname,
          formData: JSON.stringify({
            age: entityWithoutStatus.age,
            gender: entityWithoutStatus.gender,
          }),

          otherPersonalInfo: {
            birthDate: entityWithoutStatus.otherPersonalInfo.birthDate,
            residence: entityWithoutStatus.otherPersonalInfo.residence,
            nationality: entityWithoutStatus.otherPersonalInfo.nationality,
            addressInfo: {
              TK: entityWithoutStatus.otherPersonalInfo.addressInfo.TK,
              addressInfoExtras: JSON.stringify({
                addressName: entityWithoutStatus.otherPersonalInfo.addressInfo.addressName,
                addressNumber: entityWithoutStatus.otherPersonalInfo.addressInfo.addressNumber,
                otherAddressInfo:
                  entityWithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo,
              }),
            },
          },

          other: JSON.stringify({
            contactInfo: entityWithoutStatus.contactInfo,
          }),
        };

        expect(wrapEntityDataArea({ ...entity }, entityDataAreaKey, uiSchema5)).toEqual(expected);
      });

      it('case 6', () => {
        const expected = {
          name: entityWithoutStatus.name,
          surname: entityWithoutStatus.surname,
          formData: JSON.stringify({
            age: entityWithoutStatus.age,
            gender: entityWithoutStatus.gender,
          }),

          otherPersonalInfo: {
            birthDate: entityWithoutStatus.otherPersonalInfo.birthDate,
            residence: entityWithoutStatus.otherPersonalInfo.residence,
            nationality: entityWithoutStatus.otherPersonalInfo.nationality,
            addressInfo: {
              TK: entityWithoutStatus.otherPersonalInfo.addressInfo.TK,
              addressName: entityWithoutStatus.otherPersonalInfo.addressInfo.addressName,
              addressNumber: entityWithoutStatus.otherPersonalInfo.addressInfo.addressNumber,
              otherAddressInfo: {
                apartment:
                  entityWithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.apartment,
                addressInfoExtras: JSON.stringify({
                  stairs: entityWithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.stairs,
                }),
              },
            },
          },

          contactInfo: entityWithoutStatus.contactInfo,
        };

        expect(wrapEntityDataArea({ ...entity }, entityDataAreaKey, uiSchema6)).toEqual(expected);
      });

      it('case 7', () => {
        const expected = {
          name: entityWithoutStatus.name,
          surname: entityWithoutStatus.surname,
          formData: JSON.stringify({
            age: entityWithoutStatus.age,
            gender: entityWithoutStatus.gender,
          }),

          otherPersonalInfo: {
            birthDate: entityWithoutStatus.otherPersonalInfo.birthDate,
            residence: entityWithoutStatus.otherPersonalInfo.residence,
            nationality: entityWithoutStatus.otherPersonalInfo.nationality,
            addressInfo: {
              TK: entityWithoutStatus.otherPersonalInfo.addressInfo.TK,
              addressName: entityWithoutStatus.otherPersonalInfo.addressInfo.addressName,
              addressNumber: entityWithoutStatus.otherPersonalInfo.addressInfo.addressNumber,
              otherAddressInfo: {
                apartment:
                  entityWithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.apartment,
                hoho: JSON.stringify({
                  stairs: entityWithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.stairs,
                }),
              },
            },
          },

          contactInfo: entityWithoutStatus.contactInfo,
        };

        expect(wrapEntityDataArea({ ...entity }, entityDataAreaKey, uiSchema7)).toEqual(expected);
      });

      it('case 8', () => {
        const expected = {
          name: entity2WithoutStatus.name,
          surname: entity2WithoutStatus.surname,
          formData: JSON.stringify({
            age: entity2WithoutStatus.age,
            gender: entity2WithoutStatus.gender,
          }),

          otherPersonalInfo: {
            birthDate: entity2WithoutStatus.otherPersonalInfo.birthDate,
            residence: entity2WithoutStatus.otherPersonalInfo.residence,
            nationality: entity2WithoutStatus.otherPersonalInfo.nationality,
            addressInfo: {
              TK: entity2WithoutStatus.otherPersonalInfo.addressInfo.TK,
              addressName: entity2WithoutStatus.otherPersonalInfo.addressInfo.addressName,
              addressNumber: entity2WithoutStatus.otherPersonalInfo.addressInfo.addressNumber,
              otherAddressInfo: {
                apartment:
                  entity2WithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.apartment,
                hoho: JSON.stringify({
                  stairs:
                    entity2WithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.stairs,
                  info: entity2WithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.info,
                }),
              },
            },
          },

          contactInfo: entity2WithoutStatus.contactInfo,
        };

        expect(wrapEntityDataArea({ ...entity2 }, entityDataAreaKey, uiSchema8)).toEqual(expected);
      });

      it('case 9', () => {
        const expected = {
          name: entity2WithoutStatus.name,
          surname: entity2WithoutStatus.surname,
          formData: JSON.stringify({
            age: entity2WithoutStatus.age,
            gender: entity2WithoutStatus.gender,
          }),

          otherPersonalInfo: {
            birthDate: entity2WithoutStatus.otherPersonalInfo.birthDate,
            residence: entity2WithoutStatus.otherPersonalInfo.residence,
            nationality: entity2WithoutStatus.otherPersonalInfo.nationality,
            addressInfo: {
              TK: entity2WithoutStatus.otherPersonalInfo.addressInfo.TK,
              addressName: entity2WithoutStatus.otherPersonalInfo.addressInfo.addressName,
              addressNumber: entity2WithoutStatus.otherPersonalInfo.addressInfo.addressNumber,
              otherAddressInfo: {
                apartment:
                  entity2WithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.apartment,
                hoho: JSON.stringify({
                  stairs:
                    entity2WithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.stairs,
                  info: entity2WithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.info,
                }),
              },
            },
          },

          contactInfo: [
            { active: true, formData: JSON.stringify({ type: 'phone', value: '6789876544' }) },
            {
              active: true,
              primary: true,
              formData: JSON.stringify({ type: 'email', value: 'k@gmail.com' }),
            },
            {
              active: false,
              primary: false,
              formData: JSON.stringify({ type: 'fax', value: '6789876544' }),
            },
          ],
        };

        expect(wrapEntityDataArea({ ...entity2 }, entityDataAreaKey, uiSchema9)).toEqual(expected);
      });

      it('case 10', () => {
        const expected = {
          name: entity3WithoutMetadata.name,
          surname: entity3WithoutMetadata.surname,
          formData: JSON.stringify({
            age: entity3WithoutMetadata.age,
            gender: entity3WithoutMetadata.gender,
          }),

          otherPersonalInfo: {
            birthDate: entity3WithoutMetadata.otherPersonalInfo.birthDate,
            residence: entity3WithoutMetadata.otherPersonalInfo.residence,
            nationality: entity3WithoutMetadata.otherPersonalInfo.nationality,
            addressInfo: {
              TK: entity3WithoutMetadata.otherPersonalInfo.addressInfo.TK,
              addressName: entity3WithoutMetadata.otherPersonalInfo.addressInfo.addressName,
              addressNumber: entity3WithoutMetadata.otherPersonalInfo.addressInfo.addressNumber,
              otherAddressInfo: {
                apartment:
                  entity3WithoutMetadata.otherPersonalInfo.addressInfo.otherAddressInfo.apartment,
                hoho: JSON.stringify({
                  stairs:
                    entity3WithoutMetadata.otherPersonalInfo.addressInfo.otherAddressInfo.stairs,
                  info: entity3WithoutMetadata.otherPersonalInfo.addressInfo.otherAddressInfo.info,
                }),
              },
            },
          },

          contactInfo: entity3WithoutMetadata.contactInfo,
        };

        expect(wrapEntityDataArea({ ...entity3 }, entityDataAreaKey, uiSchema8)).toEqual(expected);
      });

      it('case 11', () => {
        const expected = {
          name: entity3WithoutMetadata.name,
          surname: entity3WithoutMetadata.surname,
          formData: JSON.stringify({
            age: entity3WithoutMetadata.age,
            gender: entity3WithoutMetadata.gender,
          }),

          otherPersonalInfo: {
            birthDate: entity3WithoutMetadata.otherPersonalInfo.birthDate,
            residence: entity3WithoutMetadata.otherPersonalInfo.residence,
            nationality: entity3WithoutMetadata.otherPersonalInfo.nationality,
            addressInfo: {
              TK: entity3WithoutMetadata.otherPersonalInfo.addressInfo.TK,
              addressName: entity3WithoutMetadata.otherPersonalInfo.addressInfo.addressName,
              addressNumber: entity3WithoutMetadata.otherPersonalInfo.addressInfo.addressNumber,
              otherAddressInfo: {
                apartment:
                  entity3WithoutMetadata.otherPersonalInfo.addressInfo.otherAddressInfo.apartment,
                hoho: JSON.stringify({
                  stairs:
                    entity3WithoutMetadata.otherPersonalInfo.addressInfo.otherAddressInfo.stairs,
                  info: entity3WithoutMetadata.otherPersonalInfo.addressInfo.otherAddressInfo.info,
                }),
              },
            },
          },

          contactInfo: [
            { active: true, formData: JSON.stringify({ type: 'phone', value: '6789876544' }) },
            {
              active: true,
              primary: true,
              formData: JSON.stringify({ type: 'email', value: 'k@gmail.com' }),
            },
            {
              active: false,
              primary: false,
              formData: JSON.stringify({ type: 'fax', value: '6789876544' }),
            },
          ],
        };

        expect(wrapEntityDataArea({ ...entity3 }, entityDataAreaKey, uiSchema9)).toEqual(expected);
      });
      it('case 12 - supports array of data area keys', () => {
        const uiSchemaWithMultipleDataAreas = {
          name: {},
          metadata: {
            'ui:options': {
              metaDataArea: true,
            },
          },
          details: {
            'ui:options': {
              formData: true,
            },
          },
        };

        const entityWithMultipleDataAreas = {
          name: 'Test',
          metadata: 'Some metadata',
          details: 'Some details',
        };

        const expected = {
          name: 'Test',
          metaDataArea: JSON.stringify({ metadata: 'Some metadata' }),
          formData: JSON.stringify({ details: 'Some details' }),
        };

        expect(
          wrapEntityDataArea(
            { ...entityWithMultipleDataAreas },
            ['formData', 'metaDataArea'],
            uiSchemaWithMultipleDataAreas,
          ),
        ).toEqual(expected);
      });

      it('case 13 - customFieldsKey overrides with array of data area keys', () => {
        const uiSchemaWithCustomFieldsKey = {
          name: {},
          addressInfo: {
            customFieldsKey: 'customData',
            street: {
              'ui:options': {
                customData: true,
              },
            },
            city: {},
          },
        };

        const entityWithCustomFields = {
          name: 'Test',
          addressInfo: {
            street: 'street example',
            city: 'Thessaloniki',
          },
        };

        const expected = {
          name: 'Test',
          addressInfo: {
            customData: JSON.stringify({ street: 'street example' }),
            city: 'Thessaloniki',
          },
        };

        expect(
          wrapEntityDataArea(
            { ...entityWithCustomFields },
            'customData',
            uiSchemaWithCustomFieldsKey,
          ),
        ).toEqual(expected);
      });
    });

    describe('unwrapEntityDataArea test cases', () => {
      const expected = {
        name: entityWithoutStatus.name,
        surname: entityWithoutStatus.surname,
        age: entityWithoutStatus.age,
        gender: entityWithoutStatus.gender,
        otherPersonalInfo: entityWithoutStatus.otherPersonalInfo,
        contactInfo: entityWithoutStatus.contactInfo,
      };

      const expected2 = {
        name: entity2WithoutStatus.name,
        surname: entity2WithoutStatus.surname,
        age: entity2WithoutStatus.age,
        gender: entity2WithoutStatus.gender,
        otherPersonalInfo: entity2WithoutStatus.otherPersonalInfo,
        contactInfo: entity2WithoutStatus.contactInfo,
      };

      const expected3 = {
        name: entity3WithoutMetadata.name,
        surname: entity3WithoutMetadata.surname,
        age: entity3WithoutMetadata.age,
        gender: entity3WithoutMetadata.gender,
        otherPersonalInfo: entity3WithoutMetadata.otherPersonalInfo,
        contactInfo: entity3WithoutMetadata.contactInfo,
      };

      it('case 1', () => {
        const data = {
          name: entityWithoutStatus.name,
          surname: entityWithoutStatus.surname,
          formData: JSON.stringify({
            age: entityWithoutStatus.age,
            gender: entityWithoutStatus.gender,
            otherPersonalInfo: entityWithoutStatus.otherPersonalInfo,
            contactInfo: entityWithoutStatus.contactInfo,
          }),
        };

        expect(unwrapEntityDataArea(data)).toEqual(expected);
      });

      it('case 2', () => {
        const data = {
          name: entityWithoutStatus.name,
          surname: entityWithoutStatus.surname,
          formData: JSON.stringify({
            age: entityWithoutStatus.age,
            gender: entityWithoutStatus.gender,
          }),
          personalInfo: JSON.stringify({
            otherPersonalInfo: entityWithoutStatus.otherPersonalInfo,
          }),
          contactInfoModel: JSON.stringify({
            contactInfo: entityWithoutStatus.contactInfo,
          }),
        };

        expect(unwrapEntityDataArea(data)).toEqual(expected);
      });

      it('case 3', () => {
        const data = {
          name: entityWithoutStatus.name,
          surname: entityWithoutStatus.surname,
          formData: JSON.stringify({
            age: entityWithoutStatus.age,
            gender: entityWithoutStatus.gender,
          }),
          other: JSON.stringify({
            otherPersonalInfo: entityWithoutStatus.otherPersonalInfo,
            contactInfo: entityWithoutStatus.contactInfo,
          }),
        };

        expect(unwrapEntityDataArea(data)).toEqual(expected);
      });

      it('case 4', () => {
        const data = {
          name: entityWithoutStatus.name,
          surname: entityWithoutStatus.surname,
          formData: JSON.stringify({
            age: entityWithoutStatus.age,
            gender: entityWithoutStatus.gender,
          }),
          otherPersonalInfo: {
            birthDate: entityWithoutStatus.otherPersonalInfo.birthDate,
            residence: entityWithoutStatus.otherPersonalInfo.residence,
            nationality: entityWithoutStatus.otherPersonalInfo.nationality,
            katerina: JSON.stringify({
              addressInfo: entityWithoutStatus.otherPersonalInfo.addressInfo,
            }),
          },

          contactInfo: [
            { type: 'phone', value: '6789876544', other: JSON.stringify({ active: true }) },
            {
              type: 'email',
              value: 'k@gmail.com',
              other: JSON.stringify({ primary: true, active: true }),
            },
            {
              type: 'fax',
              value: '6789876544',
              other: JSON.stringify({ primary: false, active: false }),
            },
          ],
        };

        expect(unwrapEntityDataArea(data)).toEqual(expected);
      });

      it('case 5', () => {
        const data = {
          name: entityWithoutStatus.name,
          surname: entityWithoutStatus.surname,
          formData: JSON.stringify({
            age: entityWithoutStatus.age,
            gender: entityWithoutStatus.gender,
          }),

          otherPersonalInfo: {
            birthDate: entityWithoutStatus.otherPersonalInfo.birthDate,
            residence: entityWithoutStatus.otherPersonalInfo.residence,
            nationality: entityWithoutStatus.otherPersonalInfo.nationality,
            addressInfo: {
              TK: entityWithoutStatus.otherPersonalInfo.addressInfo.TK,
              addressInfoExtras: JSON.stringify({
                addressName: entityWithoutStatus.otherPersonalInfo.addressInfo.addressName,
                addressNumber: entityWithoutStatus.otherPersonalInfo.addressInfo.addressNumber,
                otherAddressInfo:
                  entityWithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo,
              }),
            },
          },

          other: JSON.stringify({
            contactInfo: entityWithoutStatus.contactInfo,
          }),
        };

        expect(unwrapEntityDataArea(data)).toEqual(expected);
      });

      it('case 6', () => {
        const data = {
          name: entityWithoutStatus.name,
          surname: entityWithoutStatus.surname,
          formData: JSON.stringify({
            age: entityWithoutStatus.age,
            gender: entityWithoutStatus.gender,
          }),

          otherPersonalInfo: {
            birthDate: entityWithoutStatus.otherPersonalInfo.birthDate,
            residence: entityWithoutStatus.otherPersonalInfo.residence,
            nationality: entityWithoutStatus.otherPersonalInfo.nationality,
            addressInfo: {
              TK: entityWithoutStatus.otherPersonalInfo.addressInfo.TK,
              addressName: entityWithoutStatus.otherPersonalInfo.addressInfo.addressName,
              addressNumber: entityWithoutStatus.otherPersonalInfo.addressInfo.addressNumber,
              otherAddressInfo: {
                apartment:
                  entityWithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.apartment,
                addressInfoExtras: JSON.stringify({
                  stairs: entityWithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.stairs,
                }),
              },
            },
          },

          contactInfo: entityWithoutStatus.contactInfo,
        };

        expect(unwrapEntityDataArea(data)).toEqual(expected);
      });

      it('case 7', () => {
        const data = {
          name: entityWithoutStatus.name,
          surname: entityWithoutStatus.surname,
          formData: JSON.stringify({
            age: entityWithoutStatus.age,
            gender: entityWithoutStatus.gender,
          }),

          otherPersonalInfo: {
            birthDate: entityWithoutStatus.otherPersonalInfo.birthDate,
            residence: entityWithoutStatus.otherPersonalInfo.residence,
            nationality: entityWithoutStatus.otherPersonalInfo.nationality,
            addressInfo: {
              TK: entityWithoutStatus.otherPersonalInfo.addressInfo.TK,
              addressName: entityWithoutStatus.otherPersonalInfo.addressInfo.addressName,
              addressNumber: entityWithoutStatus.otherPersonalInfo.addressInfo.addressNumber,
              otherAddressInfo: {
                apartment:
                  entityWithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.apartment,
                hoho: JSON.stringify({
                  stairs: entityWithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.stairs,
                }),
              },
            },
          },

          contactInfo: entityWithoutStatus.contactInfo,
        };

        expect(unwrapEntityDataArea(data)).toEqual(expected);
      });

      it('case 8', () => {
        const data = {
          name: entity2WithoutStatus.name,
          surname: entity2WithoutStatus.surname,
          formData: JSON.stringify({
            age: entity2WithoutStatus.age,
            gender: entity2WithoutStatus.gender,
          }),

          otherPersonalInfo: {
            birthDate: entity2WithoutStatus.otherPersonalInfo.birthDate,
            residence: entity2WithoutStatus.otherPersonalInfo.residence,
            nationality: entity2WithoutStatus.otherPersonalInfo.nationality,
            addressInfo: {
              TK: entity2WithoutStatus.otherPersonalInfo.addressInfo.TK,
              addressName: entity2WithoutStatus.otherPersonalInfo.addressInfo.addressName,
              addressNumber: entity2WithoutStatus.otherPersonalInfo.addressInfo.addressNumber,
              otherAddressInfo: {
                apartment:
                  entity2WithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.apartment,
                hoho: JSON.stringify({
                  stairs:
                    entity2WithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.stairs,
                  info: entity2WithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.info,
                }),
              },
            },
          },

          contactInfo: entity2WithoutStatus.contactInfo,
        };

        expect(unwrapEntityDataArea(data)).toEqual(expected2);
      });

      it('case 9', () => {
        const data = {
          name: entity2WithoutStatus.name,
          surname: entity2WithoutStatus.surname,
          formData: JSON.stringify({
            age: entity2WithoutStatus.age,
            gender: entity2WithoutStatus.gender,
          }),

          otherPersonalInfo: {
            birthDate: entity2WithoutStatus.otherPersonalInfo.birthDate,
            residence: entity2WithoutStatus.otherPersonalInfo.residence,
            nationality: entity2WithoutStatus.otherPersonalInfo.nationality,
            addressInfo: {
              TK: entity2WithoutStatus.otherPersonalInfo.addressInfo.TK,
              addressName: entity2WithoutStatus.otherPersonalInfo.addressInfo.addressName,
              addressNumber: entity2WithoutStatus.otherPersonalInfo.addressInfo.addressNumber,
              otherAddressInfo: {
                apartment:
                  entity2WithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.apartment,
                hoho: JSON.stringify({
                  stairs:
                    entity2WithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.stairs,
                  info: entity2WithoutStatus.otherPersonalInfo.addressInfo.otherAddressInfo.info,
                }),
              },
            },
          },

          contactInfo: [
            { active: true, formData: JSON.stringify({ type: 'phone', value: '6789876544' }) },
            {
              active: true,
              primary: true,
              formData: JSON.stringify({ type: 'email', value: 'k@gmail.com' }),
            },
            {
              active: false,
              primary: false,
              formData: JSON.stringify({ type: 'fax', value: '6789876544' }),
            },
          ],
        };

        expect(unwrapEntityDataArea(data)).toEqual(expected2);
      });

      it('case 10', () => {
        const data = {
          name: entity3WithoutMetadata.name,
          surname: entity3WithoutMetadata.surname,
          formData: JSON.stringify({
            age: entity3WithoutMetadata.age,
            gender: entity3WithoutMetadata.gender,
          }),

          otherPersonalInfo: {
            birthDate: entity3WithoutMetadata.otherPersonalInfo.birthDate,
            residence: entity3WithoutMetadata.otherPersonalInfo.residence,
            nationality: entity3WithoutMetadata.otherPersonalInfo.nationality,
            addressInfo: {
              TK: entity3WithoutMetadata.otherPersonalInfo.addressInfo.TK,
              addressName: entity3WithoutMetadata.otherPersonalInfo.addressInfo.addressName,
              addressNumber: entity3WithoutMetadata.otherPersonalInfo.addressInfo.addressNumber,
              otherAddressInfo: {
                apartment:
                  entity3WithoutMetadata.otherPersonalInfo.addressInfo.otherAddressInfo.apartment,
                hoho: JSON.stringify({
                  stairs:
                    entity3WithoutMetadata.otherPersonalInfo.addressInfo.otherAddressInfo.stairs,
                  info: entity3WithoutMetadata.otherPersonalInfo.addressInfo.otherAddressInfo.info,
                }),
              },
            },
          },

          contactInfo: entity3WithoutMetadata.contactInfo,
        };

        expect(unwrapEntityDataArea(data)).toEqual(expected3);
      });

      it('case 11', () => {
        const data = {
          name: entity3WithoutMetadata.name,
          surname: entity3WithoutMetadata.surname,
          formData: JSON.stringify({
            age: entity3WithoutMetadata.age,
            gender: entity3WithoutMetadata.gender,
          }),

          otherPersonalInfo: {
            birthDate: entity3WithoutMetadata.otherPersonalInfo.birthDate,
            residence: entity3WithoutMetadata.otherPersonalInfo.residence,
            nationality: entity3WithoutMetadata.otherPersonalInfo.nationality,
            addressInfo: {
              TK: entity3WithoutMetadata.otherPersonalInfo.addressInfo.TK,
              addressName: entity3WithoutMetadata.otherPersonalInfo.addressInfo.addressName,
              addressNumber: entity3WithoutMetadata.otherPersonalInfo.addressInfo.addressNumber,
              otherAddressInfo: {
                apartment:
                  entity3WithoutMetadata.otherPersonalInfo.addressInfo.otherAddressInfo.apartment,
                hoho: JSON.stringify({
                  stairs:
                    entity3WithoutMetadata.otherPersonalInfo.addressInfo.otherAddressInfo.stairs,
                  info: entity3WithoutMetadata.otherPersonalInfo.addressInfo.otherAddressInfo.info,
                }),
              },
            },
          },

          contactInfo: [
            { active: true, formData: JSON.stringify({ type: 'phone', value: '6789876544' }) },
            {
              active: true,
              primary: true,
              formData: JSON.stringify({ type: 'email', value: 'k@gmail.com' }),
            },
            {
              active: false,
              primary: false,
              formData: JSON.stringify({ type: 'fax', value: '6789876544' }),
            },
          ],
        };

        expect(unwrapEntityDataArea(data)).toEqual(expected3);
      });

      it('keeps opaque JSON-string fields when key is skipped', () => {
        const validationReport = JSON.stringify({
          signed: true,
          overallStatus: 'INDETERMINATE',
          signatures: [{ signatureId: 'SIGNATURE_self-signed_20260617-1007' }],
        });

        const data = {
          id: 'attachment-id',
          formData: JSON.stringify({
            fileName: 'signed.pdf',
          }),
          validationReport,
        };

        expect(unwrapEntityDataArea(data)).toEqual({
          id: 'attachment-id',
          fileName: 'signed.pdf',
          signed: true,
          overallStatus: 'INDETERMINATE',
          signatures: [{ signatureId: 'SIGNATURE_self-signed_20260617-1007' }],
        });

        expect(unwrapEntityDataAreaWithSkipKeys(data, ['validationReport'])).toEqual({
          id: 'attachment-id',
          fileName: 'signed.pdf',
          validationReport,
        });
      });
    });
  });

  describe('mergeSubSchemas', () => {
    it('should return the uiSchema when no subSchemas', () => {
      expect(
        mergeSubSchemas({ uiSchema: {}, entityId: 'testEntity' }, { ApiData: {}, Entities: {} }),
      ).toStrictEqual({});
    });
    it('should merge given subschema into uiOptions?.subSchemas level', () => {
      expect(
        mergeSubSchemas(
          {
            uiSchema: {
              'ui:options': {
                subSchemas: [
                  {
                    code: 'TestSchema',
                    entityCL: 'TestSchema',
                    entitySubType: 'TESTSUBTYPE',
                    screenTypeCL: 'SINGLE_RECORD_FORM',
                    target: 'testSchema',
                    category: 'testOptions',
                    property: 'testSchemaCL',
                  },
                ],
              },
            },
            entityId: 'testEntity',
          },
          {
            ApiData: {},
            Entities: {
              testEntity: {
                formData: { testSchema: ['item1', 'item2'] },
              },
            },
          },
        ),
      ).toStrictEqual({
        'ui:options': {
          subSchemas: [
            {
              category: 'testOptions',
              code: 'TestSchema',
              entityCL: 'TestSchema',
              entitySubType: 'TESTSUBTYPE',
              property: 'testSchemaCL',
              screenTypeCL: 'SINGLE_RECORD_FORM',
              target: 'testSchema',
            },
          ],
        },
      });
    });
    it('should merge subschema into target?.items level', () => {
      expect(
        mergeSubSchemas(
          {
            uiSchema: {
              'ui:options': {
                subSchemas: [
                  {
                    code: 'TestSchema',
                    entityCL: 'TestSchema',
                    screenTypeCL: 'SINGLE_RECORD_FORM',
                    target: 'testSchema',
                    category: 'testOptions',
                    property: 'testSchemaCL',
                  },
                ],
              },
              testSchema: { items: [] },
            },
            entityId: 'testEntity',
          },
          {
            ApiData: {},
            Entities: {
              testEntity: {
                formData: {
                  testSchema: ['item1', 'item2'],
                },
              },
            },
          },
        ),
      ).toStrictEqual({
        'ui:options': {
          subSchemas: [
            {
              category: 'testOptions',
              code: 'TestSchema',
              entityCL: 'TestSchema',
              property: 'testSchemaCL',
              screenTypeCL: 'SINGLE_RECORD_FORM',
              target: 'testSchema',
            },
          ],
        },
        testSchema: {
          items: { testOptions: {} },
        },
      });
    });
    it('should merge subschema into target level', () => {
      expect(
        mergeSubSchemas(
          {
            uiSchema: {
              'ui:options': {
                subSchemas: [
                  {
                    code: 'TestSchema',
                    entityCL: 'TestSchema',
                    screenTypeCL: 'SINGLE_RECORD_FORM',
                    target: 'testSchema',
                    category: 'testOptions',
                    property: 'testSchemaCL',
                  },
                ],
              },
              testSchema: {},
            },
            entityId: 'testEntity',
          },
          {
            ApiData: {},
            Entities: {
              testEntity: {
                formData: {
                  testSchema: ['item1', 'item2'],
                },
              },
            },
          },
        ),
      ).toStrictEqual({
        'ui:options': {
          subSchemas: [
            {
              category: 'testOptions',
              code: 'TestSchema',
              entityCL: 'TestSchema',
              property: 'testSchemaCL',
              screenTypeCL: 'SINGLE_RECORD_FORM',
              target: 'testSchema',
            },
          ],
        },
        testSchema: { testOptions: {} },
      });
    });
  });

  describe('getTargetDataInForm', () => {
    const mockFormData = {
      user: {
        profile: {
          name: 'John Doe',
          age: 30,
          isActive: false,
          balance: 0,
        },
        settings: null,
      },
    };
    it('should return the correct value for a valid nested path', () => {
      const path = ['user', 'profile'];
      expect(getTargetDataInForm(path, mockFormData)).toEqual({
        name: 'John Doe',
        age: 30,
        isActive: false,
        balance: 0,
      });
    });

    it('should return mockFormData for an invalid nested path', () => {
      const path = ['user', 'very_invalid_one'];
      expect(getTargetDataInForm(path, undefined)).toEqual(undefined);
    });

    it('should return the original formData if the path array is empty', () => {
      const path: string[] = [];
      expect(getTargetDataInForm(path, mockFormData)).toEqual(mockFormData);
    });

    it('should return undefind or null if formData itself is undefined or null', () => {
      const path = ['user', 'profile'];
      expect(getTargetDataInForm(path, undefined)).toBeUndefined();
      expect(getTargetDataInForm(path, null)).toBeUndefined();
    });
  });

  describe('clearFormStepperFieldsOnly', () => {
    let mockFormData: any;
    let mockWidgetGroups: any[];

    beforeEach(() => {
      mockFormData = {
        formData: {
          firstName: 'John',
          lastName: 'Doe',
          age: 30,
          unrelatedField: 'will not be cleared',
        },
      };
      mockWidgetGroups = [{ widgets: ['firstName', 'lastName'] }, { widgets: ['age'] }];
    });

    it('should return undefined if widgetGroups is not provided', () => {
      expect(clearFormStepperFieldsOnly('parentId', null, mockFormData)).toEqual(mockFormData);
    });

    it('should return undefined if clonedFormData is not provided', () => {
      expect(clearFormStepperFieldsOnly('parentId', mockWidgetGroups, null)).toEqual(null);
    });

    it('should clear fields in targetData that start with widget names', () => {
      const parentId = 'reduxprefix_formData';

      const result = clearFormStepperFieldsOnly(parentId, mockWidgetGroups, mockFormData);

      expect(result.formData.firstName).toBeUndefined();
      expect(result.formData.lastName).toBeUndefined();
      expect(result.formData.age_input).toBeUndefined();

      expect(result.formData.unrelatedField).toBe('will not be cleared');
    });

    it('should not modify fields if widget names do not match any keys', () => {
      const parentId = 'reduxprefix_formData';
      const noMatchWidgetGroups = [{ widgets: ['nonExistentWidget'] }];

      const result = clearFormStepperFieldsOnly(parentId, noMatchWidgetGroups, mockFormData);

      expect(result.formData.firstName).toBe('John');
      expect(result.formData.lastName).toBe('Doe');
    });
  });

  describe('clearFormStepperFieldsOnly', () => {
    it('should return clonedFormData unchanged when widgetGroups is falsy', () => {
      const formData = { step1: { firstName: 'John' } };
      expect(clearFormStepperFieldsOnly('prefix_step1', null, formData)).toBe(formData);
    });
    it('should return clonedFormData unchanged when clonedFormData is falsy', () => {
      const groups = [{ widgets: ['firstName'] }];
      expect(clearFormStepperFieldsOnly('prefix_step1', groups, null)).toBeNull();
    });
    it('should clear all widget fields when no readOnlyWidgets provided', () => {
      const formData = { step1: { firstName: 'John', lastName: 'Doe', age: 30 } };
      const groups = [{ widgets: ['firstName', 'age'] }];
      const result = clearFormStepperFieldsOnly('prefix_step1', groups, formData);
      expect(result.step1.firstName).toBeUndefined();
      expect(result.step1.age).toBeUndefined();
      expect(result.step1.lastName).toBe('Doe');
    });
    it('should clear all widget fields when readOnlyWidgets is empty Set', () => {
      const formData = { step1: { firstName: 'John', age: 30 } };
      const groups = [{ widgets: ['firstName', 'age'] }];
      const result = clearFormStepperFieldsOnly('prefix_step1', groups, formData, new Set());
      expect(result.step1.firstName).toBeUndefined();
      expect(result.step1.age).toBeUndefined();
    });
    it('should skip top-level widget that is in readOnlyWidgets', () => {
      const formData = { step1: { firstName: 'John', lastName: 'Doe', age: 30 } };
      const groups = [{ widgets: ['firstName', 'lastName', 'age'] }];
      const result = clearFormStepperFieldsOnly(
        'prefix_step1',
        groups,
        formData,
        new Set(['lastName']),
      );
      expect(result.step1.firstName).toBeUndefined();
      expect(result.step1.lastName).toBe('Doe');
      expect(result.step1.age).toBeUndefined();
    });
    it('should preserve nested field when leaf key is in readOnlyWidgets', () => {
      const formData = {
        step1: {
          regNatPerBasicInfo: {
            regNatPerBasicData: {
              regNatPerName: 'John Doe',
              regNatPerAddress: '123 Main St',
            },
          },
        },
      };
      const groups = [{ widgets: ['regNatPerBasicInfo'] }];
      const result = clearFormStepperFieldsOnly(
        'prefix_step1',
        groups,
        formData,
        new Set(['regNatPerName']),
      );
      expect(result.step1.regNatPerBasicInfo.regNatPerBasicData.regNatPerName).toBe('John Doe');
      expect(result.step1.regNatPerBasicInfo.regNatPerBasicData.regNatPerAddress).toBeUndefined();
    });
    it('should preserve entire subtree when parent object key is in readOnlyWidgets', () => {
      const formData = {
        step1: {
          regNatPerBasicInfo: {
            regNatPerBasicData: {
              regNatPerName: 'John Doe',
              regNatPerAddress: '123 Main St',
            },
          },
        },
      };
      const groups = [{ widgets: ['regNatPerBasicInfo'] }];
      const result = clearFormStepperFieldsOnly(
        'prefix_step1',
        groups,
        formData,
        new Set(['regNatPerBasicData']),
      );
      expect(result.step1.regNatPerBasicInfo.regNatPerBasicData.regNatPerName).toBe('John Doe');
      expect(result.step1.regNatPerBasicInfo.regNatPerBasicData.regNatPerAddress).toBe(
        '123 Main St',
      );
    });
    it('should only clear widgets listed in widgetGroups, not all fields in targetData', () => {
      const formData = { step1: { firstName: 'John', lastName: 'Doe', unrelated: 'keep' } };
      const groups = [{ widgets: ['firstName'] }];
      const result = clearFormStepperFieldsOnly('prefix_step1', groups, formData);
      expect(result.step1.firstName).toBeUndefined();
      expect(result.step1.lastName).toBe('Doe');
      expect(result.step1.unrelated).toBe('keep');
    });
    it('should handle multiple groups with multiple widgets', () => {
      const formData = { step1: { fieldA: 'A', fieldB: 'B', fieldC: 'C', fieldD: 'D' } };
      const groups = [{ widgets: ['fieldA', 'fieldB'] }, { widgets: ['fieldC'] }];
      const result = clearFormStepperFieldsOnly('prefix_step1', groups, formData);
      expect(result.step1.fieldA).toBeUndefined();
      expect(result.step1.fieldB).toBeUndefined();
      expect(result.step1.fieldC).toBeUndefined();
      expect(result.step1.fieldD).toBe('D');
    });
    it('should resolve formStepPath correctly from parentId', () => {
      const formData = {
        section: {
          sub: 'clear me',
          other: 'keep me',
        },
      };
      const groups = [{ widgets: ['sub'] }];
      const result = clearFormStepperFieldsOnly('prefix_section', groups, formData);
      expect(result.section.sub).toBeUndefined();
      expect(result.section.other).toBe('keep me');
    });
    it('should not affect other steps data outside the resolved path', () => {
      const formData = {
        step1: { firstName: 'John', age: 30 },
        step2: { company: 'Acme' },
      };
      const groups = [{ widgets: ['firstName', 'age'] }];
      const result = clearFormStepperFieldsOnly('prefix_step1', groups, formData);
      expect(result.step2.company).toBe('Acme');
    });
  });
});
