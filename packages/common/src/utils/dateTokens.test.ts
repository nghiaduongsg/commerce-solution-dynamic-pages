import { resolveDateToken } from './dateTokens';

const mockDate = (isoString: string) => {
  const date = new Date(isoString);
  jest.useFakeTimers();
  jest.setSystemTime(date);
};

afterEach(() => {
  jest.useRealTimers();
});

describe('resolveDateToken', () => {
  describe('single date tokens', () => {
    it('should resolve __TODAY__ to current date', () => {
      mockDate('2025-06-25T12:00:00Z');
      expect(resolveDateToken('__TODAY__')).toBe('2025-06-25');
    });

    it('should resolve __YESTERDAY__ to previous day', () => {
      mockDate('2025-06-25T12:00:00Z');
      expect(resolveDateToken('__YESTERDAY__')).toBe('2025-06-24');
    });

    it('should resolve __TOMORROW__ to next day', () => {
      mockDate('2025-06-25T12:00:00Z');
      expect(resolveDateToken('__TOMORROW__')).toBe('2025-06-26');
    });

    it('should resolve __YESTERDAY__ at start of month correctly', () => {
      mockDate('2025-06-01T12:00:00Z');
      expect(resolveDateToken('__YESTERDAY__')).toBe('2025-05-31');
    });

    it('should resolve __TOMORROW__ at end of year correctly', () => {
      mockDate('2025-12-31T12:00:00Z');
      expect(resolveDateToken('__TOMORROW__')).toBe('2026-01-01');
    });
  });

  describe('month tokens', () => {
    it('should resolve __THIS_MONTH__ to first day of current month', () => {
      mockDate('2025-06-25T12:00:00Z');
      expect(resolveDateToken('__THIS_MONTH__')).toBe('2025-06-01');
    });

    it('should resolve __LAST_MONTH__ to first day of previous month', () => {
      mockDate('2025-06-25T12:00:00Z');
      expect(resolveDateToken('__LAST_MONTH__')).toBe('2025-05-01');
    });

    it('should resolve __LAST_MONTH__ at start of year correctly', () => {
      mockDate('2025-01-15T12:00:00Z');
      expect(resolveDateToken('__LAST_MONTH__')).toBe('2024-12-01');
    });

    it('should resolve __THIS_MONTH__ for February (leap year)', () => {
      mockDate('2024-02-15T12:00:00Z');
      expect(resolveDateToken('__THIS_MONTH__')).toBe('2024-02-01');
    });

    it('should resolve __THIS_MONTH__ for February (non-leap year)', () => {
      mockDate('2025-02-15T12:00:00Z');
      expect(resolveDateToken('__THIS_MONTH__')).toBe('2025-02-01');
    });

    it('should resolve __30_DAYS_BEFORE__ to 30 days before today', () => {
      mockDate('2025-06-25T12:00:00Z');
      expect(resolveDateToken('__30_DAYS_BEFORE__')).toBe('2025-05-26');
    });

    it('should resolve __30_DAYS_BEFORE__ correctly across year boundary', () => {
      mockDate('2025-01-15T12:00:00Z');
      expect(resolveDateToken('__30_DAYS_BEFORE__')).toBe('2024-12-16');
    });

    it('should resolve __30_DAYS_BEFORE__ correctly across month boundary', () => {
      mockDate('2025-03-31T12:00:00Z');
      expect(resolveDateToken('__30_DAYS_BEFORE__')).toBe('2025-03-01');
    });

    it('should resolve __30_DAYS_BEFORE__ correctly in a leap year', () => {
      mockDate('2024-03-31T12:00:00Z');
      expect(resolveDateToken('__30_DAYS_BEFORE__')).toBe('2024-03-01');
    });

    it('should resolve __30_DAYS_BEFORE__ on the first day of the month', () => {
      mockDate('2025-06-01T12:00:00Z');
      expect(resolveDateToken('__30_DAYS_BEFORE__')).toBe('2025-05-02');
    });
  });

  describe('year tokens', () => {
    it('should resolve __THIS_YEAR__ to Jan 1 of current year', () => {
      mockDate('2025-06-25T12:00:00Z');
      expect(resolveDateToken('__THIS_YEAR__')).toBe('2025-01-01');
    });

    it('should resolve __LAST_YEAR__ to Jan 1 of previous year', () => {
      mockDate('2025-06-25T12:00:00Z');
      expect(resolveDateToken('__LAST_YEAR__')).toBe('2024-01-01');
    });
  });

  it('should return null for unknown token', () => {
    expect(resolveDateToken('__UNKNOWN__')).toBeNull();
  });
});
