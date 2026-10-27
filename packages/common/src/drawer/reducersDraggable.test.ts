import DrawerReducer from './reducersDraggable';
import { SYSTEM_CLEAR } from '@pkg-setup/src/system/useSystem';

describe('Drawer Draggable Reducer', () => {
  it('OpenDraggableDrawer', () => {
    const defaultState = { id: '123', item: { key: 'A', schema: {}, uiSchema: {} } };
    const payload = { id: '456', item: { key: 'B', schema: {}, uiSchema: {} } };
    const action = {
      type: 'DraggableDrawer/OpenDraggableDrawer',
      payload,
    };

    expect(DrawerReducer(defaultState, action)).toEqual(payload);
  });

  it(SYSTEM_CLEAR, () => {
    const defaultState = { id: '123', item: { key: 'A', schema: {}, uiSchema: {} } };
    const action = {
      type: SYSTEM_CLEAR,
    };

    expect(DrawerReducer(defaultState, action)).toEqual({ id: 'test', item: null });
  });
});
