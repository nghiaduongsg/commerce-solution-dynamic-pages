import { renderHook, act } from '@testing-library/react';
import * as redux from 'react-redux';
import useFormField from './useFormField';
import {
  UpdateFormValue,
  ClearFormValues,
  AddFormItem,
  RemoveFormItem,
  AddFormItems,
  ReorderArrayItems,
  ConcatToObject,
} from '@pkg-entity/redux/actions';
import { getMockWrapperWithFormManagerContext } from '@_jestHelpers/reactMockStore';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('@pkg-form/validations/utils/widgetUtils', () => ({
  getFormIdFromWidgetId: jest.fn(() => 'mockEntityId'),
  getWidgetImmediateParentId: jest.fn(() => 'mockParentId'),
  isValidWidgetId: jest.fn(() => true),
}));

describe('useFormField hook', () => {
  let mockDispatch: jest.Mock;

  const isFieldDirtyMock = jest.fn();
  const setFieldDirtyMock = jest.fn();

  const wrapper = getMockWrapperWithFormManagerContext({
    isFieldDirty: isFieldDirtyMock,
    setFieldDirty: setFieldDirtyMock,
  });

  beforeEach(() => {
    mockDispatch = jest.fn();

    (redux.useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (redux.useSelector as unknown as jest.Mock).mockImplementation(() => 'mockValue');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial values correctly', () => {
    isFieldDirtyMock.mockReturnValue(true);
    const { result } = renderHook(() => useFormField('field123'), { wrapper });

    expect(result.current.value).toBe('mockValue');
    expect(result.current.storeValue).toBe('mockValue');
    expect(result.current.dirty).toBe(true);
  });

  describe('SetFieldValue', () => {
    it('should dispatch UpdateFormValue when setFieldValue is called - field not dirty', () => {
      isFieldDirtyMock.mockReturnValue(false);
      const { result } = renderHook(() => useFormField('field123'), { wrapper });

      act(() => {
        result.current.setFieldValue('newValue');
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        UpdateFormValue({
          entityId: 'mockEntityId',
          fieldId: 'field123',
          value: 'newValue',
          hookName: '',
          metadata: {},
        }),
      );
      expect(setFieldDirtyMock).toHaveBeenCalledTimes(3);
    });

    it('should dispatch UpdateFormValue when setFieldValue is called - field already dirtied', () => {
      isFieldDirtyMock.mockReturnValue(true);
      const { result } = renderHook(() => useFormField('field123'), { wrapper });

      act(() => {
        result.current.setFieldValue('newValue');
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        UpdateFormValue({
          entityId: 'mockEntityId',
          fieldId: 'field123',
          value: 'newValue',
          hookName: '',
          metadata: {},
        }),
      );
      expect(setFieldDirtyMock).toHaveBeenCalledTimes(0);
    });

    it('should dispatch UpdateFormValue when setFieldValue is called with hook name', () => {
      isFieldDirtyMock.mockReturnValue(false);
      const { result } = renderHook(() => useFormField('field123'), { wrapper });

      act(() => {
        result.current.setFieldValue('newValue', 'hookName');
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        UpdateFormValue({
          entityId: 'mockEntityId',
          fieldId: 'field123',
          value: 'newValue',
          hookName: 'hookName',
          metadata: {},
        }),
      );
      expect(setFieldDirtyMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('SetFieldDirty', () => {
    it('should set field dirty if it is not already dirty', () => {
      isFieldDirtyMock.mockReturnValue(false);
      const { result } = renderHook(() => useFormField('field123'), { wrapper });

      act(() => {
        result.current.setFieldDirty();
      });

      expect(setFieldDirtyMock).toHaveBeenCalledWith('field123', true);
    });

    it('should not set field dirty if it is already dirty', () => {
      isFieldDirtyMock.mockReturnValue(true);
      const { result } = renderHook(() => useFormField('field123'), { wrapper });

      act(() => {
        result.current.setFieldDirty();
      });

      expect(setFieldDirtyMock).toHaveBeenCalledTimes(0);
    });
  });

  it('should dispatch ClearFormValues correctly', async () => {
    const { result } = renderHook(() => useFormField('field123'), { wrapper });

    await act(async () => {
      result.current.clearFormValues(['f1', 'f2']);
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      ClearFormValues({ entityId: 'mockEntityId', fieldIds: ['f1', 'f2'] }),
    );
  });

  it('should dispatch ReorderArrayItems correctly', async () => {
    const { result } = renderHook(() => useFormField('field123'), { wrapper });

    await act(async () => {
      result.current.reorderItems('type:asc');
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      ReorderArrayItems({ entityId: 'mockEntityId', fieldId: 'field123', sortBy: 'type:asc' }),
    );
  });

  it('should dispatch ConcatToObject correctly', async () => {
    const { result } = renderHook(() => useFormField('field123'), { wrapper });

    await act(async () => {
      result.current.concatToObject('prop', 'some-value');
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      ConcatToObject({
        entityId: 'mockEntityId',
        fieldId: 'field123',
        property: 'prop',
        value: 'some-value',
        stringify: true,
      }),
    );
  });

  describe('AddFormItem', () => {
    it('should dispatch AddFormItem correctly', () => {
      const { result } = renderHook(() => useFormField('field123'), { wrapper });

      act(() => {
        result.current.addItem({ name: 'test' });
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        AddFormItem({ entityId: 'mockEntityId', fieldId: 'field123', item: { name: 'test' } }),
      );
    });

    it('should mark field as dirty if it was not already dirty', () => {
      isFieldDirtyMock.mockReturnValue(false);
      const { result } = renderHook(() => useFormField('field123'), { wrapper });

      act(() => {
        result.current.addItem({ name: 'test' });
      });

      expect(setFieldDirtyMock).toHaveBeenCalledWith('field123', true);
    });

    it('should not mark field as dirty if it was already dirty', () => {
      isFieldDirtyMock.mockReturnValue(true);
      const { result } = renderHook(() => useFormField('field123'), { wrapper });

      act(() => {
        result.current.addItem({ name: 'test' });
      });

      expect(setFieldDirtyMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('AddFormItems', () => {
    it('should dispatch AddFormItems correctly', () => {
      const { result } = renderHook(() => useFormField('field123'), { wrapper });

      act(() => {
        result.current.addItems([{ name: 'test' }, { name: 'test2' }]);
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        AddFormItems({
          entityId: 'mockEntityId',
          fieldId: 'field123',
          items: [{ name: 'test' }, { name: 'test2' }],
        }),
      );
    });

    it('should mark field as dirty if it was not already dirty', () => {
      isFieldDirtyMock.mockReturnValue(false);
      const { result } = renderHook(() => useFormField('field123'), { wrapper });

      act(() => {
        result.current.addItems([{ name: 'test' }, { name: 'test2' }]);
      });

      expect(setFieldDirtyMock).toHaveBeenCalledWith('field123', true);
    });

    it('should not mark field as dirty if it was already dirty', () => {
      isFieldDirtyMock.mockReturnValue(true);
      const { result } = renderHook(() => useFormField('field123'), { wrapper });

      act(() => {
        result.current.addItems([{ name: 'test' }, { name: 'test2' }]);
      });

      expect(setFieldDirtyMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('RemoveFormItem', () => {
    it('should dispatch RemoveFormItem correctly', () => {
      const { result } = renderHook(() => useFormField('field123'), { wrapper });

      act(() => {
        result.current.removeItem(2);
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        RemoveFormItem({ entityId: 'mockEntityId', fieldId: 'field123', index: 2 }),
      );
    });

    it('should mark field as dirty if it was not already dirty', () => {
      isFieldDirtyMock.mockReturnValue(false);
      const { result } = renderHook(() => useFormField('field123'), { wrapper });

      act(() => {
        result.current.removeItem(2);
      });

      expect(setFieldDirtyMock).toHaveBeenCalledWith('field123', true);
    });

    it('should not mark field as dirty if it was already dirty', () => {
      isFieldDirtyMock.mockReturnValue(true);
      const { result } = renderHook(() => useFormField('field123'), { wrapper });

      act(() => {
        result.current.removeItem(2);
      });

      expect(setFieldDirtyMock).toHaveBeenCalledTimes(0);
    });
  });
});
