import {
  DELETE_ENTITY_ERROR,
  DeleteEntityError,
  DeleteEntitySuccess,
  DELETE_ENTITY_SUCCESS,
  DeleteEntity,
  DELETE_ENTITY,
  SaveEntityError,
  SAVE_ENTITY_ERROR,
  SaveEntitySuccess,
  SAVE_ENTITY_SUCCESS,
  SaveEntity,
  SAVE_ENTITY,
  CLEAR_ENTITY,
  ClearEntity,
  SET_ENTITY,
  SetEntity,
  SET_ENTITY_FORM_DATA,
  SetEntityFormData,
  CLEAR_ENTITY_FORM_DATA,
  ClearEntityFormData,
  UPDATE_FORM_VALUE,
  UpdateFormValue,
  CLEAR_FORM_VALUES,
  ClearFormValues,
  ADD_ARRAY_FIELD_ITEM,
  AddFormItem,
  REMOVE_ARRAY_FIELD_ITEM,
  RemoveFormItem,
  SELECT_ARRAY_ITEMS,
  SelectArrayItems,
  DESELECT_ARRAY_ITEMS,
  DeselectArrayItems,
  REORDER_ARRAY_FIELDS,
  ReorderArrayItems,
  TRIGGER_FORM_UPDATE,
  TriggerEntityFormData,
  CLEAR_ALL_ENTITIES,
  ClearAllEntities,
  ClearStepperForm,
  CLEAR_STEPPER_FORM,
  SET_TEMPORARY_ATTACHMENT,
  SetTemporaryAttachment,
  SetValidOnDate,
  SET_VALID_ON_DATE,
} from './actions';
import { AnyType } from '@pkg-common/types';

