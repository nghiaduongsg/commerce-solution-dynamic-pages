import React from 'react';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';

interface CustomDayProps {
  day: any;
  selected?: boolean;
  disabled?: boolean;
  selectedSet: Set<string>;
  dateFormat: string;
  allowToggle?: boolean;
  onDayClick?: (formattedDate: string) => void;
  onMouseDownHandler?: (e: React.MouseEvent, day: any) => void;
  onMouseEnterHandler?: (day: any) => void;
  onMouseUpHandler?: (day: any) => void;
  [key: string]: any;
}

const CustomDay = ({
  selectedSet,
  dateFormat,
  allowToggle = true,
  onDayClick,
  onMouseDownHandler,
  onMouseEnterHandler,
  onMouseUpHandler,
  ...props
}: CustomDayProps) => {
  const theme = useTheme();

  let isSelected = false;
  let date: Date | null = null;
  let formattedDate: string | null = null;

  const day = props?.day;

  try {
    date = new Date(day);
    formattedDate = format(date, dateFormat);
    isSelected = selectedSet.has(formattedDate);
  } catch {}

  return (
    <PickersDay
      {...(props as any)}
      selected={isSelected}
      aria-label={props?.day.format('D MMMM YYYY')}
      aria-selected={isSelected}
      disabled={!allowToggle}
      onMouseDown={(e: React.MouseEvent) => {
        if (e.button === 0 && day && onMouseDownHandler) {
          onMouseDownHandler(e, day);
        }
      }}
      onMouseEnter={() => {
        if (day && onMouseEnterHandler) {
          onMouseEnterHandler(day);
        }
      }}
      onMouseUp={() => {
        if (day && onMouseUpHandler) {
          onMouseUpHandler(day);
        }
      }}
      onClick={(e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (formattedDate && onDayClick) {
          onDayClick(formattedDate);
        }
      }}
      sx={{
        bgcolor: isSelected ? theme.palette?.primary.main : undefined,
        color: isSelected ? 'white' : undefined,
        '&.MuiPickersDay-today': {
          border: 'none',
        },
        ...(isSelected && {
          bgcolor: `${theme.palette?.primary.main} !important`,
          color: `white !important`,
          fontWeight: `bold !important`,
        }),
        '&.MuiPickersDay-root': {
          '&:hover': {
            bgcolor: isSelected ? alpha(theme.palette?.primary.main, 0.8) : undefined,
            color: isSelected ? 'white' : undefined,
          },
          '&:focus': {
            backgroundColor: isSelected
              ? alpha(theme.palette?.primary.main, 0.8)
              : alpha(theme.palette?.primary.dark, 0.04),
            color: isSelected ? 'white' : undefined,
          },
        },
      }}
    />
  );
};

export default CustomDay;
