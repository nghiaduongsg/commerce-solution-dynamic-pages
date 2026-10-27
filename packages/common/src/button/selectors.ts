import { createSelector } from 'reselect';
import { ButtonPressState } from './types';

export const selectButtonPressState = (state: { ButtonPress: ButtonPressState }) =>
  state.ButtonPress;
export const selectIsPressed = (buttonId: string) =>
  createSelector(selectButtonPressState, (state) => state[buttonId]);
export const selectPressedSignatureKey = (buttonIds: Array<string>) =>
  createSelector(selectButtonPressState, (state) => {
    if (!buttonIds || !buttonIds.length) {
      return '';
    }
    return buttonIds
      .filter((buttonId) => !!state[buttonId])
      .map((buttonId) => state[buttonId] ?? '')
      .toString();
  });
export const selectLatestButtonAction = () =>
  createSelector(selectButtonPressState, (state) => state.latestButtonAction);
