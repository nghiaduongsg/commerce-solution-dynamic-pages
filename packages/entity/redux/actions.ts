import {
  SaveEntitySuccessAction,
  SaveEntityErrorAction,
  DeleteEntityAction,
  DeleteEntitySuccessAction,
  DeleteEntityErrorAction,
  SaveEntityAction,
  ClearEntityAction,
  SetEntityAction,
  SetEntityFormDataAction,
  ClearEntityErrorAction,
  AppendFormDataAction,
  SetTemporaryAttachmentAction,
} from './types';

export const SAVE_ENTITY = '@pkg-entity/SAVE';
export const SAVE_ENTITY_SUCCESS = '@pkg-entity/SAVE_SUCCESS';
export const SAVE_ENTITY_ERROR = '@pkg-entity/SAVE_ERROR';

export const DELETE_ENTITY = '@pkg-entity/DELETE';
export const DELETE_ENTITY_SUCCESS = '@pkg-entity/DELETE_SUCCESS';
export const DELETE_ENTITY_ERROR = '@pkg-entity/DELETE_ERROR';

export const SET_ENTITY = '@pkg-entity/SET';
export const SET_TEMPORARY_ATTACHMENT = '@pkg-entity/SET_TEMPORARY_ATTACHMENT';
export const CLEAR_ENTITY = '@pkg-entity/CLEAR';
export const SET_ENTITY_FORM_DATA = '@pkg-entity/SET_FORM_DATA';
export const APPEND_ENTITY_FORM_DATA = '@pkg-entity/APPEND_FORM_DATA';
export const CLEAR_ENTITY_FORM_DATA = '@pkg-entity/CLEAR_FORM_DATA';
export const CLEAR_ALL_ENTITIES = '@pkg-entity/CLEAR_ALL';

export const UPDATE_FORM_VALUE = '@pkg-form/UPDATE_VALUE';
export const CLEAR_FORM_VALUES = '@pkg-form/CLEAR_VALUES';
export const TRIGGER_FORM_UPDATE = '@pkg-form/TRIGGER_UPDATE';

export const ADD_ARRAY_FIELD_ITEM = '@pkg-form/ADD_ARRAY_FIELD_ITEM';
export const ADD_ARRAY_FIELD_ITEMS = '@pkg-form/ADD_ARRAY_FIELD_ITEMS';
export const REMOVE_ARRAY_FIELD_ITEM = '@pkg-form/REMOVE_ARRAY_FIELD_ITEM';
export const CONCAT_TO_OBJECT = '@pkg-form/CONCAT_TO_OBJECT';

export const SELECT_ARRAY_ITEMS = '@pkg-form/SELECT_ARRAY_ITEMS';
export const DESELECT_ARRAY_ITEMS = '@pkg-form/DESELECT_ARRAY_ITEMS';
export const REORDER_ARRAY_FIELDS = '@pkg-form/REORDER_ARRAY_FIELDS';
export const CLEAR_ENTITY_ERROR = '@pkg-form/CLEAR_ENTITY_ERROR';
export const CLEAR_STEPPER_FORM = '@pkg-form/CLEAR_STEPPER_FORM';

export const SET_VALID_ON_DATE = '@pkg-form/SET_VALID_ON_DATE';

export const SaveEntity = (payload: SaveEntityAction) => ({
  type: SAVE_ENTITY,
  payload,
});

export const SaveEntitySuccess = (payload: SaveEntitySuccessAction) => ({
  type: SAVE_ENTITY_SUCCESS,
  payload,
});

export const SaveEntityError = (payload: SaveEntityErrorAction) => ({
  type: SAVE_ENTITY_ERROR,
  payload,
});

export const DeleteEntity = (payload: DeleteEntityAction) => ({
  type: DELETE_ENTITY,
  payload,
});

export const DeleteEntitySuccess = (payload: DeleteEntitySuccessAction) => ({
  type: DELETE_ENTITY_SUCCESS,
  payload,
});

export const ClearEntityError = (payload: ClearEntityErrorAction) => ({
  type: CLEAR_ENTITY_ERROR,
  payload,
});

export const DeleteEntityError = (payload: DeleteEntityErrorAction) => ({
  type: DELETE_ENTITY_ERROR,
  payload,
});

export const ClearEntity = (payload: ClearEntityAction) => ({
  type: CLEAR_ENTITY,
  payload,
});

export const SetEntity = (payload: SetEntityAction) => ({
  type: SET_ENTITY,
  payload,
});

export const SetTemporaryAttachment = (payload: SetTemporaryAttachmentAction) => ({
  type: SET_TEMPORARY_ATTACHMENT,
  payload,
});

export const SetEntityFormData = (payload: SetEntityFormDataAction) => ({
  type: SET_ENTITY_FORM_DATA,
  payload,
});

export const AppendEntityFormData = (payload: AppendFormDataAction) => ({
  type: APPEND_ENTITY_FORM_DATA,
  payload,
});

export const ClearEntityFormData = (payload) => ({
  type: CLEAR_ENTITY_FORM_DATA,
  payload,
});

export const UpdateFormValue = ({ entityId, value, fieldId, hookName, metadata }) => ({
  type: UPDATE_FORM_VALUE,
  payload: { entityId, fieldId, value, hookName, metadata },
});

export const ClearFormValues = ({ entityId, fieldIds }) => ({
  type: CLEAR_FORM_VALUES,
  payload: { entityId, fieldIds },
});

export const AddFormItem = ({ entityId, item, fieldId }) => ({
  type: ADD_ARRAY_FIELD_ITEM,
  payload: { entityId, fieldId, item },
});
export const AddFormItems = ({ entityId, items, fieldId }) => ({
  type: ADD_ARRAY_FIELD_ITEMS,
  payload: { entityId, fieldId, items },
});

export const RemoveFormItem = ({ entityId, index, fieldId }) => ({
  type: REMOVE_ARRAY_FIELD_ITEM,
  payload: { entityId, fieldId, index },
});

export const ConcatToObject = ({ entityId, fieldId, property, value, stringify = false }) => ({
  type: CONCAT_TO_OBJECT,
  payload: { entityId, fieldId, property, value, stringify },
});

export const SelectArrayItems = ({ entityId, fieldId, indices, multiple }) => ({
  type: SELECT_ARRAY_ITEMS,
  payload: { entityId, fieldId, indices, multiple },
});

export const DeselectArrayItems = ({ entityId, fieldId, indices }) => ({
  type: DESELECT_ARRAY_ITEMS,
  payload: { entityId, fieldId, indices },
});

export const ReorderArrayItems = ({ entityId, fieldId, sortBy }) => ({
  type: REORDER_ARRAY_FIELDS,
  payload: { entityId, fieldId, sortBy },
});

export const TriggerEntityFormData = (payload) => ({
  type: TRIGGER_FORM_UPDATE,
  payload,
});

export const ClearAllEntities = () => ({
  type: CLEAR_ALL_ENTITIES,
});

export const SetValidOnDate = (payload) => ({
  type: SET_VALID_ON_DATE,
  payload,
});

export const ClearStepperForm = (payload: { entityId; parentId; groups; readOnlyWidgets }) => ({
  type: CLEAR_STEPPER_FORM,
  payload,
});
