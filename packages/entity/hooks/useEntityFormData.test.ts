import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { ClearEntityFormData, SetEntityFormData } from '@pkg-entity/redux/actions';
import { renderHook } from '@testing-library/react';
import { getMockWrapperAndStore, getMockWrapper } from '@_jestHelpers/reactMockStore';

describe('useEntityFormData', () => {
  const entityId = 'ENTITY_ID';
  const entitiesStore = 'Entities';

  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should return formData', () => {
    const storeData = { [entitiesStore]: { [entityId]: { formData: 'id' } } };
    const wrapper = getMockWrapper(storeData);

    const { result } = renderHook(() => useEntityFormData(entityId), { wrapper });
    const { formData } = result.current;

    expect(formData).toEqual('id');
  });

  it('should return diffs', () => {
    const storeData = {
      [entitiesStore]: {
        [entityId]: {
          formData: 'id',
          diffs: {
            [`${entityId}_prop`]: { prev: 1, current: 2 },
          },
          groupedDiffs: {
            [`${entityId}`]: { prev: 1, current: 2 },
          },
        },
      },
    };
    const wrapper = getMockWrapper(storeData);

    const { result } = renderHook(() => useEntityFormData(entityId), { wrapper });
    const { diffs } = result.current;

    expect(diffs).toEqual({
      [`${entityId}_prop`]: { prev: 1, current: 2 },
    });
  });

  it('should return groupedDiffs', () => {
    const storeData = {
      [entitiesStore]: {
        [entityId]: {
          formData: 'id',
          diffs: {
            [`${entityId}_prop`]: { prev: 1, current: 2 },
          },
          groupedDiffs: {
            [`${entityId}`]: { prev: 1, current: 2 },
          },
        },
      },
    };
    const wrapper = getMockWrapper(storeData);

    const { result } = renderHook(() => useEntityFormData(entityId), { wrapper });
    const { groupedDiffs } = result.current;

    expect(groupedDiffs).toEqual({
      [`${entityId}`]: { prev: 1, current: 2 },
    });
  });

  it('should return hasChanges (true)', () => {
    const storeData = {
      [entitiesStore]: {
        [entityId]: {
          formData: 'id',
          diffs: {
            [`${entityId}_prop`]: { prev: 1, current: 2 },
          },
          groupedDiffs: {
            [`${entityId}`]: { prev: 1, current: 2 },
          },
        },
      },
    };
    const wrapper = getMockWrapper(storeData);

    const { result } = renderHook(() => useEntityFormData(entityId), { wrapper });
    const { hasChanges } = result.current;

    expect(hasChanges).toEqual(true);
  });

  it('should return hasChanges (false)', () => {
    const storeData = {
      [entitiesStore]: {
        [entityId]: {
          formData: 'id',
          diffs: {},
          groupedDiffs: {},
        },
      },
    };
    const wrapper = getMockWrapper(storeData);

    const { result } = renderHook(() => useEntityFormData(entityId), { wrapper });
    const { hasChanges } = result.current;

    expect(hasChanges).toEqual(false);
  });

  it('should dispatch action SetEntityFormData when "setEntityFormData" is called', () => {
    const data = { id: 'id' };
    const concat = false;
    const storeData = { [entitiesStore]: { [entityId]: {} } };
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);

    const { result } = renderHook(() => useEntityFormData(entityId), { wrapper });
    const { setEntityFormData } = result.current;

    setEntityFormData(data, false);

    expect(dispatchStub).toHaveBeenCalledWith(
      SetEntityFormData({
        entityId,
        data,
        concat,
      }),
    );
  });

  it('should dispatch action ClearEntityFormData when "clearEntityFormData" is called', () => {
    const storeData = { [entitiesStore]: { [entityId]: {} } };
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useEntityFormData(entityId), { wrapper });
    const { clearEntityFormData } = result.current;

    clearEntityFormData();

    expect(dispatchStub).toHaveBeenCalledWith(
      ClearEntityFormData({
        entityId,
      }),
    );
  });
});
