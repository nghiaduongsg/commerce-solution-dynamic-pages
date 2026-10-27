import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import useDateRangeCalendarState from './useDateRangeCalendarState';
import { COMMON } from '@pkg-constants/translationNamespaces';
import useDate from '@pkg-common/hooks/useDate';
import CustomDay from './CustomDay';
import CalendarHeader from './CalendarHeader';
import DateRangeCalendarView from './DateRangeCalendarView';

export default function DateRangeReadOnlyWidget({ id, options, formContext, value: innerValue }) {
  const { calendars = 3 } = options;

  const { namespace } = formContext || {};

  const selectedDates = Array.isArray(innerValue) ? innerValue : [];

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation(namespace ? [COMMON, namespace] : [COMMON]);
  const dateFormat = useDate('date') || 'dd/MM/yyyy';

  const { calendarKeys, setCalendarKeys, baseMonth, setBaseMonth, selectedSet } =
    useDateRangeCalendarState(calendars, selectedDates);

  const daySlot = useCallback(
    (props: any) => (
      <CustomDay {...props} selectedSet={selectedSet} dateFormat={dateFormat} allowToggle={false} />
    ),
    [selectedSet, dateFormat],
  );

  const calendarHeaderSlot = useCallback(
    (props: any) => (
      <CalendarHeader
        {...props}
        translate={translate}
        selectedLanguage={selectedLanguage}
        namespace={namespace}
      />
    ),
    [translate, selectedLanguage, namespace],
  );

  return (
    <DateRangeCalendarView
      id={id}
      calendars={calendars}
      calendarKeys={calendarKeys}
      baseMonth={baseMonth}
      daySlot={daySlot}
      calendarHeaderSlot={calendarHeaderSlot}
      onPreviousMonth={() => setBaseMonth((prev) => prev.subtract(1, 'month'))}
      onNextMonth={() => setBaseMonth((prev) => prev.add(1, 'month'))}
      onCalendarKeysChange={setCalendarKeys}
      disabled
      namespace={namespace}
    />
  );
}
