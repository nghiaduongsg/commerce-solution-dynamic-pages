import {
  SAVE_ENTITY_SUCCESS,
  SAVE_ENTITY_ERROR,
  DELETE_ENTITY_SUCCESS,
  DELETE_ENTITY_ERROR,
  SAVE_ENTITY,
  CLEAR_ENTITY,
  SET_ENTITY,
  SET_ENTITY_FORM_DATA,
  CLEAR_ENTITY_FORM_DATA,
  REORDER_ARRAY_FIELDS,
  UPDATE_FORM_VALUE,
  CLEAR_FORM_VALUES,
  ADD_ARRAY_FIELD_ITEM,
  REMOVE_ARRAY_FIELD_ITEM,
  SELECT_ARRAY_ITEMS,
  DESELECT_ARRAY_ITEMS,
  CONCAT_TO_OBJECT,
  ADD_ARRAY_FIELD_ITEMS,
  SET_TEMPORARY_ATTACHMENT,
  SET_VALID_ON_DATE,
  CLEAR_STEPPER_FORM,
} from './actions';

import EntityReducer from './reducers';
import { mockDate } from '@_jestHelpers/dateMock';
import { AnyType } from '@pkg-common/types';
import { REPORTED_FORM_DATA_KEY } from '@pkg-constants/formCommon';
import { CALL_API_FULFILLED } from '@pkg-core/apiData/redux/reducers';