describe('Entity actions', () => {
  const sampleEntity = {
    code: 'code',
    description: 'description',
    legalEntity: true,
  } as AnyType;

  it('SaveEntity', () => {
    const expected = {
      type: SAVE_ENTITY,
      payload: { entityId: 'FORM_ENTITY' },
    };

    expect(SaveEntity({ entityId: 'FORM_ENTITY' })).toEqual(expected);
  });

  it('SaveEntitySuccess', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
      entity: sampleEntity,
      messageKey: 'updateEntitySuccess',
      namespace: 'common',
    };

    const expected = {
      type: SAVE_ENTITY_SUCCESS,
      payload,
    };

    expect(
      SaveEntitySuccess({
        entityId: 'FORM_ENTITY',
        entity: payload.entity,
        messageKey: 'updateEntitySuccess',
        namespace: 'common',
      }),
    ).toEqual(expected);
  });

  it('SaveEntityError', () => {
    const error = {
      message: 'error',
    };
    const expected = {
      type: SAVE_ENTITY_ERROR,
      payload: { entityId: 'FORM_ENTITY', entity: {}, error },
    };

    expect(SaveEntityError({ entityId: 'FORM_ENTITY', entity: {}, error })).toEqual(expected);
  });

  it('DeleteEntity', () => {
    const expected = {
      type: DELETE_ENTITY,
      payload: { entityId: 'FORM_ENTITY', code: 'entityID' },
    };

    expect(DeleteEntity({ entityId: 'FORM_ENTITY', code: 'entityID' })).toEqual(expected);
  });

  it('DeleteEntitySuccess', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
      code: 'code',
      tableId: 'tableID',
    };

    const expected = {
      type: DELETE_ENTITY_SUCCESS,
      payload,
    } as AnyType;

    expect(DeleteEntitySuccess(payload)).toEqual(expected);
  });

  it('DeleteEntityError', () => {
    const error = {
      message: 'error',
    };
    const expected = {
      type: DELETE_ENTITY_ERROR,
      payload: { entityId: 'FORM_ENTITY', error },
    };

    expect(DeleteEntityError({ entityId: 'FORM_ENTITY', error })).toEqual(expected);
  });

  it('ClearEntity', () => {
    const expected = {
      type: CLEAR_ENTITY,
      payload: { entityId: 'FORM_ENTITY' },
    };

    expect(ClearEntity({ entityId: 'FORM_ENTITY' })).toEqual(expected);
  });

  it('SetEntity', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
      initialEntityData: { id: 'id' },
    };

    const expected = {
      type: SET_ENTITY,
      payload,
    };

    expect(SetEntity(payload)).toEqual(expected);
  });

  it('SetEntityFormData', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
      data: { id: 'id' },
    };

    const expected = {
      type: SET_ENTITY_FORM_DATA,
      payload,
    };

    expect(SetEntityFormData(payload)).toEqual(expected);
  });

  it('ClearEntityFormData', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
    };

    const expected = {
      type: CLEAR_ENTITY_FORM_DATA,
      payload,
    };

    expect(ClearEntityFormData(payload)).toEqual(expected);
  });

  it('DeleteEntityError', () => {
    const error = {
      message: 'error',
    };
    const expected = {
      type: DELETE_ENTITY_ERROR,
      payload: { entityId: 'FORM_ENTITY', error },
    };

    expect(DeleteEntityError({ entityId: 'FORM_ENTITY', error })).toEqual(expected);
  });

  it('DeleteEntitySuccess', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
      code: 'code',
      tableId: 'tableID',
    };

    const expected = {
      type: DELETE_ENTITY_SUCCESS,
      payload,
    } as AnyType;

    expect(DeleteEntitySuccess(payload)).toEqual(expected);
  });

  it('ClearEntity', () => {
    const expected = {
      type: CLEAR_ENTITY,
      payload: { entityId: 'FORM_ENTITY' },
    };

    expect(ClearEntity({ entityId: 'FORM_ENTITY' })).toEqual(expected);
  });

  it('SetEntity', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
      initialEntityData: { id: 'id' },
    };

    const expected = {
      type: SET_ENTITY,
      payload,
    };

    expect(SetEntity(payload)).toEqual(expected);
  });

  it('SetEntityFormData', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
      data: { id: 'id' },
    };

    const expected = {
      type: SET_ENTITY_FORM_DATA,
      payload,
    };

    expect(SetEntityFormData(payload)).toEqual(expected);
  });

  it('ClearEntityFormData', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
    };

    const expected = {
      type: CLEAR_ENTITY_FORM_DATA,
      payload,
    };

    expect(ClearEntityFormData(payload)).toEqual(expected);
  });

  it('UpdateFormValue', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
      value: 'new value',
      fieldId: 'fieldId',
      hookName: '',
      metadata: {},
    };

    const expected = {
      type: UPDATE_FORM_VALUE,
      payload,
    };

    expect(UpdateFormValue(payload)).toEqual(expected);
  });

  it('ClearFormValues', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
      fieldIds: ['field1', 'field2'],
    };

    const expected = {
      type: CLEAR_FORM_VALUES,
      payload,
    };

    expect(ClearFormValues(payload)).toEqual(expected);
  });

  it('AddFormItem', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
      item: 'new item',
      fieldId: 'fieldId',
    };

    const expected = {
      type: ADD_ARRAY_FIELD_ITEM,
      payload,
    };

    expect(AddFormItem(payload)).toEqual(expected);
  });

  it('RemoveFormItem', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
      index: 2,
      fieldId: 'fieldId',
    };

    const expected = {
      type: REMOVE_ARRAY_FIELD_ITEM,
      payload,
    };

    expect(RemoveFormItem(payload)).toEqual(expected);
  });

  it('SelectArrayItems', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
      fieldId: 'fieldId',
      indices: [1, 3],
      multiple: true,
    };

    const expected = {
      type: SELECT_ARRAY_ITEMS,
      payload,
    };

    expect(SelectArrayItems(payload)).toEqual(expected);
  });

  it('DeselectArrayItems', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
      fieldId: 'fieldId',
      indices: [2, 4],
    };

    const expected = {
      type: DESELECT_ARRAY_ITEMS,
      payload,
    };

    expect(DeselectArrayItems(payload)).toEqual(expected);
  });

  it('ReorderArrayItems', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
      fieldId: 'fieldId',
      sortBy: 'fieldName',
    };

    const expected = {
      type: REORDER_ARRAY_FIELDS,
      payload,
    };

    expect(ReorderArrayItems(payload)).toEqual(expected);
  });

  it('TriggerEntityFormData', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
      data: { id: 'id' },
    };

    const expected = {
      type: TRIGGER_FORM_UPDATE,
      payload,
    };

    expect(TriggerEntityFormData(payload)).toEqual(expected);
  });

  it('SetValidOnDate', () => {
    const payload = {
      entityId: 'FORM_ENTITY',
      date: '12-12-2022',
    };

    const expected = {
      type: SET_VALID_ON_DATE,
      payload,
    };

    expect(SetValidOnDate(payload)).toEqual(expected);
  });

  it('ClearAllEntities', () => {
    const expected = {
      type: CLEAR_ALL_ENTITIES,
    };

    expect(ClearAllEntities()).toEqual(expected);
  });

  it('ClearAllEntities', () => {
    const expected = {
      type: SET_TEMPORARY_ATTACHMENT,
      payload: {
        entityId: '6767dsf',
        attachment: {
          id: 678,
          fileName: 'Attachment name',
        },
      },
    };

    expect(
      SetTemporaryAttachment({
        entityId: '6767dsf',
        attachment: {
          id: 678,
          fileName: 'Attachment name',
        },
      }),
    ).toEqual(expected);
  });

  it('should create an action to clear the stepper form', () => {
    const mockPayload = {
      entityId: 'form_123',
      parentId: 'widget_456',
      groups: ['groupA', 'groupB'],
      readOnlyWidgets: new Set(),
    };

    const expectedAction = {
      type: CLEAR_STEPPER_FORM,
      payload: mockPayload,
    };

    expect(ClearStepperForm(mockPayload)).toEqual(expectedAction);
  });
});
