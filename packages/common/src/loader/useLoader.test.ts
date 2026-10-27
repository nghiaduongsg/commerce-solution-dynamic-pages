import { renderHook } from '@testing-library/react';
import useLoader from '@pkg-common/loader/useLoader';
import { getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';
import { HideLoader, ShowLoader } from '@pkg-common/loader/reducers';

describe('UseLoader hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const storeData = {
    Loader: {
      visible: false,
    },
  };

  const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);

  it('Hook returns what is supposed to be returned', () => {
    const { result } = renderHook(() => useLoader(), { wrapper });
    const { visible, showLoader, hideLoader } = result.current;

    expect(visible).toBeFalsy();
    expect(typeof showLoader).toBe('function');
    expect(typeof hideLoader).toBe('function');
  });

  it('Should call showLoader with the right action', () => {
    const { result } = renderHook(() => useLoader(), { wrapper });
    const { showLoader } = result.current;

    showLoader();

    expect(dispatchStub).toHaveBeenCalledWith(ShowLoader());
  });

  it('Should call hideLoader with the right action', () => {
    const { result } = renderHook(() => useLoader(), { wrapper });
    const { hideLoader } = result.current;

    hideLoader();

    expect(dispatchStub).toHaveBeenCalledWith(HideLoader());
  });
});
