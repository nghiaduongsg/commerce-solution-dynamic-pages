import {
  selectIsOpen,
  selectDrawerState,
  selectDraggableItem,
  selectDraggableItemId,
} from './selectors';
import { AnyType } from '@pkg-common/types';

describe('Drawer selectors', () => {
  const draggableItem = {
    id: '1',
    item: {
      key: 'key',
      schema: {},
      uiSchema: {},
    },
  };
  const state = {
    Drawer: {
      'drawer-Id': true,
    },
    DraggableDrawer: {
      id: '1',
      item: draggableItem,
    },
  } as AnyType;

  it('selectDrawerState', () => {
    expect(selectDrawerState(state)).toEqual(state.Drawer);
  });

  it('selectIsOpen', () => {
    expect(selectIsOpen('drawer-Id')(state)).toEqual(true);
  });

  it('selectDraggableItem', () => {
    expect(selectDraggableItem()(state)).toEqual(draggableItem);
  });

  it('selectDraggableItemId', () => {
    expect(selectDraggableItemId()(state)).toEqual('1');
  });
});