describe('Entity Reducer', () => {
  const formId = 'FORM';
  const entityId = 'FORM_ENTITY';

  const defaultState = {
    entity: {},
    id: '',
    url: '',
    loading: false,
    entityIdKey: '',
    isNew: false,
    entityStoreId: entityId,
    formData: {},
    diffs: {},
    groupedDiffs: {},
    entityDataAreaKey: '',
    extras: {},
    selectedItems: {},
    hookUpdates: {},
    lastClearUpdate: 0,
  };

  const sampleEntity = {
    code: 'code',
    description: 'description',
    legalEntity: true,
    [REPORTED_FORM_DATA_KEY]: {},
  } as AnyType;

  let state = {
    [entityId]: defaultState,
  };

  beforeEach(() => {
    state = {
      [entityId]: defaultState,
    };
    mockDate(1234);
  });

  it('should return the defaultState when parameter state is undefined and no action is passed', () => {
    expect(EntityReducer()[entityId]).toEqual(undefined);
  });

  it('should return the defaultState state when no action is passed', () => {
    expect(EntityReducer(state)[entityId]).toEqual(defaultState);
  });

  it('TYPE = SAVE_ENTITY', () => {
    const action = {
      type: SAVE_ENTITY,
      payload: {
        entityId,
        isNew: true,
      },
    };

    const expected = {
      ...defaultState,
      loading: true,
    };

    expect(EntityReducer(state, action)[entityId]).toEqual(expected);
  });

  it('TYPE = SAVE_ENTITY_SUCCESS (first time)', () => {
    const action = {
      type: SAVE_ENTITY_SUCCESS,
      payload: {
        entityId,
        entity: sampleEntity,
      },
    };

    const expected = {
      ...defaultState,
      entity: sampleEntity,
      formData: sampleEntity,
      isNew: false,
      lastUpdate: 1234,
      serverUpdate: 0,
    };

    expect(EntityReducer(state, action)[entityId]).toEqual(expected);
  });

  it('TYPE = SAVE_ENTITY_SUCCESS', () => {
    const action = {
      type: SAVE_ENTITY_SUCCESS,
      payload: {
        entityId,
        entity: sampleEntity,
      },
    };

    const expected = {
      ...defaultState,
      entity: sampleEntity,
      formData: sampleEntity,
      isNew: false,
      lastUpdate: 1234,
      serverUpdate: 1234,
    };

    expect(
      EntityReducer(
        {
          [entityId]: { ...defaultState, serverUpdate: 0 },
        },
        action,
      )[entityId],
    ).toEqual(expected);
  });

  it('TYPE = SAVE_ENTITY_ERROR', () => {
    const error = { message: 'SAVE_ENTITY_ERROR' };

    const action = {
      type: SAVE_ENTITY_ERROR,
      payload: {
        entityId,
        error,
      },
    };

    const expected = {
      ...defaultState,
      error,
      lastUpdate: 1234,
    };

    expect(EntityReducer(state, action)[entityId]).toEqual(expected);
  });

  it('TYPE = DELETE_ENTITY_SUCCESS', () => {
    const action = {
      type: DELETE_ENTITY_SUCCESS,
      payload: {
        entityId,
        id: 'EntityID',
      },
    };

    const expected = {
      ...defaultState,
      entity: {},
    };

    expect(EntityReducer(state, action)[entityId]).toEqual(expected);
  });

  it('TYPE = DELETE_ENTITY_ERROR', () => {
    const error = { message: 'DELETE_ENTITY_ERROR' };

    const action = {
      type: DELETE_ENTITY_ERROR,
      payload: { entityId, error },
    };

    const expected = {
      ...defaultState,
      error,
      lastUpdate: 1234,
    };

    expect(EntityReducer(state, action)[entityId]).toEqual(expected);
  });

  it('TYPE = CLEAR_ENTITY', () => {
    const action = {
      type: CLEAR_ENTITY,
      payload: { entityId },
    };

    const expected = {
      ...defaultState,
      lastUpdate: 1234,
      lastClearUpdate: 1234,
    };

    expect(EntityReducer(state, action)[entityId]).toEqual(expected);
  });

  it('TYPE = SET_ENTITY', () => {
    const action = {
      type: SET_ENTITY,
      payload: {
        entityId,
        initialEntityData: { prop: 'value' },
      },
    };

    const expected = {
      ...defaultState,
      entity: {
        ...action.payload.initialEntityData,
        [REPORTED_FORM_DATA_KEY]: {},
      },
      formData: {
        ...action.payload.initialEntityData,
        [REPORTED_FORM_DATA_KEY]: {},
      },
      lastUpdate: 1234,
    };

    expect(EntityReducer(state, action)[entityId]).toEqual(expected);
  });

  it('TYPE = SET_ENTITY_FORM_DATA', () => {
    const action = {
      type: SET_ENTITY_FORM_DATA,
      payload: { entityId, data: { prop: 'value' } },
    };

    const expected = {
      ...defaultState,
      formData: action.payload.data,
      lastUpdate: 1234,
    };

    expect(EntityReducer(state, action)[entityId]).toEqual(expected);
  });

  it('TYPE = CLEAR_ENTITY_FORM_DATA', () => {
    const action = {
      type: CLEAR_ENTITY_FORM_DATA,
      payload: { entityId },
    };

    const expected = {
      ...defaultState,
      formData: {},
      lastUpdate: 1234,
      lastClearUpdate: 1234,
    };

    expect(EntityReducer(state, action)[entityId]).toEqual(expected);
  });

  describe('TYPE = SELECT_ARRAY_ITEMS  (multiple = true)', () => {
    it('when selecting only one item', () => {
      const action = {
        type: SELECT_ARRAY_ITEMS,
        payload: { entityId, fieldId: `${formId}_items`, indices: [2], multiple: true },
      };

      const stateOverride = {
        [entityId]: {
          ...defaultState,
          formData: {
            items: [{ code: 'A' }, { code: 'B' }, { code: 'C' }, { code: 'D' }],
          },
          selectedItems: {
            [`${formId}_items`]: [{ code: 'A', __index: 0 }],
          },
        },
      };

      const expected = {
        ...defaultState,
        formData: {
          items: [{ code: 'A' }, { code: 'B' }, { code: 'C' }, { code: 'D' }],
        },
        selectedItems: {
          [`${formId}_items`]: [
            { code: 'A', __index: 0 },
            { code: 'C', __index: 2 },
          ],
        },
      };

      // @ts-ignore
      expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
    });

    it('when selecting only more than one items and some of them are already selected', () => {
      const action = {
        type: SELECT_ARRAY_ITEMS,
        payload: { entityId, fieldId: `${formId}_items`, indices: [0, 2, 4], multiple: true },
      };

      const stateOverride = {
        [entityId]: {
          ...defaultState,
          formData: {
            items: [{ code: 'A' }, { code: 'B' }, { code: 'C' }, { code: 'D' }, { code: 'E' }],
          },
          selectedItems: {
            [`${formId}_items`]: [{ code: 'A', __index: 0 }],
          },
        },
      };

      const expected = {
        ...defaultState,
        formData: {
          items: [{ code: 'A' }, { code: 'B' }, { code: 'C' }, { code: 'D' }, { code: 'E' }],
        },
        selectedItems: {
          [`${formId}_items`]: [
            { code: 'A', __index: 0 },
            { code: 'C', __index: 2 },
            { code: 'E', __index: 4 },
          ],
        },
      };

      // @ts-ignore
      expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
    });
  });

  describe('TYPE = SELECT_ARRAY_ITEMS  (multiple = false)', () => {
    it('when selecting only one item', () => {
      const action = {
        type: SELECT_ARRAY_ITEMS,
        payload: { entityId, fieldId: `${formId}_items`, indices: [2], multiple: false },
      };

      const stateOverride = {
        [entityId]: {
          ...defaultState,
          formData: {
            items: [{ code: 'A' }, { code: 'B' }, { code: 'C' }, { code: 'D' }],
          },
          selectedItems: {
            [`${formId}_items`]: [{ code: 'A', __index: 0 }],
          },
        },
      };

      const expected = {
        ...defaultState,
        formData: {
          items: [{ code: 'A' }, { code: 'B' }, { code: 'C' }, { code: 'D' }],
        },
        selectedItems: {
          [`${formId}_items`]: [{ code: 'C', __index: 2 }],
        },
      };

      // @ts-ignore
      expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
    });
  });

  describe('TYPE = DESELECT_ARRAY_ITEMS', () => {
    it('when deselecting only one item', () => {
      const action = {
        type: DESELECT_ARRAY_ITEMS,
        payload: { entityId, fieldId: `${formId}_items`, indices: [0] },
      };

      const stateOverride = {
        [entityId]: {
          ...defaultState,
          formData: {
            items: [{ code: 'A' }, { code: 'B' }, { code: 'C' }, { code: 'D' }],
          },
          selectedItems: {
            [`${formId}_items`]: [{ code: 'A', __index: 0 }],
          },
        },
      };

      const expected = {
        ...defaultState,
        formData: {
          items: [{ code: 'A' }, { code: 'B' }, { code: 'C' }, { code: 'D' }],
        },
        selectedItems: {
          [`${formId}_items`]: [],
        },
      };

      // @ts-ignore
      expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
    });

    it('when deselecting only more than one items and some of them are not selected', () => {
      const action = {
        type: DESELECT_ARRAY_ITEMS,
        payload: { entityId, fieldId: `${formId}_items`, indices: [1, 4] },
      };

      const stateOverride = {
        [entityId]: {
          ...defaultState,
          formData: {
            items: [{ code: 'A' }, { code: 'B' }, { code: 'C' }, { code: 'D' }, { code: 'E' }],
          },
          selectedItems: {
            [`${formId}_items`]: [
              { code: 'A', __index: 0 },
              { code: 'B', __index: 1 },
            ],
          },
        },
      };

      const expected = {
        ...defaultState,
        formData: {
          items: [{ code: 'A' }, { code: 'B' }, { code: 'C' }, { code: 'D' }, { code: 'E' }],
        },
        selectedItems: {
          [`${formId}_items`]: [{ code: 'A', __index: 0 }],
        },
      };

      // @ts-ignore
      expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
    });
  });

  it('TYPE = REORDER_ARRAY_FIELDS', () => {
    const action = {
      type: REORDER_ARRAY_FIELDS,
      payload: { entityId, fieldId: `${formId}_items`, sortBy: 'order' },
    };

    const stateOverride = {
      [entityId]: {
        ...defaultState,
        formData: {
          items: [{ order: 3 }, { order: 4 }, { order: 1 }],
        },
        lastUpdate: 1234,
      },
    };

    const expected = {
      ...defaultState,
      formData: {
        items: [{ order: 1 }, { order: 3 }, { order: 4 }],
      },
      lastUpdate: 1234,
    };

    // @ts-ignore
    expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
  });

  it('TYPE = UPDATE_FORM_VALUE', () => {
    const action = {
      type: UPDATE_FORM_VALUE,
      payload: { entityId, fieldId: `${formId}_items_1_order`, value: 9 },
    };

    const stateOverride = {
      [entityId]: {
        ...defaultState,
        formData: {
          items: [{ order: 3 }, { order: 4 }, { order: 1 }],
        },
        lastUpdate: 1234,
      },
    };

    const expected = {
      ...defaultState,
      formData: {
        items: [{ order: 3 }, { order: 9, __STATUS__: 'EDITED' }, { order: 1 }],
      },
      hookUpdates: {
        [`${formId}_items_1_order`]: 0,
      },
      lastUpdate: 1234,
    };

    const newState = EntityReducer(stateOverride, action)[entityId];

    // @ts-ignore
    expect(newState.formData).toEqual(expected.formData);
    expect(newState.hookUpdates).toEqual(expected.hookUpdates);
  });

  it('TYPE = UPDATE_FORM_VALUE (from hook)', () => {
    const action = {
      type: UPDATE_FORM_VALUE,
      payload: { entityId, fieldId: `${formId}_items_1_order`, value: 9, hookName: 'customHook' },
    };

    const stateOverride = {
      [entityId]: {
        ...defaultState,
        formData: {
          items: [{ order: 3 }, { order: 4 }, { order: 1 }],
        },
        lastUpdate: 1234,
      },
    };

    const expected = {
      ...defaultState,
      formData: {
        items: [{ order: 3 }, { order: 9, __STATUS__: 'EDITED' }, { order: 1 }],
      },
      hookUpdates: {
        [`${formId}_items_1_order`]: 1234,
      },
      lastUpdate: 1234,
    };

    // @ts-ignore
    expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
  });

  it('TYPE = UPDATE_FORM_VALUE (test diffs)', () => {
    const action = {
      type: UPDATE_FORM_VALUE,
      payload: { entityId, fieldId: `${formId}_items_1_order`, value: 9 },
    };

    const stateOverride = {
      [entityId]: {
        ...defaultState,
        entity: {
          name: 'John Doe',
          items: [
            { order: 3, name: 'item 1' },
            { order: 4, name: 'item 2' },
            { order: 1, name: 'item 3' },
          ],
        },
        formData: {
          name: 'John Doe',
          items: [
            { order: 3, name: 'item 1' },
            { order: 4, name: 'item 2' },
            { order: 1, name: 'item 3' },
          ],
        },
        lastUpdate: 1234,
      },
    };

    const newState = EntityReducer(stateOverride, action)[entityId];

    // @ts-ignore
    expect(newState.diffs).toEqual({
      [`${formId}_items_1_order`]: { prev: 4, current: 9 },
    });

    expect(newState.groupedDiffs).toEqual({
      [`${formId}_items_1`]: {
        prev: { order: 4, name: 'item 2' },
        current: { order: 9, name: 'item 2' },
      },
    });
  });

  it('TYPE = UPDATE_FORM_VALUE (test diffs 2)', () => {
    const action = {
      type: UPDATE_FORM_VALUE,
      payload: { entityId, fieldId: `${formId}_name`, value: 'Johannes Doe' },
    };

    const stateOverride = {
      [entityId]: {
        ...defaultState,
        entity: {
          name: 'John Doe',
          items: [
            { order: 3, name: 'item 1' },
            { order: 4, name: 'item 2' },
            { order: 1, name: 'item 3' },
          ],
        },
        formData: {
          name: 'John Doe',
          items: [
            { order: 3, name: 'item 1' },
            { order: 4, name: 'item 2' },
            { order: 1, name: 'item 3' },
          ],
        },
        diffs: { [`${formId}_items_1_order`]: { prev: 4, current: 9 } },
        groupedDiffs: {
          [`${formId}_items_1`]: {
            prev: { order: 4, name: 'item 2' },
            current: { order: 9, name: 'item 2' },
          },
        },
        lastUpdate: 1234,
      },
    };

    const newState = EntityReducer(stateOverride, action)[entityId];

    // @ts-ignore
    expect(newState.diffs).toEqual({
      [`${formId}_items_1_order`]: { prev: 4, current: 9 },
      [`${formId}_name`]: { prev: 'John Doe', current: 'Johannes Doe' },
    });

    expect(newState.groupedDiffs).toEqual({
      [`${formId}_items_1`]: {
        prev: { order: 4, name: 'item 2' },
        current: { order: 9, name: 'item 2' },
      },
      [`${formId}_name`]: { prev: 'John Doe', current: 'Johannes Doe' },
    });
  });

  it('TYPE = UPDATE_FORM_VALUE (test diffs 3)', () => {
    const action = {
      type: UPDATE_FORM_VALUE,
      payload: { entityId, fieldId: `${formId}_items_1_name`, value: 'New name' },
    };

    const stateOverride = {
      [entityId]: {
        ...defaultState,
        entity: {
          name: 'John Doe',
          items: [
            { order: 3, name: 'item 1' },
            { order: 4, name: 'item 2' },
            { order: 1, name: 'item 3' },
          ],
        },
        formData: {
          name: 'Johannes Doe',
          items: [
            { order: 3, name: 'item 1' },
            { order: 9, name: 'item 2' },
            { order: 1, name: 'item 3' },
          ],
        },
        diffs: {
          [`${formId}_items_1_order`]: { prev: 4, current: 9 },
          [`${formId}_name`]: { prev: 'John Doe', current: 'Johannes Doe' },
        },
        groupedDiffs: {
          [`${formId}_items_1`]: {
            prev: { order: 4, name: 'item 2' },
            current: { order: 9, name: 'item 2' },
          },
          [`${formId}_name`]: { prev: 'John Doe', current: 'Johannes Doe' },
        },
        lastUpdate: 1234,
      },
    };

    const newState = EntityReducer(stateOverride, action)[entityId];

    // @ts-ignore
    expect(newState.diffs).toEqual({
      [`${formId}_items_1_order`]: { prev: 4, current: 9 },
      [`${formId}_name`]: { prev: 'John Doe', current: 'Johannes Doe' },
      [`${formId}_items_1_name`]: { prev: 'item 2', current: 'New name' },
    });

    expect(newState.groupedDiffs).toEqual({
      [`${formId}_items_1`]: {
        prev: { order: 4, name: 'item 2' },
        current: { order: 9, name: 'New name' },
      },
      [`${formId}_name`]: { prev: 'John Doe', current: 'Johannes Doe' },
    });
  });

  it('TYPE = UPDATE_FORM_VALUE (test diffs 4)', () => {
    const action = {
      type: UPDATE_FORM_VALUE,
      payload: {
        entityId,
        fieldId: `${formId}_items_1`,
        value: { order: 9, name: 'New name' },
        metadata: { type: 'CANCEL' },
      },
    };

    const stateOverride = {
      [entityId]: {
        ...defaultState,
        entity: {
          name: 'John Doe',
          items: [
            { order: 3, name: 'item 1' },
            { order: 4, name: 'item 2' },
            { order: 1, name: 'item 3' },
          ],
        },
        formData: {
          name: 'Johannes Doe',
          items: [
            { order: 3, name: 'item 1' },
            { order: 9, name: 'Another name' },
            { order: 1, name: 'item 3' },
          ],
        },
        diffs: {
          [`${formId}_items_1_order`]: { prev: 4, current: 9 },
          [`${formId}_name`]: { prev: 'John Doe', current: 'Johannes Doe' },
          [`${formId}_items_1_name`]: { prev: 'item 2', current: 'Another name' },
        },
        groupedDiffs: {
          [`${formId}_items_1`]: {
            prev: { order: 4, name: 'item 2' },
            current: { order: 9, name: 'Another name' },
          },
          [`${formId}_name`]: { prev: 'John Doe', current: 'Johannes Doe' },
        },
        lastUpdate: 1234,
      },
    };

    const newState = EntityReducer(stateOverride, action)[entityId];

    // @ts-ignore
    // expect(newState.diffs).toEqual({
    //   [`${formId}_items_1_order`]: { prev: 4, current: 9 },
    //   [`${formId}_name`]: { prev: 'John Doe', current: 'Johannes Doe' },
    //   [`${formId}_items_1_name`]: { prev: 'item 2', current: 'Another name' },
    // });

    expect(newState.groupedDiffs).toEqual({
      [`${formId}_items_1`]: {
        prev: { order: 4, name: 'item 2' },
        current: { order: 9, name: 'New name' },
      },
      [`${formId}_name`]: { prev: 'John Doe', current: 'Johannes Doe' },
    });
  });

  it('TYPE = CLEAR_FORM_VALUES', () => {
    const action = {
      type: CLEAR_FORM_VALUES,
      payload: {
        entityId,
        fieldIds: [
          `${formId}_items_0_prop`,
          `${formId}_items_1_nested_inner2`,
          `${formId}_items_2_nested_inner2`,
        ],
      },
    };

    const stateOverride = {
      [entityId]: {
        ...defaultState,
        formData: {
          items: [
            { order: 3, prop: '11', nested: { inner1: '11', inner2: '21' } },
            { order: 4, prop: '21', nested: { inner1: '21', inner2: '22' } },
            { order: 1 },
          ],
        },
        lastUpdate: 1234,
        lastClearUpdate: 1234,
      },
    };

    const expected = {
      ...defaultState,
      formData: {
        items: [
          { order: 3, prop: undefined, nested: { inner1: '11', inner2: '21' } },
          { order: 4, prop: '21', nested: { inner1: '21', inner2: undefined } },
          { order: 1, nested: { inner2: undefined } },
        ],
      },
      lastUpdate: 1234,
      lastClearUpdate: 1234,
    };

    // @ts-ignore
    expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
  });

  it('TYPE = ADD_ARRAY_FIELD_ITEM', () => {
    const action = {
      type: ADD_ARRAY_FIELD_ITEM,
      payload: {
        entityId,
        fieldId: `${formId}_items`,
        item: { order: 5 },
      },
    };

    const stateOverride = {
      [entityId]: {
        ...defaultState,
        formData: {
          items: [{ order: 3 }, { order: 4 }, { order: 1 }],
        },
        lastUpdate: 1234,
      },
    };

    const expected = {
      ...defaultState,
      formData: {
        items: [{ order: 3 }, { order: 4 }, { order: 1 }, { order: 5, __STATUS__: 'ADDED' }],
      },
      lastUpdate: 1234,
    };

    // @ts-ignore
    expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
  });

  it('TYPE = ADD_ARRAY_FIELD_ITEMS', () => {
    const action = {
      type: ADD_ARRAY_FIELD_ITEMS,
      payload: {
        entityId,
        fieldId: `${formId}_items`,
        items: [{ order: 5 }, { order: 6 }],
      },
    };

    const stateOverride = {
      [entityId]: {
        ...defaultState,
        formData: {
          items: [{ order: 3 }, { order: 4 }, { order: 1 }],
        },
        lastUpdate: 1234,
      },
    };

    const expected = {
      ...defaultState,
      formData: {
        items: [{ order: 3 }, { order: 4 }, { order: 1 }, { order: 5 }, { order: 6 }],
      },
      lastUpdate: 1234,
    };

    // @ts-ignore
    expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
  });

  it('TYPE = REMOVE_ARRAY_FIELD_ITEM', () => {
    const action = {
      type: REMOVE_ARRAY_FIELD_ITEM,
      payload: {
        entityId,
        fieldId: `${formId}_items`,
        index: 2,
      },
    };

    const stateOverride = {
      [entityId]: {
        ...defaultState,
        formData: {
          items: [{ order: 3 }, { order: 4 }, { order: 1 }, { order: 5 }],
        },
        lastUpdate: 1234,
      },
    };

    const expected = {
      ...defaultState,
      formData: {
        items: [{ order: 3 }, { order: 4 }, { order: 5 }],
      },
      lastUpdate: 1234,
    };

    // @ts-ignore
    expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
  });

  it('TYPE = REMOVE_ARRAY_FIELD_ITEM (test diff)', () => {
    const action = {
      type: REMOVE_ARRAY_FIELD_ITEM,
      payload: {
        entityId,
        fieldId: `${formId}_items`,
        index: 2,
      },
    };

    const stateOverride = {
      [entityId]: {
        ...defaultState,
        formData: {
          items: [{ order: 3 }, { order: 4 }, { order: 1 }, { order: 5 }],
        },
        groupedDiffs: {
          [`${formId}_items_1`]: { prev: { order: 10 }, current: { order: 1 } },
          [`${formId}_items_2`]: { prev: { order: 10 }, current: { order: 1 } },
        },
        lastUpdate: 1234,
      },
    };

    const expected = {
      ...defaultState,
      formData: {
        items: [{ order: 3 }, { order: 4 }, { order: 5 }],
      },
      groupedDiffs: {
        [`${formId}_items_1`]: { prev: { order: 10 }, current: { order: 1 } },
      },
      lastUpdate: 1234,
    };

    // @ts-ignore
    expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
  });

  it('TYPE = CONCAT_TO_OBJECT, stringify = false', () => {
    const action = {
      type: CONCAT_TO_OBJECT,
      payload: {
        entityId,
        fieldId: `${formId}_x`,
        property: 'prop2',
        value: 'value2',
        stringify: false,
      },
    };

    const stateOverride = {
      [entityId]: {
        ...defaultState,
        formData: {
          x: {
            prop1: 'value1',
          },
        },
        lastUpdate: 1234,
      },
    };

    const expected = {
      ...defaultState,
      formData: {
        x: {
          prop1: 'value1',
          prop2: 'value2',
        },
      },
      lastUpdate: 1234,
    };

    // @ts-ignore
    expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
  });

  it('TYPE = CONCAT_TO_OBJECT, stringify = true', () => {
    const action = {
      type: CONCAT_TO_OBJECT,
      payload: {
        entityId,
        fieldId: `${formId}_x`,
        property: 'prop2',
        value: 'value2',
        stringify: true,
      },
    };

    const stateOverride = {
      [entityId]: {
        ...defaultState,
        formData: {
          x: JSON.stringify({
            prop1: 'value1',
          }),
        },
        lastUpdate: 1234,
      },
    };

    const expected = {
      ...defaultState,
      formData: {
        x: JSON.stringify({
          prop1: 'value1',
          prop2: 'value2',
        }),
      },
      lastUpdate: 1234,
    };

    // @ts-ignore
    expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
  });

  it('TYPE = SET_VALID_ON_DATE', () => {
    const action = {
      type: SET_VALID_ON_DATE,
      payload: { entityId, date: '03-05-2022' },
    };

    const expected = {
      ...defaultState,
      validOnDate: '03-05-2022',
    };

    expect(EntityReducer(state, action)[entityId]).toEqual(expected);
  });

  it('TYPE = SET_TEMPORARY_ATTACHMENT', () => {
    const action = {
      type: SET_TEMPORARY_ATTACHMENT,
      payload: {
        entityId,
        attachment: { id: 'id', fileName: 'name' },
      },
    };

    // @ts-ignore
    expect(EntityReducer(defaultState, action)[entityId]?.attachment).toEqual({
      id: 'id',
      fileName: 'name',
    });
  });

  describe('Array Item Status Tracking', () => {
    it('TYPE = ADD_ARRAY_FIELD_ITEM', () => {
      const action = {
        type: ADD_ARRAY_FIELD_ITEM,
        payload: {
          entityId,
          fieldId: `${formId}_items`,
          item: { order: 5 },
        },
      };

      const stateOverride = {
        [entityId]: {
          ...defaultState,
          formData: {
            items: [{ order: 3 }, { order: 4 }, { order: 1 }],
          },
          lastUpdate: 1234,
        },
      };

      const expected = {
        ...defaultState,
        formData: {
          items: [{ order: 3 }, { order: 4 }, { order: 1 }, { order: 5, __STATUS__: 'ADDED' }],
        },
        lastUpdate: 1234,
      };

      // @ts-ignore
      expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
    });

    describe('TYPE = UPDATE_FORM_VALUE (with status tracking)', () => {
      it('should mark existing item as EDITED when modified', () => {
        const action = {
          type: UPDATE_FORM_VALUE,
          payload: {
            entityId,
            fieldId: `${formId}_items_0_name`,
            value: 'Modified Item 1',
          },
        };

        const stateOverride = {
          [entityId]: {
            ...defaultState,
            formData: {
              items: [
                { order: 3, name: 'Item 1' }, // Existing item without status
                { order: 4, name: 'Item 2' },
              ],
            },
            lastUpdate: 1234,
          },
        };

        const expected = {
          ...defaultState,
          formData: {
            items: [
              { order: 3, name: 'Modified Item 1', __STATUS__: 'EDITED' },
              { order: 4, name: 'Item 2' },
            ],
          },
          hookUpdates: {
            [`${formId}_items_0_name`]: 0,
          },
          lastUpdate: 1234,
        };

        const newState = EntityReducer(stateOverride, action)[entityId];

        expect(newState.formData).toEqual(expected.formData);
        expect(newState.hookUpdates).toEqual(expected.hookUpdates);
      });

      it('should NOT change status when modifying ADDED item', () => {
        const action = {
          type: UPDATE_FORM_VALUE,
          payload: {
            entityId,
            fieldId: `${formId}_items_1_name`,
            value: 'Modified Added Item',
          },
        };

        const stateOverride = {
          [entityId]: {
            ...defaultState,
            formData: {
              items: [
                { order: 3, name: 'Item 1' },
                { order: 4, name: 'Added Item', __STATUS__: 'ADDED' }, // Already ADDED
              ],
            },
            lastUpdate: 1234,
          },
        };

        const expected = {
          ...defaultState,
          formData: {
            items: [
              { order: 3, name: 'Item 1' },
              { order: 4, name: 'Modified Added Item', __STATUS__: 'ADDED' }, // Status remains ADDED
            ],
          },
          hookUpdates: {
            [`${formId}_items_1_name`]: 0,
          },
          lastUpdate: 1234,
        };

        const newState = EntityReducer(stateOverride, action)[entityId];

        expect(newState.formData).toEqual(expected.formData);
      });

      it('should NOT mark as EDITED when value is the same', () => {
        const action = {
          type: UPDATE_FORM_VALUE,
          payload: {
            entityId,
            fieldId: `${formId}_items_0_name`,
            value: 'Item 1', // Same value
          },
        };

        const stateOverride = {
          [entityId]: {
            ...defaultState,
            formData: {
              items: [
                { order: 3, name: 'Item 1' }, // No status initially
                { order: 4, name: 'Item 2' },
              ],
            },
            lastUpdate: 1234,
          },
        };

        const expected = {
          ...defaultState,
          formData: {
            items: [
              { order: 3, name: 'Item 1' }, // No status change
              { order: 4, name: 'Item 2' },
            ],
          },
          hookUpdates: {
            [`${formId}_items_0_name`]: 0,
          },
          lastUpdate: 1234,
        };

        const newState = EntityReducer(stateOverride, action)[entityId];

        expect(newState.formData).toEqual(expected.formData);
      });

      it('should mark already EDITED item as EDITED when modified again', () => {
        const action = {
          type: UPDATE_FORM_VALUE,
          payload: {
            entityId,
            fieldId: `${formId}_items_0_name`,
            value: 'Modified Again',
          },
        };

        const stateOverride = {
          [entityId]: {
            ...defaultState,
            formData: {
              items: [
                { order: 3, name: 'Modified Item 1', __STATUS__: 'EDITED' }, // Already edited
                { order: 4, name: 'Item 2' },
              ],
            },
            lastUpdate: 1234,
          },
        };

        const expected = {
          ...defaultState,
          formData: {
            items: [
              { order: 3, name: 'Modified Again', __STATUS__: 'EDITED' }, // Still EDITED
              { order: 4, name: 'Item 2' },
            ],
          },
          hookUpdates: {
            [`${formId}_items_0_name`]: 0,
          },
          lastUpdate: 1234,
        };

        const newState = EntityReducer(stateOverride, action)[entityId];

        expect(newState.formData).toEqual(expected.formData);
      });

      it('should handle nested object properties in arrays', () => {
        const action = {
          type: UPDATE_FORM_VALUE,
          payload: {
            entityId,
            fieldId: `${formId}_items_0_nested_prop`,
            value: 'new nested value',
          },
        };

        const stateOverride = {
          [entityId]: {
            ...defaultState,
            formData: {
              items: [
                {
                  order: 3,
                  name: 'Item 1',
                  nested: { prop: 'old nested value' },
                },
                { order: 4, name: 'Item 2' },
              ],
            },
            lastUpdate: 1234,
          },
        };

        const expected = {
          ...defaultState,
          formData: {
            items: [
              {
                order: 3,
                name: 'Item 1',
                nested: { prop: 'new nested value' },
                __STATUS__: 'EDITED',
              },
              { order: 4, name: 'Item 2' },
            ],
          },
          hookUpdates: {
            [`${formId}_items_0_nested_prop`]: 0,
          },
          lastUpdate: 1234,
        };

        const newState = EntityReducer(stateOverride, action)[entityId];

        expect(newState.formData).toEqual(expected.formData);
      });

      it('should NOT affect non-array field updates', () => {
        const action = {
          type: UPDATE_FORM_VALUE,
          payload: {
            entityId,
            fieldId: `${formId}_simpleField`,
            value: 'new value',
          },
        };

        const stateOverride = {
          [entityId]: {
            ...defaultState,
            formData: {
              simpleField: 'old value',
              items: [
                { order: 3, name: 'Item 1' },
                { order: 4, name: 'Item 2' },
              ],
            },
            lastUpdate: 1234,
          },
        };

        const expected = {
          ...defaultState,
          formData: {
            simpleField: 'new value',
            items: [
              { order: 3, name: 'Item 1' },
              { order: 4, name: 'Item 2' },
            ],
          },
          hookUpdates: {
            [`${formId}_simpleField`]: 0,
          },
          lastUpdate: 1234,
        };

        const newState = EntityReducer(stateOverride, action)[entityId];

        expect(newState.formData).toEqual(expected.formData);
      });
    });

    describe('Mixed Status Scenarios', () => {
      it('should handle array with mixed status items', () => {
        const action = {
          type: ADD_ARRAY_FIELD_ITEM,
          payload: {
            entityId,
            fieldId: `${formId}_items`,
            item: { order: 6, name: 'Another New Item' },
          },
        };

        const stateOverride = {
          [entityId]: {
            ...defaultState,
            formData: {
              items: [
                { order: 3, name: 'Original Item' },
                { order: 4, name: 'Modified Item', __STATUS__: 'EDITED' },
                { order: 5, name: 'Added Item', __STATUS__: 'ADDED' },
              ],
            },
            lastUpdate: 1234,
          },
        };

        const expected = {
          ...defaultState,
          formData: {
            items: [
              { order: 3, name: 'Original Item' },
              { order: 4, name: 'Modified Item', __STATUS__: 'EDITED' },
              { order: 5, name: 'Added Item', __STATUS__: 'ADDED' },
              { order: 6, name: 'Another New Item', __STATUS__: 'ADDED' },
            ],
          },
          lastUpdate: 1234,
        };

        expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
      });
    });
  });

  describe('TYPE = CALL_API_FULFILLED -> apiResponseToFormFields', () => {
    it('should map API response data to form field', () => {
      const action = {
        type: CALL_API_FULFILLED,
        payload: {
          data: {
            response: {
              value: 'NEW_VALUE',
            },
          },
          metadata: {
            parentId: formId,
            resourceToFormFields: [
              {
                dataPath: ['response', 'value'],
                fieldPath: {
                  code: 'EntityName',
                  jsonPath: ['targetField'],
                },
              },
            ],
          },
        },
      };

      const stateOverride = {
        EntityName: {
          ...defaultState,
          formData: {
            targetField: 'OLD_VALUE',
          },
          hookUpdates: {},
        },
      };

      const result = EntityReducer(stateOverride, action);

      expect(result.EntityName.formData.targetField).toEqual('NEW_VALUE');
    });

    it('should not modify state when slice does not exist', () => {
      const action = {
        type: CALL_API_FULFILLED,
        payload: {
          data: { response: { value: 'NEW_VALUE' } },
          metadata: {
            parentId: 'EntityName_attributes_0_button',
            resourceToFormFields: [
              {
                dataPath: ['response', 'value'],
                fieldPath: {
                  code: 'UNKNOWN_SLICE',
                  jsonPath: ['targetField'],
                },
              },
            ],
          },
        },
      };

      const result = EntityReducer(state, action);

      expect(result).toEqual(state);
    });

    it('should return state when parentId is missing', () => {
      const action = {
        type: CALL_API_FULFILLED,
        payload: {
          data: { response: { value: 'NEW_VALUE' } },
          metadata: {
            resourceToFormFields: [], // truthy → reducer will call the function
            parentId: undefined, // triggers the guard inside
          },
        },
      };

      const result = EntityReducer(state, action);

      expect(result).toEqual(state);
    });
  });

  describe('TYPE = CALL_API_FULFILLED - apiResponseAsEntity (MessageViewerWidget payload)', () => {
    const messageEntityId = 'MessageEntity';

    beforeEach(() => {
      window['transformDataFromServer'] = (_, data) => data;
      window['FALLBACK_SCHEMAS'] = {
        [messageEntityId]: {
          pageUiSchema: {
            payload: { 'ui:widget': 'MessageViewerWidget' },
          },
        },
      };
    });

    afterEach(() => {
      delete window['transformDataFromServer'];
      delete window['FALLBACK_SCHEMAS'];
    });

    const buildAction = (data) => ({
      type: CALL_API_FULFILLED,
      payload: {
        data,
        metadata: { resourceToEntity: messageEntityId },
      },
    });

    const buildState = () => ({
      [messageEntityId]: {
        ...defaultState,
        entityStoreId: messageEntityId,
      },
    });

    it('should stringify an object payload so RJSF does not drop the string-typed field', () => {
      const jsonPayload = { foo: 'bar', nested: { baz: 1 } };

      const result = EntityReducer(
        buildState(),
        buildAction({ id: 'some-id', payload: jsonPayload }),
      );

      expect(typeof result[messageEntityId].formData.payload).toBe('string');
      expect(JSON.parse(result[messageEntityId].formData.payload)).toEqual(jsonPayload);
      expect(result[messageEntityId].entity.payload).toBe(result[messageEntityId].formData.payload);
    });

    it('should leave an already-string payload (e.g. XML) untouched', () => {
      const xmlPayload = '<root><foo>bar</foo></root>';

      const result = EntityReducer(
        buildState(),
        buildAction({ id: 'some-id', payload: xmlPayload }),
      );

      expect(result[messageEntityId].formData.payload).toBe(xmlPayload);
    });

    it('should not stringify fields that are not MessageViewerWidget fields', () => {
      window['FALLBACK_SCHEMAS'] = {
        [messageEntityId]: {
          pageUiSchema: {
            payload: { 'ui:widget': 'MessageViewerWidget' },
            otherObject: { 'ui:widget': 'SomeOtherWidget' },
          },
        },
      };

      const otherObject = { keep: 'me' };

      const result = EntityReducer(
        buildState(),
        buildAction({ id: 'some-id', payload: { a: 1 }, otherObject }),
      );

      expect(typeof result[messageEntityId].formData.payload).toBe('string');
      expect(result[messageEntityId].formData.otherObject).toEqual(otherObject);
    });

    it('should still stringify in the catch fallback when transformDataFromServer throws', () => {
      window['transformDataFromServer'] = () => {
        throw new Error('Transformation error');
      };

      const jsonPayload = { foo: 'bar', nested: { baz: 1 } };

      const result = EntityReducer(
        buildState(),
        buildAction({ id: 'some-id', payload: jsonPayload }),
      );

      expect(typeof result[messageEntityId].formData.payload).toBe('string');
      expect(JSON.parse(result[messageEntityId].formData.payload)).toEqual(jsonPayload);
      expect(result[messageEntityId].entity.payload).toBe(result[messageEntityId].formData.payload);
    });
  });

  describe('TYPE = CLEAR_STEPPER_FORM', () => {
    beforeAll(() => {
      if (typeof structuredClone !== 'function') {
        globalThis.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
      }
    });

    it('should clone formData, clear specified stepper fields, and update timestamps', () => {
      const action = {
        type: CLEAR_STEPPER_FORM,
        payload: {
          entityId,
          parentId: 'prefix_step1',
          groups: [{ widgets: ['firstName', 'age'] }],
        },
      };

      const stateOverride = {
        [entityId]: {
          ...defaultState,
          formData: {
            step1: {
              firstName: 'John',
              lastName: 'Doe',
              age: 30,
            },
            step2: {
              unrelated: true,
            },
          },
          lastUpdate: 0,
          lastClearUpdate: 0,
        },
      };

      const expected = {
        ...defaultState,
        formData: {
          step1: {
            firstName: undefined,
            lastName: 'Doe',
            age: undefined,
          },
          step2: {
            unrelated: true,
          },
        },
        lastUpdate: 1234,
        lastClearUpdate: 1234,
      };

      // @ts-ignore
      expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
    });

    it('should handle undefined formData gracefully using fallback {}', () => {
      const action = {
        type: CLEAR_STEPPER_FORM,
        payload: {
          entityId,
          parentId: 'prefix_step1',
          groups: [{ widgets: ['firstName'] }],
        },
      };

      const stateOverride = {
        [entityId]: {
          ...defaultState,
          formData: undefined,
          lastUpdate: 0,
          lastClearUpdate: 0,
        },
      };

      const expected = {
        ...defaultState,
        formData: {},
        lastUpdate: 1234,
        lastClearUpdate: 1234,
      };

      // @ts-ignore
      expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
    });

    it('should skip non-editable top-level widget when readOnlyWidgets is provided', () => {
      const action = {
        type: CLEAR_STEPPER_FORM,
        payload: {
          entityId,
          parentId: 'prefix_step1',
          groups: [{ widgets: ['firstName', 'lastName', 'age'] }],
          readOnlyWidgets: new Set(['lastName']),
        },
      };
      const stateOverride = {
        [entityId]: {
          ...defaultState,
          formData: { step1: { firstName: 'John', lastName: 'Doe', age: 30 } },
          lastUpdate: 0,
          lastClearUpdate: 0,
        },
      };
      const expected = {
        ...defaultState,
        formData: { step1: { firstName: undefined, lastName: 'Doe', age: undefined } },
        lastUpdate: 1234,
        lastClearUpdate: 1234,
      };
      // @ts-ignore
      expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
    });
    it('should preserve deeply nested field when its leaf key is in readOnlyWidgets', () => {
      const action = {
        type: CLEAR_STEPPER_FORM,
        payload: {
          entityId,
          parentId: 'prefix_step1',
          groups: [{ widgets: ['regNatPerBasicInfo'] }],
          readOnlyWidgets: new Set(['regNatPerName']),
        },
      };
      const stateOverride = {
        [entityId]: {
          ...defaultState,
          formData: {
            step1: {
              regNatPerBasicInfo: {
                regNatPerBasicData: {
                  regNatPerName: 'John Doe',
                  regNatPerAddress: '123 Main St',
                },
              },
            },
          },
          lastUpdate: 0,
          lastClearUpdate: 0,
        },
      };
      const expected = {
        ...defaultState,
        formData: {
          step1: {
            regNatPerBasicInfo: {
              regNatPerBasicData: {
                regNatPerName: 'John Doe',
                regNatPerAddress: undefined,
              },
            },
          },
        },
        lastUpdate: 1234,
        lastClearUpdate: 1234,
      };
      // @ts-ignore
      expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
    });
    it('should preserve entire subtree when parent object key is in readOnlyWidgets', () => {
      const action = {
        type: CLEAR_STEPPER_FORM,
        payload: {
          entityId,
          parentId: 'prefix_step1',
          groups: [{ widgets: ['regNatPerBasicInfo'] }],
          readOnlyWidgets: new Set(['regNatPerBasicData']),
        },
      };
      const stateOverride = {
        [entityId]: {
          ...defaultState,
          formData: {
            step1: {
              regNatPerBasicInfo: {
                regNatPerBasicData: {
                  regNatPerName: 'John Doe',
                  regNatPerAddress: '123 Main St',
                },
              },
            },
          },
          lastUpdate: 0,
          lastClearUpdate: 0,
        },
      };
      const expected = {
        ...defaultState,
        formData: {
          step1: {
            regNatPerBasicInfo: {
              regNatPerBasicData: {
                regNatPerName: 'John Doe',
                regNatPerAddress: '123 Main St',
              },
            },
          },
        },
        lastUpdate: 1234,
        lastClearUpdate: 1234,
      };
      // @ts-ignore
      expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
    });
    it('should clear all fields when readOnlyWidgets is empty Set', () => {
      const action = {
        type: CLEAR_STEPPER_FORM,
        payload: {
          entityId,
          parentId: 'prefix_step1',
          groups: [{ widgets: ['firstName', 'age'] }],
          readOnlyWidgets: new Set(),
        },
      };
      const stateOverride = {
        [entityId]: {
          ...defaultState,
          formData: { step1: { firstName: 'John', age: 30 } },
          lastUpdate: 0,
          lastClearUpdate: 0,
        },
      };
      const expected = {
        ...defaultState,
        formData: { step1: { firstName: undefined, age: undefined } },
        lastUpdate: 1234,
        lastClearUpdate: 1234,
      };
      // @ts-ignore
      expect(EntityReducer(stateOverride, action)[entityId]).toEqual(expected);
    });
  });
});
