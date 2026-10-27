import useEntity from '@pkg-entity/hooks/useEntity';
import { getMockWrapper, getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';
import {
  ClearEntity,
  ClearEntityError,
  DeleteEntity,
  SaveEntity,
  SetEntity,
  SetTemporaryAttachment,
  SetValidOnDate,
  ClearStepperForm,
} from '@pkg-entity/redux/actions';
import { renderHook } from '@testing-library/react';
import { getFormIdFromWidgetId } from '@pkg-common/utils';

jest.mock('@pkg-common/utils', () => ({
  ...jest.requireActual('@pkg-common/utils'),
  getFormIdFromWidgetId: jest.fn(),
}));

describe('useEntity', () => {
  const entitiesStore = 'Entities';
  const entityId = 'ENTITY_ID';

  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should return entity', () => {
    const storeData = { [entitiesStore]: { [entityId]: { entity: 'entity' } } };
    const wrapper = getMockWrapper(storeData);

    const { result } = renderHook(() => useEntity(entityId), { wrapper });

    expect(result.current.entity).toEqual('entity');
  });

  it('should return isNew', () => {
    const storeData = { [entitiesStore]: { [entityId]: { isNew: true } } };
    const wrapper = getMockWrapper(storeData);

    const { result } = renderHook(() => useEntity(entityId), { wrapper });
    const { isNew } = result.current;
    expect(isNew).toEqual(true);
  });

  it('should return error', () => {
    const storeData = { [entitiesStore]: { [entityId]: { error: 'error' } } };
    const wrapper = getMockWrapper(storeData);
    const { result } = renderHook(() => useEntity(entityId), { wrapper });

    const { error } = result.current;

    expect(error).toEqual('error');
  });

  it('should return errorMessage', () => {
    const storeData = { [entitiesStore]: { [entityId]: { error: { message: 'error' } } } };
    const wrapper = getMockWrapper(storeData);
    const { result } = renderHook(() => useEntity(entityId), { wrapper });
    const { errorMessage } = result.current;

    expect(errorMessage).toEqual('error');
  });

  it('should return loading', () => {
    const storeData = { [entitiesStore]: { [entityId]: { loading: true } } };
    const wrapper = getMockWrapper(storeData);
    const { result } = renderHook(() => useEntity(entityId), { wrapper });
    const { loading } = result.current;

    expect(loading).toEqual(true);
  });

  it('should return validOnDate', () => {
    const storeData = { [entitiesStore]: { [entityId]: { validOnDate: '25-03-2017' } } };
    const wrapper = getMockWrapper(storeData);
    const { result } = renderHook(() => useEntity(entityId), { wrapper });
    const { validOnDate } = result.current;

    expect(validOnDate).toEqual('25-03-2017');
  });

  it('should return serverUpdate', () => {
    const storeData = { [entitiesStore]: { [entityId]: { serverUpdate: 1234 } } };
    const wrapper = getMockWrapper(storeData);
    const { result } = renderHook(() => useEntity(entityId), { wrapper });
    const { serverUpdate } = result.current;

    expect(serverUpdate).toEqual(1234);
  });

  it('should dispatch action SaveEntity when "saveEntity" is called', () => {
    const uiSchema = {};
    const storeData = { [entitiesStore]: { [entityId]: { isNew: true } } };

    const { mockStore, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useEntity(entityId), { wrapper });
    const { saveEntity } = result.current;

    saveEntity(uiSchema);

    expect(mockStore.getActions()).toEqual([
      SaveEntity({
        entityId,
        uiSchema,
      }),
    ]);
  });

  it('should dispatch action DeleteEntity when "deleteEntity" is called with isDynamicQuery parameter set to false', () => {
    const code = 'code';
    const storeData = { [entitiesStore]: { [entityId]: { code: 'code' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);

    const { result } = renderHook(() => useEntity(entityId), { wrapper });
    const { deleteEntity } = result.current;

    deleteEntity(code);

    expect(dispatchStub).toHaveBeenCalledWith(
      DeleteEntity({
        entityId,
        code,
      }),
    );
  });

  it('should dispatch action ClearEntity when "clearEntity" is called', () => {
    const storeData = { [entitiesStore]: { [entityId]: {} } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useEntity(entityId), { wrapper });
    const { clearEntity } = result.current;

    clearEntity();

    expect(dispatchStub).toHaveBeenCalledWith(
      ClearEntity({
        entityId,
      }),
    );
  });

  it('should dispatch action SetEntity when "setEntity" is called', () => {
    const initialEntityData = { id: 'id' };
    const storeData = { [entitiesStore]: { [entityId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useEntity(entityId), { wrapper });
    const { setEntity } = result.current;

    setEntity(initialEntityData);

    expect(dispatchStub).toHaveBeenCalledWith(
      SetEntity({
        entityId,
        initialEntityData,
      }),
    );
  });

  it('should dispatch action SetValidOnDate when "setValidOnDate" is called', () => {
    const storeData = { [entitiesStore]: { [entityId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useEntity(entityId), { wrapper });
    const { setValidOnDate } = result.current;

    setValidOnDate('12-05-2014');

    expect(dispatchStub).toHaveBeenCalledWith(
      SetValidOnDate({
        entityId,
        date: '12-05-2014',
      }),
    );
  });

  it('should dispatch action SetTemporaryAttachment when "setTemporaryAttachment" is called', () => {
    const storeData = { [entitiesStore]: { [entityId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useEntity(entityId), { wrapper });
    const { setTemporaryAttachment } = result.current;

    const attachment = { file: 'test.pdf', size: 1024 };
    setTemporaryAttachment(attachment);

    expect(dispatchStub).toHaveBeenCalledWith(
      SetTemporaryAttachment({
        entityId,
        attachment,
      }),
    );
  });

  it('should dispatch action ClearEntityError when "clearEntityError" is called', () => {
    const storeData = { [entitiesStore]: { [entityId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useEntity(entityId), { wrapper });
    const { clearEntityError } = result.current;

    clearEntityError();

    expect(dispatchStub).toHaveBeenCalledWith(ClearEntityError({ entityId }));
  });

  it('should dispatch action CallApi when "callApi" is called', () => {
    const storeData = { [entitiesStore]: { [entityId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useEntity(entityId), { wrapper });
    const { callApi } = result.current;

    const payload = { url: '/api/test', method: 'GET' };
    callApi(payload);

    expect(dispatchStub).toHaveBeenCalledTimes(1);
  });

  it('should not dispatch ClearStepperForm when "clearFormSteps" is called with empty steps', () => {
    const storeData = { [entitiesStore]: { [entityId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useEntity(entityId), { wrapper });
    const { clearFormSteps } = result.current;

    clearFormSteps([], 0, false);

    expect(dispatchStub).not.toHaveBeenCalled();
  });

  it('should not dispatch ClearStepperForm when "clearFormSteps" is called but entityId is falsy', () => {
    const storeData = { [entitiesStore]: {} };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);

    const { result } = renderHook(() => useEntity(''), { wrapper });
    const { clearFormSteps } = result.current;

    clearFormSteps([{ id: 'step1', groups: ['group1'] }], 0, false);

    expect(dispatchStub).not.toHaveBeenCalled();
  });

  it('should dispatch action ClearStepperForm when "clearFormSteps" is called with valid steps', () => {
    const storeData = { [entitiesStore]: { [entityId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);

    const mockFormId = 'FORM_ID_123';
    (getFormIdFromWidgetId as jest.Mock).mockReturnValue(mockFormId);

    const { result } = renderHook(() => useEntity(entityId), { wrapper });
    const { clearFormSteps } = result.current;

    const steps = [
      { id: 'step1', groups: ['groupA', 'groupB'] },
      { id: 'step2', groups: ['groupC'] },
      { id: 'step3' },
    ];

    clearFormSteps(steps, 0, false);

    expect(getFormIdFromWidgetId).toHaveBeenCalledWith(entityId);
    expect(dispatchStub).toHaveBeenCalledWith(
      ClearStepperForm({
        entityId: mockFormId,
        parentId: entityId,
        groups: ['groupA', 'groupB', 'groupC'],
        readOnlyWidgets: new Set(),
      }),
    );
  });

  it('should dispatch action ClearStepperForm when "clearFormSteps" is called with valid steps and configured with clear per-tab', () => {
    const storeData = { [entitiesStore]: { [entityId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);

    const mockFormId = 'FORM_ID_123';
    (getFormIdFromWidgetId as jest.Mock).mockReturnValue(mockFormId);

    const { result } = renderHook(() => useEntity(entityId), { wrapper });
    const { clearFormSteps } = result.current;

    const steps = [
      {
        id: 'step1',
        groups: [
          {
            key: 'step1KeyA',
            type: 'Default',
            widgets: ['widget1'],
          },
          {
            key: 'step1KeyB',
            type: 'Default',
            widgets: ['widget2'],
          },
        ],
      },
      {
        id: 'step2',
        groups: [
          {
            key: 'step2KeyA',
            type: 'Default',
            widgets: ['widget3'],
          },
        ],
      },
      { id: 'step3' },
    ];

    clearFormSteps(steps, 1, true);

    expect(getFormIdFromWidgetId).toHaveBeenCalledWith(entityId);
    expect(dispatchStub).toHaveBeenCalledWith(
      ClearStepperForm({
        entityId: mockFormId,
        parentId: entityId,
        groups: [
          {
            key: 'step2KeyA',
            type: 'Default',
            widgets: ['widget3'],
          },
        ],
        readOnlyWidgets: new Set(),
      }),
    );
  });
});
