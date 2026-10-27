import { createSelector } from 'reselect';
import { DraggableDrawerState, DrawerState } from './types';

export const selectDrawerState = (state: { Drawer: DrawerState }) => state.Drawer;
export const selectDraggableDrawerState = (state: { DraggableDrawer: DraggableDrawerState }) =>
  state.DraggableDrawer;
export const selectIsOpen = (drawerId: string) =>
  createSelector(selectDrawerState, (state) => state[drawerId]);

export const selectDraggableItem = () =>
  createSelector(selectDraggableDrawerState, (state) => state?.item);
export const selectDraggableItemId = () =>
  createSelector(selectDraggableDrawerState, (state) => state?.id);
