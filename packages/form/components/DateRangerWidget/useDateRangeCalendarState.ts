import { useMemo, useState } from 'react';
import dayjs from 'dayjs';

interface UseDateRangeCalendarStateResult {
  calendarKeys: number[];
  setCalendarKeys: (updater: (prev: number[]) => number[]) => void;
  baseMonth: any;
  setBaseMonth: (updater: (prev: any) => any) => void;
  selectedSet: Set<string>;
}

export default function useDateRangeCalendarState(
  calendars: number,
  selectedDates: any[],
): UseDateRangeCalendarStateResult {
  const [calendarKeys, setCalendarKeys] = useState(() =>
    Array.from({ length: Math.min(calendars, 6) }, (_, i) => i),
  );

  const sortedDates = useMemo(() => {
    if (!Array.isArray(selectedDates) || selectedDates.length === 0) return [];
    return [...selectedDates].map((d) => dayjs(d)).sort((a, b) => a.valueOf() - b.valueOf());
  }, [selectedDates]);

  const medianDate = useMemo(() => {
    if (!sortedDates) return null;
    const mid = Math.floor(sortedDates.length / 2);
    return sortedDates[mid];
  }, [sortedDates]);

  const [baseMonth, setBaseMonth] = useState(medianDate || dayjs());

  const selectedSet = useMemo(() => new Set(selectedDates), [selectedDates]);

  return { calendarKeys, setCalendarKeys, baseMonth, setBaseMonth, selectedSet };
}
