import React from 'react';
import { Box } from '@mui/material';

interface CalendarHeaderProps {
  currentMonth: any;
  translate: (key: string, options?: any) => string;
  selectedLanguage: string;
  namespace?: string;
}

const CalendarHeader = ({
  currentMonth,
  translate,
  selectedLanguage,
  namespace,
}: CalendarHeaderProps) => {
  const monthName = translate(currentMonth?.format('MMMM'), {
    ns: namespace,
    lng: selectedLanguage,
  });

  return (
    <Box textAlign="center" py={1} fontWeight="bold">
      {`${monthName} ${currentMonth?.format('YYYY')}`}
    </Box>
  );
};

export default CalendarHeader;
