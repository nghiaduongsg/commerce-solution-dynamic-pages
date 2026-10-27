import { renderHook, act } from '@testing-library/react';
import useFormArrayFieldSelections from './useFormArrayFieldSelections';
import { SelectArrayItems, DeselectArrayItems } from '@pkg-entity/redux/actions';
import { getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';
describe('useFormArrayFieldSelections (full state, no selector mock)', () => {
  const entityId = 'form123';
  const fieldId = 'form123_fieldX';

  beforeEach(() => {
    mockStore.clearActions();
  });

  const storeData = {
    Entities: {
      [entityId]: {
        entityStoreId: entityId,
        isNew: true,
        entity: { givenReportedFormData: {} },
        formData: {
          givenReportedFormData: {
            form123_fieldX: [
              { __index: 0, name: 'item1' },
              { __index: 2, name: 'item2' },
            ],
          },
        },
        lastUpdate: Date.now(),
        entityIdKey: 'id',
        url: 'registration/parties',
        entityDataAreaKey: 'partyDataArea',
      },
    },
  };

  const { wrapper, mockStore } = getMockWrapperAndStore(storeData);

  it('should dispatch SelectArrayItems correctly', () => {
    const { result } = renderHook(() => useFormArrayFieldSelections(fieldId), { wrapper });

    act(() => {
      result.current.selectArrayItems([1, 2], true);
    });

    expect(mockStore.getActions()).toContainEqual(
      SelectArrayItems({
        entityId,
        fieldId,
        indices: [1, 2],
        multiple: true,
      }),
    );
  });

  it('should dispatch DeselectArrayItems correctly', () => {
    const { result } = renderHook(() => useFormArrayFieldSelections(fieldId), { wrapper });

    act(() => {
      result.current.deselectArrayItems([0]);
    });

    expect(mockStore.getActions()).toContainEqual(
      DeselectArrayItems({
        entityId,
        fieldId,
        indices: [0],
      }),
    );
  });
});
