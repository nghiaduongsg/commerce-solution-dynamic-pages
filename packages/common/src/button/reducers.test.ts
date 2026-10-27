import ButtonReducer from './reducers';
import { mockDate } from '../../../_jestHelpers/dateMock';

describe('Button Reducer', () => {
  describe('Button Reducer', () => {
    it('should return previous state if no id is provided', () => {
      mockDate(1234);
      const defaultState = {};
      const action = {
        type: 'ButtonPress/MarkButtonPress',
        payload: {},
      };

      expect(ButtonReducer(defaultState, action)).toEqual(defaultState);
    });

    it('should add buttonId to the state', () => {
      mockDate(1234);
      const defaultState = {};
      const action = {
        type: 'ButtonPress/MarkButtonPress',
        payload: { id: 'buttonId' },
      };

      const expected = {
        ...defaultState,
        buttonId: 1234,
      };

      expect(ButtonReducer(defaultState, action)).toEqual(expected);
    });
  });

  it('ClearButtonPresses', () => {
    const defaultState = { button1: 345, button2: 42345 };
    const action = {
      type: 'ButtonPress/ClearButtonPresses',
    };

    expect(ButtonReducer(defaultState, action)).toEqual({});
  });

  describe('SetLatestButtonPress', () => {
    it('should set latestButtonAction when actionId is provided', () => {
      const defaultState = {};
      const action = {
        type: 'ButtonPress/SetLatestButtonPress',
        payload: { actionId: 'action-123' },
      };

      const expected = {
        ...defaultState,
        latestButtonAction: 'action-123',
      };

      expect(ButtonReducer(defaultState, action)).toEqual(expected);
    });

    describe('ClearLatestButtonPress', () => {
      it('should set latestButtonAction to undefined', () => {
        const defaultState = {
          latestButtonAction: 'action-to-be-cleared',
          buttonId: 1234, // Include other state to ensure it's not affected
        };
        const action = {
          type: 'ButtonPress/ClearLatestButtonPress',
        };

        const expected = {
          latestButtonAction: undefined,
          buttonId: 1234,
        };

        expect(ButtonReducer(defaultState, action)).toEqual(expected);
      });
    });
  });
});
