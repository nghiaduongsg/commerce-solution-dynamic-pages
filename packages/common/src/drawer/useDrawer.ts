import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectDraggableItem, selectDraggableItemId, selectIsOpen } from './selectors';
import { OpenDraggableDrawer } from './reducersDraggable';
import {
  OpenDrawer,
  CloseDrawer,
  OpenUniqueDrawer,
  CloseAllDrawers,
  ToggleDrawer,
} from './reducers';
import { DraggableDrawerState, UseDrawerType } from './types.d';

export default (id: string): UseDrawerType => {
  const dispatch = useDispatch();

  return <UseDrawerType>{
    open: useSelector(selectIsOpen(id)),
    openUniqueDrawer: useCallback(() => dispatch(OpenUniqueDrawer({ id })), [dispatch, id]),
    openDrawer: useCallback(() => dispatch(OpenDrawer({ id })), [dispatch, id]),
    closeDrawer: useCallback(() => dispatch(CloseDrawer({ id })), [dispatch, id]),
    toggleDrawer: useCallback(() => dispatch(ToggleDrawer({ id })), [dispatch, id]),
  };
};

export const useAllDrawers = () => {
  const dispatch = useDispatch();

  return {
    closeAll: useCallback(() => dispatch(CloseAllDrawers()), [dispatch]),
  };
};

export const useDraggableDrawer = () => {
  const dispatch = useDispatch();
  const id = useSelector(selectDraggableItemId(), (prev, next) => prev === next);
  const item = useSelector(selectDraggableItem(), (prev, next) => prev?.key === next?.key);
  const setItem = useCallback(
    ({ id, item }: DraggableDrawerState) => dispatch(OpenDraggableDrawer({ id, item })),
    [dispatch],
  );
  return useMemo(() => ({ id, item, setItem }), [id, item, setItem]);
};
