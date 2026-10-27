import React from 'react';
import FormattedDateProps from './FormattedDate.d';
import { Typography } from '@mui/material';
import { format } from 'date-fns';
import useDate from '@pkg-common/hooks/useDate';
import { parseDate, ISO_DATETIME_REGEX } from '@pkg-common/utils/utils';

const FormattedDate = ({ id, value, type }: FormattedDateProps) => {
  let formattedDate: string;

  const dateFormat = useDate(type);

  try {
    const parsed = ISO_DATETIME_REGEX.test(value) ? new Date(value) : parseDate(value);
    formattedDate = parsed ? format(parsed, dateFormat || '') : value;
  } catch (error) {
    formattedDate = value;
  }

  return (
    <Typography id={id} variant="inherit">
      {formattedDate}
    </Typography>
  );
};
export default FormattedDate;
