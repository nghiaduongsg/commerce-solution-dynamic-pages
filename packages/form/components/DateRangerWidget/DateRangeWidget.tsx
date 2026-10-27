import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useFormField from '@pkg-entity/hooks/useFormField';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import useSystem from '@pkg-setup/src/system/useSystem';
import useDateRangeCalendarState from './useDateRangeCalendarState';
import { COMMON } from '@pkg-constants/translationNamespaces';
import useDate from '@pkg-common/hooks/useDate';
import { format } from 'date-fns';
import useDateWidgetValidations from '@pkg-form/components/DateWidget/hooks/useDateWidgetValidations';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import { getFinalValidateFromStructure } from '@pkg-form/validations/utils/widgetUtils';
import CalendarHeader from './CalendarHeader';
import CustomDay from './CustomDay';
import DateRangeCalendarView from './DateRangeCalendarView';

export default function DateRangeWidget({
  id,
  options,
  formContext,
  value: innerValue,
  onChange,
  serverErrors,
  diffs,
  disabled,
  readonly,
}) {
  const {
    defaultValueFrom,
    allowToggle = true,
    calendars = 3,
    validateFrom = [],
    validateWhen = {},
    validations = {},
  } = options;

  const validateFromArray = useMemo(() => {
    return getFinalValidateFromStructure(validateFrom);
  }, [validateFrom]);

  const { mechanism, namespace } = formContext || {};

  const useDefaultMechanism = mechanism === 'DEFAULT';
  const {
    value: selectedDates = [],
    setFieldValue: setSelectedDates,
    dirty,
  } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
    300,
  );

  const {
    errors: clientErrors,
    minDate,
    maxDate,
  } = useDateWidgetValidations(
    id,
    selectedDates,
    validations,
    validateFromArray as any,
    validateWhen,
    serverErrors,
    'dateArray',
  );

  useDefaultValueFrom(id, defaultValueFrom);
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, namespace]);
  const dateFormat = useDate('date') || 'dd/MM/yyyy';

  const { calendarKeys, setCalendarKeys, baseMonth, setBaseMonth, selectedSet } =
    useDateRangeCalendarState(calendars, selectedDates);

  const isDragging = useRef(false);
  const dragStart = useRef(null);

  const selectRange = useCallback(
    (start, end) => {
      try {
        const [min, max] = start?.isBefore(end) ? [start, end] : [end, start];
        const days: Array<string> = [];
        let current = min;
        while (current?.isBefore(max) || current?.isSame(max, 'day')) {
          const date = new Date(current);
          const formattedDate = format(date as Date, dateFormat);
          days.push(formattedDate);
          current = current.add(1, 'day');
        }
        setSelectedDates(Array.from(new Set([...selectedDates, ...days])));
      } catch {}
    },
    [selectedDates, dateFormat, setSelectedDates],
  );

  useEffect(() => {
    const handleMouseUpGlobal = () => {
      isDragging.current = false;
      dragStart.current = null;
    };
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => window.removeEventListener('mouseup', handleMouseUpGlobal);
  }, []);

  const handleDayClick = useCallback(
    (formattedDate: string) => {
      const arr = Array.isArray(selectedDates) ? selectedDates : [];
      setSelectedDates(
        arr.includes(formattedDate)
          ? arr.filter((k) => k !== formattedDate)
          : [...arr, formattedDate],
      );
    },
    [selectedDates, setSelectedDates],
  );

  const handleMouseDown = useCallback((_e: React.MouseEvent, day: any) => {
    isDragging.current = true;
    dragStart.current = day;
  }, []);

  const handleMouseEnter = useCallback(
    (day: any) => {
      if (isDragging.current && dragStart.current && day) {
        selectRange(dragStart.current, day);
      }
    },
    [selectRange],
  );

  const handleMouseUp = useCallback((_day: any) => {
    if (isDragging.current) {
      return;
    }
    isDragging.current = false;
    dragStart.current = null;
  }, []);

  const daySlot = useCallback(
    (props: any) => (
      <CustomDay
        {...props}
        selectedSet={selectedSet}
        dateFormat={dateFormat}
        allowToggle={allowToggle}
        onDayClick={handleDayClick}
        onMouseDownHandler={handleMouseDown}
        onMouseEnterHandler={handleMouseEnter}
        onMouseUpHandler={handleMouseUp}
      />
    ),
    [
      selectedSet,
      dateFormat,
      allowToggle,
      handleDayClick,
      handleMouseDown,
      handleMouseEnter,
      handleMouseUp,
    ],
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
    <>
      <ValidationErrors
        id={id}
        clientErrors={clientErrors}
        serverErrors={serverErrors}
        serverErrorTypes={[]}
        diffs={diffs}
        dirty={dirty}
      />
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
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled || readonly}
        namespace={namespace}
      />
    </>
  );
}
