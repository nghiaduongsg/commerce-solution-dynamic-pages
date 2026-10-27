import DrawerReducer from './reducers';
import { SYSTEM_CLEAR } from '@pkg-setup/src/system/useSystem';

describe('Drawer Reducer', () => {
  describe('OpenDrawer', () => {
    it('should return the defaultState when no payload is given', () => {
      const defaultState = {};
      const action = {
        type: 'Drawer/OpenDrawer',
        payload: {},
      };

      expect(DrawerReducer(defaultState, action)).toEqual(defaultState);
    });

    it('should add the drawerId to the state with value true', () => {
      const defaultState = {};
      const action = {
        type: 'Drawer/OpenDrawer',
        payload: { id: 'drawerId' },
      };

      const expected = {
        ...defaultState,
        drawerId: true,
      };

      expect(DrawerReducer(defaultState, action)).toEqual(expected);
    });
  });

  describe('CloseDrawer', () => {
    it('should return the defaultState when no payload is given', () => {
      const defaultState = {};
      const action = {
        type: 'Drawer/CloseDrawer',
        payload: {},
      };

      expect(DrawerReducer(defaultState, action)).toEqual(defaultState);
    });

    it('should add the drawerId to the state with value false', () => {
      const defaultState = { drawerId: true };
      const action = {
        type: 'Drawer/CloseDrawer',
        payload: { id: 'drawerId' },
      };

      const expected = {
        ...defaultState,
        drawerId: false,
      };

      expect(DrawerReducer(defaultState, action)).toEqual(expected);
    });
  });

  describe('ToggleDrawer', () => {
    it('should return the defaultState when no payload is given', () => {
      const defaultState = {};
      const action = {
        type: 'Drawer/ToggleDrawer',
        payload: {},
      };

      expect(DrawerReducer(defaultState, action)).toEqual(defaultState);
    });

    it('should add the drawerId to the state with value false, if it was true', () => {
      const defaultState = { drawerId: true };
      const action = {
        type: 'Drawer/ToggleDrawer',
        payload: { id: 'drawerId' },
      };

      const expected = {
        ...defaultState,
        drawerId: false,
      };

      expect(DrawerReducer(defaultState, action)).toEqual(expected);
    });

    it('should add the drawerId to the state with value true, if it was false', () => {
      const defaultState = { drawerId: false };
      const action = {
        type: 'Drawer/ToggleDrawer',
        payload: { id: 'drawerId' },
      };

      const expected = {
        ...defaultState,
        drawerId: true,
      };

      expect(DrawerReducer(defaultState, action)).toEqual(expected);
    });
  });

  describe('OpenUniqueDrawer', () => {
    it('should return the defaultState when no payload is given', () => {
      const defaultState = {};
      const action = {
        type: 'Drawer/OpenUniqueDrawer',
        payload: {},
      };

      expect(DrawerReducer(defaultState, action)).toEqual(defaultState);
    });

    it('should add the drawerId to the state with value false', () => {
      const defaultState = { drawerId1: true, drawerId2: true, drawerId3: false };
      const action = {
        type: 'Drawer/OpenUniqueDrawer',
        payload: { id: 'drawerId' },
      };

      const expected = {
        drawerId1: false,
        drawerId2: false,
        drawerId3: false,
        drawerId: true,
      };

      expect(DrawerReducer(defaultState, action)).toEqual(expected);
    });
  });

  it('CloseAllDrawers', () => {
    const defaultState = { drawerId1: true, drawerId2: true, drawerId3: false };
    const action = {
      type: 'Drawer/CloseAllDrawers',
    };

    const expected = {
      drawerId1: false,
      drawerId2: false,
      drawerId3: false,
    };

    expect(DrawerReducer(defaultState, action)).toEqual(expected);
  });

  it(SYSTEM_CLEAR, () => {
    const defaultState = { drawerId1: true, drawerId2: true, drawerId3: false };
    const action = {
      type: SYSTEM_CLEAR,
    };

    const expected = {
      drawerId1: false,
      drawerId2: false,
      drawerId3: false,
    };

    expect(DrawerReducer(defaultState, action)).toEqual(expected);
  });
});
