import React from 'react';
import { Box, Typography } from '@mui/material';
import { DateAvailabilityIndicatorWidgetProps } from './DateAvailabilityIndicatorWidget.d';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import useFormData from '@pkg-common/dataResolver/useFormData';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import { FormWidgetProps } from '@pkg-form/types';
import ReadOnlyField from '../ReadOnlyField/ReadOnlyField';

const DateAvailabilityIndicatorWidget = ({
  id,
  schema,
  uiSchema,
  options,
  formContext,
}: FormWidgetProps & { options: DateAvailabilityIndicatorWidgetProps }) => {
  const {
    showDates = false,
    showWeekDays = false,
    orientation = 'horizontal',
    statuses,
    valueFrom,
  } = options;

  const { value: dateAvailabilityData } = useFormData(id, valueFrom);

  const { readOnlyLabel } = useWidgetUtils(schema, options, formContext);

  const sortAvailability = (dateAvailability: Record<string, string>) => {
    const dates = Object.keys(dateAvailability);
    return dates
      .map((date) => [date, dateAvailability[date]] as [string, string])
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());
  };

  const getIcon = (status: string) => {
    const statusConfig = statuses.find((s) => s.status === status);

    if (!statusConfig) {
      return <Typography variant="body1">{status}</Typography>;
    } else {
      return (
        <AssetByType
          input="icons"
          name={statusConfig.icon}
          fallbackText={status}
          props={{
            sx: {
              color: statusConfig.color,
              ...statusConfig.iconStyles,
            },
          }}
        />
      );
    }
  };

  const sortedEntries = sortAvailability(dateAvailabilityData || []);

  const dateAvailability = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        gap: 1.5,
      }}
    >
      {sortedEntries.map(([date, status]) => (
        <Box
          key={date}
          sx={{
            display: 'flex',
            flexDirection: orientation === 'horizontal' ? 'column' : 'row',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {orientation === 'horizontal' && showWeekDays && (
            <Box sx={{ whiteSpace: 'nowrap' }}>
              {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
            </Box>
          )}
          {getIcon(status)}
          {orientation !== 'horizontal' && showWeekDays && (
            <Box>{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</Box>
          )}
          {showDates && <Box>{date.slice(-2)}</Box>}
        </Box>
      ))}
    </Box>
  );

  return (
    <ReadOnlyField id={id} title={readOnlyLabel} uiSchema={uiSchema} value={dateAvailability} />
  );
};

export default DateAvailabilityIndicatorWidget;
