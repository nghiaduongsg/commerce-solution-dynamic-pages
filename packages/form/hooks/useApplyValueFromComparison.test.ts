import { renderHook } from '@testing-library/react';
import useApplyValueFromComparison from './useApplyValueFromComparison';
import { getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';
import { mockFormDataHookWithManyCalls } from '@_jestHelpers/useFormDataMock';
import { mockFormFieldHook } from '@_jestHelpers/useFormField';

describe('useApplyValueFromComparison', () => {
  const entitiesStore = 'Entities';
  const Contact = [
    { name: 'partyRole', value: 'partyRoleID' },
    { name: 'currency', value: 'EUR' },
    { name: 'first', value: 'value for parameter first' },
    { name: 'something', value: '1' },
    { name: 'whatever', value: 'what' },
    { name: 'middle', value: '3' },
  ];

  const ContactType = [
    {
      parameterName: 'whatever',
      dataTypeCL: 'STRING',
      requiredSw: false,
      codelistCode: null,
      comment: null,
      code: null,
    },
    {
      parameterName: 'middle',
      dataTypeCL: 'NUMBER',
      requiredSw: false,
      codelistCode: null,
      comment: null,
      code: null,
    },
    {
      parameterName: 'first',
      dataTypeCL: 'ENTITY',
      requiredSw: true,
      codelistCode: null,
      comment: null,
      code: 'Address',
    },
  ];

  const applyValueFromComparisonSchema = {
    currentForm: {
      code: 'Contact',
      jsonPath: ['parameters'],
      property: 'name',
    },
    comparedForm: {
      code: 'ContactType',
      jsonPath: ['parameters'],
      property: 'parameterName',
    },
  };

  const mockStore = {
    [entitiesStore]: {
      Contact_ENTITY: {
        entity: {},
      },
      ContactType_ENTITY: {
        entity: {},
      },
    },
    ApiData: {
      ContactType: {},
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should return undefined if applyValueFromComparison argument is undefined', () => {
    const { wrapper } = getMockWrapperAndStore(mockStore);
    mockFormFieldHook(null);

    mockFormDataHookWithManyCalls([Contact, ContactType]);

    const { result } = renderHook(() => useApplyValueFromComparison('widgetId', 'READ'), {
      wrapper,
    });

    expect(result.current).toBeUndefined();
  });

  it('should call setFieldValue with the matched value "what" when in READ mode and searching for parameter in position "0"', () => {
    jest.useFakeTimers();
    const { setFieldValueStub } = mockFormFieldHook('what');
    mockFormDataHookWithManyCalls([Contact, ContactType]);

    const { wrapper } = getMockWrapperAndStore(mockStore);

    renderHook(
      () => useApplyValueFromComparison('widgetId_0', 'READ', applyValueFromComparisonSchema),
      { wrapper },
    );

    jest.runOnlyPendingTimers();

    expect(setFieldValueStub).toHaveBeenCalledWith('what');
  });

  it('should call setFieldValue with the matched value "3" when in READ mode and searching for parameter in position "1"', () => {
    jest.useFakeTimers();
    const { setFieldValueStub } = mockFormFieldHook('foundValue');
    mockFormDataHookWithManyCalls([Contact, ContactType]);

    const { wrapper } = getMockWrapperAndStore(mockStore);

    renderHook(
      () => useApplyValueFromComparison('widgetId_1', 'READ', applyValueFromComparisonSchema),
      { wrapper },
    );

    jest.runOnlyPendingTimers();

    expect(setFieldValueStub).toHaveBeenCalledWith('3');
  });

  it('should call setFieldValue with the matched value "value for parameter first" when in READ mode and searching for parameter in position "2"', () => {
    jest.useFakeTimers();
    const { setFieldValueStub } = mockFormFieldHook('foundValue');
    mockFormDataHookWithManyCalls([Contact, ContactType]);

    const { wrapper } = getMockWrapperAndStore(mockStore);

    renderHook(
      () => useApplyValueFromComparison('widgetId_2', 'READ', applyValueFromComparisonSchema),
      { wrapper },
    );

    jest.runOnlyPendingTimers();

    expect(setFieldValueStub).toHaveBeenCalledWith('value for parameter first');
  });

  it('should call setFieldValue with the existing value of parameter in case of EDIT mode', () => {
    jest.useFakeTimers();

    const { wrapper } = getMockWrapperAndStore(mockStore);
    const { setFieldValueStub } = mockFormFieldHook('existing-value');
    mockFormDataHookWithManyCalls([Contact, ContactType]);

    renderHook(
      () => useApplyValueFromComparison('widgetId_1', 'EDIT', applyValueFromComparisonSchema),
      { wrapper },
    );

    jest.runOnlyPendingTimers();

    expect(setFieldValueStub).toHaveBeenCalledWith('existing-value');
  });

  it('should call setFieldValue with null in case of READ mode and if currentFormEntity is empty', () => {
    jest.useFakeTimers();

    const { wrapper } = getMockWrapperAndStore(mockStore);
    const { setFieldValueStub } = mockFormFieldHook(null);
    mockFormDataHookWithManyCalls([[], ContactType]);

    renderHook(
      () => useApplyValueFromComparison('widgetId', 'READ', applyValueFromComparisonSchema),
      { wrapper },
    );

    jest.runOnlyPendingTimers();

    expect(setFieldValueStub).toHaveBeenCalledWith(null);
  });

  it('should call setFieldValue with null in case of READ mode and if comparedFormEntity is empty', () => {
    jest.useFakeTimers();

    const { wrapper } = getMockWrapperAndStore(mockStore);
    const { setFieldValueStub } = mockFormFieldHook(null);
    mockFormDataHookWithManyCalls([Contact, []]);

    renderHook(
      () => useApplyValueFromComparison('widgetId', 'READ', applyValueFromComparisonSchema),
      { wrapper },
    );

    jest.runOnlyPendingTimers();

    expect(setFieldValueStub).toHaveBeenCalledWith(null);
  });
});
