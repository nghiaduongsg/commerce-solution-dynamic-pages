import { useDispatch, useSelector } from 'react-redux';
import { DraggableDrawerState, DrawerState } from '@pkg-common/drawer/types';
import useDrawer, { useAllDrawers, useDraggableDrawer } from '@pkg-common/drawer/useDrawer';
import { act, renderHook } from '@testing-library/react';
import {
  OpenUniqueDrawer,
  OpenDrawer,
  CloseDrawer,
  ToggleDrawer,
  CloseAllDrawers,
} from '@pkg-common/drawer/reducers';
import { OpenDraggableDrawer } from '@pkg-common/drawer/reducersDraggable';

jest.mock('react-redux');

const mockUseDispatch = useDispatch as jest.MockedFunction<typeof useDispatch>;
const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

describe('useDrawer default hook', () => {
  const mockDispatch = jest.fn();

  const mockState: { Drawer: DrawerState } = {
    Drawer: {
      id1: true,
      id2: true,
      id3: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDispatch.mockReturnValue(mockDispatch);
    mockUseSelector.mockImplementation((selector) => {
      return selector({ Drawer: mockState.Drawer });
    });
  });

  it('should return the expected structure', () => {
    const testId = 'id1';
    const expectedValue = true;

    const { result } = renderHook(() => useDrawer(testId));
    const { open, openUniqueDrawer, openDrawer, closeDrawer, toggleDrawer } = result.current;

    expect(open).toEqual(expectedValue);
    expect(typeof openUniqueDrawer).toBe('function');
    expect(typeof openDrawer).toBe('function');
    expect(typeof closeDrawer).toBe('function');
    expect(typeof toggleDrawer).toBe('function');
  });

  it('should return the value of the drawer id', () => {
    const testId = 'id3';
    const expectedValue = false;

    const { result } = renderHook(() => useDrawer(testId));
    const { open } = result.current;

    expect(open).toEqual(expectedValue);
  });

  it('should dispatch OpenUniqueDrawer with correct payload', () => {
    const testId = 'id1';
    const expectedValue = { id: 'id1' };

    const { result } = renderHook(() => useDrawer(testId));
    const { openUniqueDrawer } = result.current;

    act(() => {
      openUniqueDrawer();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: OpenUniqueDrawer.type,
      payload: expectedValue,
    });
  });

  it('should dispatch OpenDrawer with correct payload', () => {
    const testId = 'id1';
    const expectedValue = { id: 'id1' };

    const { result } = renderHook(() => useDrawer(testId));
    const { openDrawer } = result.current;

    act(() => {
      openDrawer();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: OpenDrawer.type,
      payload: expectedValue,
    });
  });

  it('should dispatch CloseDrawer with correct payload', () => {
    const testId = 'id1';
    const expectedValue = { id: 'id1' };

    const { result } = renderHook(() => useDrawer(testId));
    const { closeDrawer } = result.current;

    act(() => {
      closeDrawer();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: CloseDrawer.type,
      payload: expectedValue,
    });
  });

  it('should dispatch ToggleDrawer with correct payload', () => {
    const testId = 'id1';
    const expectedValue = { id: 'id1' };

    const { result } = renderHook(() => useDrawer(testId));
    const { toggleDrawer } = result.current;

    act(() => {
      toggleDrawer();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: ToggleDrawer.type,
      payload: expectedValue,
    });
  });
});

describe('useAllDrawers hook', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDispatch.mockReturnValue(mockDispatch);
  });

  it('should dispatch CloseAllDrawers with correct payload', () => {
    const { result } = renderHook(() => useAllDrawers());
    const { closeAll } = result.current;

    act(() => {
      closeAll();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: CloseAllDrawers.type,
    });
  });
});

describe('useDraggableDrawer hook', () => {
  const mockDispatch = jest.fn();

  const mockState: { DraggableDrawer: DraggableDrawerState } = {
    DraggableDrawer: {
      id: '1',
      item: { key: '1', uiSchema: {}, schema: {} },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDispatch.mockReturnValue(mockDispatch);
    mockUseSelector.mockImplementation((selector) => {
      return selector({ DraggableDrawer: mockState.DraggableDrawer });
    });
  });

  it('should return the expected structure', () => {
    const { result } = renderHook(() => useDraggableDrawer());
    const { id, item, setItem } = result.current;

    expect(id).toEqual(mockState.DraggableDrawer.id);
    expect(item).toEqual(mockState.DraggableDrawer.item);
    expect(typeof setItem).toBe('function');
  });

  it('should dispatch OpenDraggableDrawer with correct payload', () => {
    const mockItem = { key: '1', uiSchema: {}, schema: {} };
    const testItem = { id: '1', item: mockItem };

    const { result } = renderHook(() => useDraggableDrawer());
    const { id, item, setItem } = result.current;

    act(() => {
      setItem(testItem);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: OpenDraggableDrawer.type,
      payload: testItem,
    });
  });
});
