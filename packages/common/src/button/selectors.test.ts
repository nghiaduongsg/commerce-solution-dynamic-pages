import {
  selectButtonPressState,
  selectIsPressed,
  selectPressedSignatureKey,
  selectLatestButtonAction,
} from './selectors';

describe('Button selectors', () => {
  describe('selectButtonPressState', () => {
    it('should return default behaviour', () => {
      expect(selectButtonPressState({ ButtonPress: {} })).toEqual({});
    });
  });
  describe('selectIsPressed', () => {
    it('should return the state value when invoking the memo callback', () => {
      expect(selectIsPressed('testButtonId')({ ButtonPress: { testButtonId: 1 } })).toEqual(1);
    });
  });
  describe('selectPressedSignatureKey', () => {
    it('should return empty string if buttonIds param is falsy or empty array', () => {
      expect(selectPressedSignatureKey([])({ ButtonPress: {} })).toEqual('');
    });
    it('should return the times that the matching buttonIds have been pressed', () => {
      expect(
        selectPressedSignatureKey(['testButtonGreen', 'testButtonRed', 'testButtonBlue'])({
          ButtonPress: { testButtonGreen: 1, testButtonRed: 2 },
        }),
      ).toEqual('1,2');
    });
    it('should filter out button ids that have falsy values', () => {
      expect(
        selectPressedSignatureKey(['testButtonGreen', 'testButtonRed', 'testButtonBlue'])({
          ButtonPress: {
            testButtonGreen: 4,
            testButtonRed: null,
            testButtonBlue: undefined,
          },
        } as any),
      ).toEqual('4');
    });
  });
  describe('selectLatestButtonAction', () => {
    it('should return the latestButtonAction property from the state', () => {
      const state = {
        ButtonPress: {
          latestButtonAction: 'my-latest-action',
          someButton: 123,
        },
      };
      expect(selectLatestButtonAction()(state)).toBe('my-latest-action');
    });
    it('should return undefined if latestButtonAction is not set', () => {
      const state = {
        ButtonPress: {
          someButton: 456,
        },
      };
      expect(selectLatestButtonAction()(state)).toBeUndefined();
    });
    it('should return undefined if the entire ButtonPress state is empty', () => {
      const state = { ButtonPress: {} };
      expect(selectLatestButtonAction()(state)).toBeUndefined();
    });
  });
});
