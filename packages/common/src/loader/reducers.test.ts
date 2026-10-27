import reducer from './reducers';

describe('Loader reducer', () => {
  it('showLoader', () => {
    const defaultState = {
      isVisible: false,
    };

    const action = {
      type: 'Loader/ShowLoader',
    };

    const expected = {
      isVisible: true,
    };

    expect(reducer(defaultState, action)).toEqual(expected);
  });

  it('hideLoader', () => {
    const defaultState = {
      isVisible: true,
    };

    const action = {
      type: 'Loader/HideLoader',
    };

    const expected = {
      isVisible: false,
    };

    expect(reducer(defaultState, action)).toEqual(expected);
  });
});
