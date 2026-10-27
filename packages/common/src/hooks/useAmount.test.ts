import { renderHook } from '@testing-library/react';
import useAmount from './useAmount';
import { mockFormDataHook } from '@_jestHelpers/useFormDataMock';
import { mockCodeListAttributesHook } from '@_jestHelpers/useCodeListAttributesMock';
import { BOOLEAN_CODELIST_ATTRIBUTES } from '@pkg-constants/codeListVariables';

describe('useAmount', () => {
  let codeListMocks: ReturnType<typeof mockCodeListAttributesHook>;

  beforeEach(() => {
    jest.clearAllMocks();
    codeListMocks = mockCodeListAttributesHook();
  });

  it('returns attributes from selected currency via useFormData', () => {
    mockFormDataHook('USD');

    codeListMocks.mockGetItem({
      attributes: [
        { key: 'symbol', value: '$' },
        { key: 'symbolPosition', value: 'PREFIX' },
        { key: 'decimalPlaces', value: '3' },
      ],
    });

    const { result } = renderHook(() =>
      useAmount({
        id: 'amountId',
        value: '1000',
        options: { mapToProperty: '', source: { type: 'API_DATA' } as any },
      }),
    );

    expect(codeListMocks.getItemStub).toHaveBeenCalledWith('USD');
    expect(result.current.symbol).toBe('$');
    expect(result.current.symbolPosition).toBe('PREFIX');
    expect(result.current.decimalPlaces).toBe(3);
    expect(result.current.value).toBe('1000');
  });

  it('falls back to primary currency if no selectedCurrency', () => {
    mockFormDataHook(undefined);

    codeListMocks.mockGetItemByAttribute({
      attributes: [{ key: 'symbol', value: '€' }],
    });

    const { result } = renderHook(() => useAmount({}));

    expect(codeListMocks.getItemByAttributeStub).toHaveBeenCalledWith(
      'primary',
      BOOLEAN_CODELIST_ATTRIBUTES.YES,
    );
    expect(result.current.symbol).toBe('€');
  });

  it('maps value correctly when mapToProperty is defined', () => {
    mockFormDataHook('EUR');

    codeListMocks.mockGetItem({
      attributes: [{ key: 'symbol', value: '€' }],
    });

    const { result } = renderHook(() =>
      useAmount({
        id: 'amountId',
        value: { amount: '1234' } as unknown as string,
        options: { mapToProperty: 'amount' },
      }),
    );

    expect(result.current.value).toBe('1234');
  });

  it('returns defaults when no currency data available', () => {
    mockFormDataHook(undefined);

    codeListMocks.mockGetItemByAttribute(undefined);

    const { result } = renderHook(() => useAmount({ value: '999' }));

    expect(result.current.symbol).toBe('€'); // default
    expect(result.current.decimalPlaces).toBe(2);
    expect(result.current.value).toBe('999');
  });
});
