import { renderHook } from '@testing-library/react';
import useAlternateUrl from './useAlternateUrl';
import { getMockWrapperAndStore } from '../../../_jestHelpers/reactMockStore';
import { mockMultipleFormDataHook } from '../../../_jestHelpers/useMultipleFormDataMock';
import { AlternateUrlSchema, CheckFromSchema } from '../types.d';

describe('useAlternateUrl', () => {
  const storeData = {
    LoggedInUser: {
      profile: {
        partyRoleId: 'the-best-user',
        id: 'user-id-123',
      },
    },
    System: {
      apiUrl: 'http://localhost:3001',
      useStaticSchemas: true,
    },
  };

  const { wrapper } = getMockWrapperAndStore(storeData);

  const matchingCondition: CheckFromSchema = {
    operator: 'every',
    fields: [
      {
        key: 'a',
        checkWhen: ['value-a'],
        source: {
          code: 'EntityCode',
          jsonPath: ['a'],
        },
      },
    ],
  };

  const nonMatchingCondition: CheckFromSchema = {
    operator: 'every',
    fields: [
      {
        key: 'a',
        checkWhen: ['other-value'],
        source: {
          code: 'EntityCode',
          jsonPath: ['a'],
        },
      },
    ],
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should return undefined when alternateUrls is not provided', () => {
    mockMultipleFormDataHook({});

    const { result } = renderHook(() => useAlternateUrl('widgetId'), { wrapper });

    expect(result.current).toBeUndefined();
  });

  it('should return undefined when alternateUrls is an empty array', () => {
    mockMultipleFormDataHook({});

    const { result } = renderHook(() => useAlternateUrl('widgetId', []), { wrapper });

    expect(result.current).toBeUndefined();
  });

  it('should return undefined when no condition matches', () => {
    const alternateUrls: Array<AlternateUrlSchema> = [
      {
        condition: nonMatchingCondition,
        url: 'api/first',
      },
    ];

    mockMultipleFormDataHook({ a: 'value-a' });

    const { result } = renderHook(() => useAlternateUrl('widgetId', alternateUrls), { wrapper });

    expect(result.current).toBeUndefined();
  });

  it('should return alternate URL whose condition is true', () => {
    const alternateUrls: Array<AlternateUrlSchema> = [
      {
        condition: nonMatchingCondition,
        url: 'api/first',
      },
      {
        condition: matchingCondition,
        url: 'api/second',
      },
    ];

    mockMultipleFormDataHook({ a: 'value-a' });

    const { result } = renderHook(() => useAlternateUrl('widgetId', alternateUrls), { wrapper });

    expect(result.current).toEqual(
      expect.objectContaining({
        url: 'api/second',
      }),
    );
  });

  it('should return the first matching alternate URL when multiple match', () => {
    const alternateUrls: Array<AlternateUrlSchema> = [
      {
        condition: matchingCondition,
        url: 'api/first',
      },
      {
        condition: matchingCondition,
        url: 'api/second',
      },
    ];

    mockMultipleFormDataHook({ a: 'value-a' });

    const { result } = renderHook(() => useAlternateUrl('widgetId', alternateUrls), { wrapper });

    expect(result.current).toEqual(
      expect.objectContaining({
        url: 'api/first',
      }),
    );
  });
});
