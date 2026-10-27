import { selectLoaderVisibility } from '@pkg-common/loader/selectors';
import { LoaderState } from '@pkg-common/loader/types';

describe('Loader selectors', () => {
  const state: { Loader: LoaderState } = {
    Loader: {
      isVisible: false,
    },
  };

  it('Should return the loader state', () => {
    expect(selectLoaderVisibility(state)).toEqual(false);
  });
});
