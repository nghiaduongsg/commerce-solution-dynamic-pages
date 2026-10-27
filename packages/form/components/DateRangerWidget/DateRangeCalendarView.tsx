import React, { useRef, useCallback } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Box, Divider } from '@mui/material';
import dayjs from 'dayjs';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTranslation } from 'react-i18next';

const KEYBOARD_NEXT = 'keyboard_next';
const KEYBOARD_PREVIOUS = 'keyboard_previous';
const BUTTON = 'button';

interface DateRangeCalendarViewProps {
  id: string;
  calendars: number;
  calendarKeys: number[];
  baseMonth: any;
  daySlot: (props: any) => React.ReactNode;
  calendarHeaderSlot: (props: any) => React.ReactNode;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onCalendarKeysChange?: (updater: (prev: number[]) => number[]) => void;
  minDate?: any;
  maxDate?: any;
  disabled?: boolean;
  namespace?: string;
}

const DateRangeCalendarView = ({
  id,
  calendars,
  calendarKeys,
  baseMonth,
  daySlot,
  calendarHeaderSlot,
  onPreviousMonth,
  onNextMonth,
  onCalendarKeysChange,
  minDate,
  maxDate,
  disabled,
  namespace,
}: DateRangeCalendarViewProps) => {
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation(namespace ? [COMMON, namespace] : [COMMON]);
  const lastNavigationMethod = useRef<string | null>(null);

  const calendarCount = Math.min(calendars, 6);
  const monthOffsets = Array.from({ length: calendarCount }, (_, i) => i);

  const bumpCalendarKey = useCallback(
    (index: number) => {
      onCalendarKeysChange?.((prev) => prev.map((k, idx) => (idx === index ? k + 1 : k)));
    },
    [onCalendarKeysChange],
  );

  const handleMonthChange = useCallback(
    (calendarIndex: number) => (newMonth: any) => {
      if (
        newMonth &&
        (lastNavigationMethod.current === KEYBOARD_NEXT ||
          lastNavigationMethod.current === KEYBOARD_PREVIOUS)
      ) {
        const visibleMonths = monthOffsets.map((offset) =>
          baseMonth.add(offset, 'month').startOf('month'),
        );

        if (newMonth.isBefore(visibleMonths[0], 'month')) {
          onPreviousMonth();
        } else if (newMonth.isAfter(visibleMonths[visibleMonths.length - 1], 'month')) {
          onNextMonth();
        }

        if (
          !newMonth.isBefore(visibleMonths[0], 'month') &&
          !newMonth.isAfter(visibleMonths[visibleMonths.length - 1], 'month')
        ) {
          bumpCalendarKey(calendarIndex);
        }

        const lastNavigation = lastNavigationMethod.current;
        setTimeout(() => {
          const selector =
            lastNavigation === KEYBOARD_NEXT
              ? `[aria-label="${newMonth.startOf('month').format('D MMMM YYYY')}"]`
              : `[aria-label="${newMonth.endOf('month').format('D MMMM YYYY')}"]`;
          const newDay = document.querySelector(selector);
          if (newDay instanceof HTMLElement) {
            newDay.focus();
          }
        }, 50);
      }
      lastNavigationMethod.current = null;
    },
    [monthOffsets, baseMonth, onPreviousMonth, onNextMonth, onCalendarKeysChange],
  );

  const goToPreviousMonth = () => {
    lastNavigationMethod.current = BUTTON;
    onPreviousMonth();
  };

  const goToNextMonth = () => {
    lastNavigationMethod.current = BUTTON;
    onNextMonth();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" alignItems="center" gap={2}>
        <GenericIconButton
          id={`${id}-arrowBack-btn`}
          testId={`${id}-arrowBack-btn`}
          ariaLabel={translate('previousMonthAriaLabel', { ns: COMMON, lng: selectedLanguage })}
          onClick={goToPreviousMonth}
          icon={<AssetByType input="icons" name="ArrowBack" />}
        />

        <Box
          display="grid"
          gridTemplateColumns={{
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, auto)',
          }}
          rowGap={2}
          columnGap={2}
          justifyItems="center"
          alignItems="stretch"
        >
          {monthOffsets.map((offset, i) => (
            <React.Fragment key={offset}>
              <Box
                display="flex"
                alignItems="stretch"
                sx={{
                  position: 'relative',
                  width: 270,
                }}
              >
                <DateCalendar
                  key={calendarKeys[i]}
                  disabled={disabled}
                  value={baseMonth.add(offset, 'month')}
                  referenceDate={baseMonth.add(offset, 'month')}
                  slots={{
                    day: daySlot,
                    calendarHeader: calendarHeaderSlot,
                  }}
                  slotProps={{ calendarHeader: { hidden: true } as any }}
                  views={['day']}
                  minDate={minDate ? dayjs(minDate) : undefined}
                  maxDate={maxDate ? dayjs(maxDate) : undefined}
                  sx={{ width: 300 }}
                  onMonthChange={handleMonthChange(i)}
                />

                {i < monthOffsets.length - 1 && i != 2 && (
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      display: { xs: 'none', md: 'block' },
                      position: 'absolute',
                      right: -5,
                      top: 0,
                      height: '100%',
                    }}
                  />
                )}
              </Box>
            </React.Fragment>
          ))}
        </Box>

        <GenericIconButton
          id={`${id}-arrowForward-btn`}
          testId={`${id}-arrowForward-btn`}
          ariaLabel={translate('nextMonthAriaLabel', { ns: COMMON, lng: selectedLanguage })}
          onClick={goToNextMonth}
          icon={<AssetByType input="icons" name="ArrowForward" />}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangeCalendarView;
