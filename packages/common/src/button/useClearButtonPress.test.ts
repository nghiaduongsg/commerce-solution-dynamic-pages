import { getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';
import useClearButtonPress from './useClearButtonPress';
import { renderHook } from '@testing-library/react';
import { ClearButtonPresses } from './reducers';

const storeData = {
  ClearButtonPresses: 0,
  Buttons: {},
};

beforeEach(() => jest.clearAllMocks());
describe('useClearButtonPress', () => {
  const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
  it('should default and call dispatch', () => {
    const {
      result: { current },
    } = renderHook(() => useClearButtonPress(), { wrapper });
    current.clearAllButtonPresses();
    expect(dispatchStub).toHaveBeenCalledWith(ClearButtonPresses());
  });
});
