import { resolveDefaultCriteria } from './defaultCriteria';

const mockDate = (isoString: string) => {
  const date = new Date(isoString);
  jest.useFakeTimers();
  jest.setSystemTime(date);
};

afterEach(() => {
  jest.useRealTimers();
});

describe('resolveDefaultCriteria', () => {
  it('should resolve date tokens in criteria values', () => {
    mockDate('2025-06-25T12:00:00Z');
    const criteria = {
      status: 'ACTIVE',
      startDate: '__LAST_MONTH__',
      endDate: '__TODAY__',
    };

    const result = resolveDefaultCriteria(criteria);

    expect(result).toEqual({
      status: 'ACTIVE',
      startDate: '2025-05-01',
      endDate: '2025-06-25',
    });
  });

  it('should leave non-token values unchanged', () => {
    mockDate('2025-06-25T12:00:00Z');
    const criteria = {
      status: 'ACTIVE',
      code: '123',
      amount: 100,
    };

    const result = resolveDefaultCriteria(criteria);

    expect(result).toEqual({
      status: 'ACTIVE',
      code: '123',
      amount: 100,
    });
  });

  it('should leave object values unchanged', () => {
    mockDate('2025-06-25T12:00:00Z');
    const criteria = {
      status: 'ACTIVE',
      range: { from: '2025-01-01', to: '2025-12-31' },
    };

    const result = resolveDefaultCriteria(criteria);

    expect(result).toEqual({
      status: 'ACTIVE',
      range: { from: '2025-01-01', to: '2025-12-31' },
    });
  });

  it('should handle empty criteria', () => {
    const result = resolveDefaultCriteria({});
    expect(result).toEqual({});
  });
});

describe('resolveDefaultCriteria - source values', () => {
  it('should resolve values with a source via the injected resolver', () => {
    mockDate('2025-06-25T12:00:00Z');
    const criteria = {
      state: 'ACTIVE',
      ownerId: { source: { type: 'STORE', code: 'LoggedInUser' } },
    };

    const result = resolveDefaultCriteria(criteria, () => ({ value: 'user-1', apply: true }));

    expect(result).toEqual({ state: 'ACTIVE', ownerId: 'user-1' });
  });

  it('should skip the key when the resolver returns apply: false', () => {
    const criteria = {
      ownerId: { source: { type: 'STORE', code: 'LoggedInUser' } },
    };

    const result = resolveDefaultCriteria(criteria, () => ({ value: undefined, apply: false }));

    expect(result).toEqual({});
  });

  it('should skip the key when the resolver returns apply: true with undefined value', () => {
    const criteria = {
      ownerId: { source: { type: 'STORE', code: 'LoggedInUser' } },
    };

    const result = resolveDefaultCriteria(criteria, () => ({ value: undefined, apply: true }));

    expect(result).toEqual({});
  });

  it('should keep non-source values unchanged even when a resolver is provided', () => {
    const criteria = {
      state: 'ACTIVE',
      amount: 100,
      range: { from: '2025-01-01', to: '2025-12-31' },
    };

    const result = resolveDefaultCriteria(criteria, () => ({ value: 'x', apply: true }));

    expect(result).toEqual(criteria);
  });

  it('should not resolve source values when no resolver is provided', () => {
    const criteria = {
      ownerId: { source: { type: 'STORE', code: 'LoggedInUser' } },
    };

    const result = resolveDefaultCriteria(criteria);

    expect(result).toEqual(criteria);
  });
});
