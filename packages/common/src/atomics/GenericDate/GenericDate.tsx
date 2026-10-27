import React, { useMemo } from 'react';
import { alpha, FormControl } from '@mui/material';
import { getAccessibilityErrorProps, getWidgetSize } from '@pkg-form/validations/utils/widgetUtils';
import { AdapterDateFns } from '@mui/x-date-pickers-pro/AdapterDateFns';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import noop from 'lodash/noop';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useTheme } from '@mui/material/styles';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { isValid, parse } from 'date-fns';
import { GenericDateProps } from './GenericDate.d';
import { parseDate } from '@pkg-common/utils/utils';

const getStyles = (theme, fieldSx) => {
  return {
    '& .MuiInputLabel-root': {
      fontFamily: `${theme.typography.fontFamily} !important`,
      fontSize: `${theme.typography.body1.fontSize} !important`,
      fontWeight: `${theme.typography.body1.fontWeight} !important`,
      lineHeight: `${theme.typography.body1.lineHeight} !important`,
      color: `${theme.palette.primary.dark} !important`,
      textTransform: 'uppercase',
      position: 'relative',
      top: '12px',
      left: '-12px',
    },
    '& .MuiPickersOutlinedInput-root': {
      height: '40px',
      paddingRight: theme.spacing(5),
      paddingLeft: theme.spacing(4),
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      '&:hover > fieldset': { borderColor: theme.palette?.grey[600] },
      '&:hover': { borderColor: theme.palette?.grey[600] },
      borderRadius: '4px',
      fieldset: {
        '&:hover': { border: `1px solid ${theme.palette?.grey[600]}` },
        '&:focused': {
          border: `1px solid ${theme.palette?.grey[600]}`,
          backgroundColor: theme.palette?.grey[600],
        },
      },
      '&:focused > fieldset': {
        border: `0.5px solid ${theme.palette?.grey[600]}`,
        backgroundColor: theme.palette?.primary.light,
      },
      legend: {
        maxWidth: 0,
      },
      ...fieldSx,
    },
    '& .MuiPickersSectionList-root': {
      paddingTop: 0,
      paddingBottom: 0,
      paddingRight: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      fontSize: theme.typography.body1.fontSize,
      width: 'auto',
    },
    '& .MuiIconButton-root': {
      cursor: 'pointer',
      border: `0.5px solid transparent`,
      padding: '5px',

      '&:hover,&:focus,&:active': {
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        border: `0.5px solid ${alpha(theme.palette?.primary.main, 0.6)}`,
      },
      '&.Mui-focusVisible': {
        color: theme.palette.primary.main,
        border: `0.5px solid ${alpha(theme.palette?.primary.main, 0.6)}`,
      },
    },
  };
};
const getSlotProps = (
  theme,
  inputProps,
  id,
  dataTestId,
  helpText,
  valid,
  dateFormat,
  label,
  description,
  readOnly,
  accessibilityErrorProps,
) => {
  return {
    field: {
      clearable: true,
    },
    clearButton: {
      'data-testid': `${dataTestId}-clear-btn`,
    },
    openPickerButton: {
      'data-testid': `${dataTestId}-open-picker-btn`,
    },
    leftArrowIcon: {
      sx: {
        color: theme.palette?.primary.dark,
        fontSize: 'large',
        margin: theme.spacing(2),
      },
    },
    rightArrowIcon: {
      sx: {
        color: theme.palette?.primary.dark,
        fontSize: 'large',
        margin: theme.spacing(2),
      },
    },
    textField: {
      id,
      className: 'test-date-widget',
      helperText: helpText,
      error: !valid,
      placeholder: dateFormat?.toLowerCase(),
      readOnly: readOnly,
      inputProps: {
        className: 'date-widget-input',
        variant: 'outlined',
        notched: false,
        'data-testid': dataTestId,
        'aria-label': label,
        'aria-description': description,
        ...accessibilityErrorProps,
      },
      InputProps: {
        ...inputProps,
        variant: 'outlined',
        notched: false,
        autoComplete: 'off',
      },
      InputLabelProps: {
        shrink: true,
        className: 'date-widget-label',
      },
    },
    popper: {
      sx: {
        // '& .MuiPickersToolbarText-root': {
        //   display: formatAs === 'monthDay' ? 'none' : undefined,
        // },
        // '& .MuiPickersCalendarHeader-root': {
        //   display: formatAs === 'monthDay' ? 'none' : undefined,
        // },
      },
    },
  };
};

const GenericDate = ({
  id,
  dataTestId,
  label,
  styledFieldLabel,
  description,
  value,
  disabled,
  readonly,
  formatAs,
  locale,
  widthSize,
  fullWidth,
  dateFormat,
  minDate,
  maxDate,
  minTime,
  maxTime,
  minutesStep,
  disableDates,
  onChange,
  inputProps,
  helpText,
  valid,
  errors,
  fieldSx = {},
  open,
  onOpen,
  onClose,
}: GenericDateProps) => {
  const theme = useTheme();

  let PickerComponent: React.ComponentType<any>;
  switch (formatAs) {
    case 'datetime':
    case 'dateTimeNoTimeZone':
    case 'dateTimeWithTimeZone':
      PickerComponent = DateTimePicker;
      break;
    case 'time':
      PickerComponent = TimePicker;
      break;
    default:
      PickerComponent = DatePicker;
  }

  const memoizedWidgetSize = useMemo(() => {
    return getWidgetSize(widthSize, fullWidth);
  }, [widthSize, fullWidth]);

  const dateValue = useMemo(() => {
    if (!value) return null;
    let parsed;

    switch (formatAs) {
      case 'time':
        parsed = parse(value, 'HH:mm', new Date());
        break;
      case 'date':
      case 'monthDay':
        parsed = parseDate(value);
        break;
      default:
        parsed = new Date(value);
    }

    return isValid(parsed) ? parsed : null;
  }, [value, formatAs]);

  const accessibilityErrorProps = useMemo(() => {
    return getAccessibilityErrorProps(id, !valid);
  }, [valid, id]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
      <FormControl title={label} sx={memoizedWidgetSize}>
        <PickerComponent
          label={styledFieldLabel ?? label}
          value={dateValue}
          onChange={onChange}
          minutesStep={minutesStep}
          viewRenderers={
            formatAs === 'datetime' ||
            formatAs === 'dateTimeNoTimeZone' ||
            formatAs === 'dateTimeWithTimeZone'
              ? {
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                  seconds: renderTimeViewClock,
                }
              : {}
          }
          sx={{ ...getStyles(theme, fieldSx) }}
          format={dateFormat}
          open={open}
          onOpen={onOpen}
          onClose={onClose}
          slotProps={getSlotProps(
            theme,
            inputProps,
            id,
            dataTestId,
            helpText,
            valid,
            formatAs,
            label,
            description ?? helpText,
            readonly || disabled,
            accessibilityErrorProps,
          )}
          minDate={parseDate(minDate)}
          maxDate={parseDate(maxDate)}
          minTime={minTime ? new Date(minTime) : undefined}
          maxTime={maxTime ? new Date(maxTime) : undefined}
          shouldDisableDate={disableDates}
          disabled={disabled || readonly}
          onError={noop}
        />
      </FormControl>
      {errors}
    </LocalizationProvider>
  );
};
export default GenericDate;
