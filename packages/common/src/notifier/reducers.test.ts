import notifierReducers from './reducers';

describe('Notifier Reducer', () => {
  it('EnqueueSnackbar', () => {
    const expected = {
      notifications: [
        { key: 1, message: 'test1' },
        { key: 2, message: 'test2' },
      ],
    };

    const state = {
      notifications: [{ key: 1, message: 'test1' }],
    };

    const action = {
      type: 'Notifier/EnqueueSnackbar',
      payload: { key: 2, message: 'test2' },
    };

    expect(notifierReducers(state, action)).toEqual(expected);
  });

  it('should return the removed key item from notifications', () => {
    const expected = {
      notifications: [{ key: 'key2', message: 'message2' }],
    };

    const state = {
      notifications: [
        { key: 'key1', message: 'message1' },
        { key: 'key2', message: 'message2' },
      ],
    };

    const action = {
      type: 'Notifier/RemoveSnackbar',
      payload: {
        key: 'key1',
      },
    };

    expect(notifierReducers(state, action)).toEqual(expected);
  });
});
