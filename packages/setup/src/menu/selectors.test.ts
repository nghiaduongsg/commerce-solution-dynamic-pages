import { selectMainMenuItems } from './selectors';
import { AnyType } from '@pkg-common/types';

describe('Menu selectors', () => {
  const state = {
    Menu: {
      items: [1, 2, 3],
    },
  } as AnyType;

  it('selectMainMenuItems', () => {
    const expected = [1, 2, 3];
    expect(selectMainMenuItems(state)).toEqual(expected);
  });
});
