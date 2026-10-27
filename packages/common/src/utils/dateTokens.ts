export const DATE_TOKENS = new Set([
  '__TODAY__',
  '__YESTERDAY__',
  '__TOMORROW__',
  '__THIS_MONTH__',
  '__LAST_MONTH__',
  '__THIS_YEAR__',
  '__LAST_YEAR__',
  '__30_DAYS_BEFORE__',
]);

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getFirstOfMonth = (year: number, month: number): Date => new Date(year, month, 1);

export const resolveDateToken = (token: string): string | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  switch (token) {
    case '__TODAY__':
      return formatDate(today);

    case '__YESTERDAY__':
      return formatDate(addDays(today, -1));

    case '__TOMORROW__':
      return formatDate(addDays(today, 1));

    case '__THIS_MONTH__':
      return formatDate(getFirstOfMonth(currentYear, currentMonth));

    case '__LAST_MONTH__': {
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return formatDate(getFirstOfMonth(prevYear, prevMonth));
    }

    case '__30_DAYS_BEFORE__':
      return formatDate(addDays(today, -30));

    case '__THIS_YEAR__':
      return formatDate(getFirstOfMonth(currentYear, 0));

    case '__LAST_YEAR__':
      return formatDate(getFirstOfMonth(currentYear - 1, 0));

    default:
      return null;
  }
};
