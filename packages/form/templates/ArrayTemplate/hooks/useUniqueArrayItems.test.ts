import { renderHook } from '@testing-library/react';
import useUniqueArrayItems from './useUniqueArrayItems';
import { SetFormServerErrors } from '@pkg-form/validations/redux/reducers';
import { getMockWrapperForContext, getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';
import { mockTranslationBundleHook } from '@_jestHelpers/useTranslationBundleHookMock';
import { mockSystemHook } from '@_jestHelpers/useSystemMock';

describe('useUniqueArrayItems', () => {
  const schema = {
    properties: {
      p1: {},
      p2: {},
    },
  };

  const differentItems = [
    {
      children: {
        props: {
          formData: {
            p1: 'a',
            p2: 'A',
            other: 'other',
          },
          schema,
        },
      },
    },
    {
      children: {
        props: {
          formData: {
            p1: 'a',
            p2: 'B',
          },
          schema,
        },
      },
    },
  ];

  const commonItems = [
    {
      children: {
        props: {
          formData: {
            p1: 'a',
            p2: 'A',
            other: 'other',
          },
          schema,
        },
      },
    },
    {
      children: {
        props: {
          formData: {
            p1: 'a',
            p2: 'B',
          },
          schema,
        },
      },
    },
    {
      children: {
        props: {
          formData: {
            p1: 'a',
            p2: 'A',
          },
          schema,
        },
      },
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    jest.resetAllMocks();
  });

  const setupTest = (storeData = { Translations: { loading: true } }) => {
    mockTranslationBundleHook();
    mockSystemHook();

    // Create a combined wrapper function
    const { dispatchStub, wrapper: reduxWrapper } = getMockWrapperAndStore(storeData);
    const contextWrapper = getMockWrapperForContext(contextValue);

    // Combine both wrappers
    const combinedWrapper = ({ children }) =>
      reduxWrapper({
        children: contextWrapper({ children }),
      });

    return { dispatchStub, wrapper: combinedWrapper };
  };

  const contextValue = {
    errors: {},
    setFieldErrors: jest.fn(),
    getFieldErrors: jest.fn().mockReturnValue([]),
    addFieldErrors: jest.fn(),
    removeFieldErrors: jest.fn(),
    isFieldValid: jest.fn().mockReturnValue(true),
    isFormValid: jest.fn().mockReturnValue(true),
    isGroupValid: jest.fn().mockReturnValue(true),
    clearErrors: jest.fn(),
    clearParentFieldErrors: jest.fn(),
  };

  it('should not do anything if no items exist', () => {
    const { dispatchStub, wrapper } = setupTest();
    renderHook(() => useUniqueArrayItems('widgetId', [], true), { wrapper });

    expect(dispatchStub).toHaveBeenCalledTimes(0);
  });

  it('should not do anything if only one item exist', () => {
    const { dispatchStub, wrapper } = setupTest();
    renderHook(() => useUniqueArrayItems('widgetId', [{ a: 'A' }], true), {
      wrapper,
    });

    expect(dispatchStub).toHaveBeenCalledTimes(0);
  });

  it('should not do anything if unique is false', () => {
    const { dispatchStub, wrapper } = setupTest();
    renderHook(() => useUniqueArrayItems('widgetId', differentItems, false), {
      wrapper,
    });

    expect(dispatchStub).toHaveBeenCalledTimes(0);
  });

  it('should dispatch SetFormServerErrors with empty error list if the last item does not contain the same data as any of the previous items', async () => {
    const { dispatchStub, wrapper } = setupTest();
    renderHook(() => useUniqueArrayItems('widgetId', differentItems, true), {
      wrapper,
    });

    expect(dispatchStub).toHaveBeenCalledTimes(1);
    expect(dispatchStub).toHaveBeenCalledWith(
      SetFormServerErrors({
        errors: {
          widgetId_1: [],
        },
        errorTypes: {},
      }),
    );
  });

  it('should dispatch SetFormServerErrors with error "combinationExists" if the last item has the same data with any of the previous items', () => {
    const { dispatchStub, wrapper } = setupTest();
    renderHook(() => useUniqueArrayItems('widgetId', commonItems, true), {
      wrapper,
    });

    expect(dispatchStub).toHaveBeenCalledTimes(1);
    expect(dispatchStub).toHaveBeenCalledWith(
      SetFormServerErrors({
        errors: {
          widgetId_2: ['combinationExists'],
        },
        errorTypes: {},
      }),
    );
  });
});
