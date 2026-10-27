import {
  selectEntity,
  selectError,
  selectFormData,
  selectIsNewEntity,
  selectLoading,
  selectErrorMessage,
  selectFieldUpdate,
  selectValidOnDate,
  selectLastClearUpdate,
  selectDiffsData,
  selectGroupedDiffsData,
  selectHasChanges,
} from './selectors';
import { AnyType } from '@pkg-common/types';

const entityId = 'FORM';
const entitiesStore = 'Entities';

const state = {
  [entitiesStore]: {
    [entityId]: {
      isNew: false,
      entity: {
        id: 'string',
        code: 'string',
      },
      formData: {
        prop: 'value',
      },
      error: {
        message: 'error',
      },
      loading: true,
      hookUpdates: {
        prop: 4,
      },
      validOnDate: '11-05-2024',
      lastClearUpdate: 1234,
      diffs: {
        [`${entityId}_prop`]: { prev: 1, current: 2 },
      },
      groupedDiffs: {
        [`${entityId}`]: { prev: 1, current: 2 },
      },
    },
  },
} as AnyType;

describe('Entity Selectors', () => {
  it('selectEntity', () => {
    const expected = state[entitiesStore][entityId].entity;
    expect(selectEntity(entityId)(state)).toEqual(expected);
  });

  it('selectIsNewEntity', () => {
    const expected = state[entitiesStore][entityId].isNew;
    expect(selectIsNewEntity(entityId)(state)).toEqual(expected);
  });

  it('selectLoading', () => {
    const expected = state[entitiesStore][entityId].loading;
    expect(selectLoading(entityId)(state)).toEqual(expected);
  });

  it('selectFormData', () => {
    const expected = state[entitiesStore][entityId].formData;
    expect(selectFormData(entityId)(state)).toEqual(expected);
  });

  it('selectError', () => {
    const expected = state[entitiesStore][entityId].error;
    expect(selectError(entityId)(state)).toEqual(expected);
  });

  it('selectErrorMessage', () => {
    const expected = state[entitiesStore][entityId].error.message;
    expect(selectErrorMessage(entityId)(state)).toEqual(expected);
  });

  it('selectFieldUpdate', () => {
    const fieldId = 'prop';
    const expected = state[entitiesStore][entityId].hookUpdates[fieldId];
    expect(selectFieldUpdate(entityId, fieldId)(state)).toEqual(expected);
  });

  it('selectValidOnDate', () => {
    const expected = state[entitiesStore][entityId].validOnDate;
    expect(selectValidOnDate(entityId)(state)).toEqual(expected);
  });

  it('selectLastClearUpdate', () => {
    const expected = state[entitiesStore][entityId].lastClearUpdate;
    expect(selectLastClearUpdate(entityId)(state)).toEqual(expected);
  });

  it('selectDiffsData', () => {
    const expected = state[entitiesStore][entityId].diffs;
    expect(selectDiffsData(entityId)(state)).toEqual(expected);
  });

  it('selectGroupedDiffsData', () => {
    const expected = state[entitiesStore][entityId].groupedDiffs;
    expect(selectGroupedDiffsData(entityId)(state)).toEqual(expected);
  });

  describe('selectHasChanges', () => {
    it('when differences exist', () => {
      expect(selectHasChanges(entityId)(state)).toEqual(true);
    });

    it('when there are no differences', () => {
      const state = {
        [entitiesStore]: {
          [entityId]: {
            groupedDiffs: {},
          },
        },
      } as AnyType;
      expect(selectHasChanges(entityId)(state)).toEqual(false);
    });
  });
});
