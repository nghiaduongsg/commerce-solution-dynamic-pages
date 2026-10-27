import React from 'react';
import { FormLabel } from '@mui/material';
import { AnyType } from '@pkg-common/types';

const FieldTitle = ({
  title,
  isValid = true,
  isBold = false,
  sx = {},
}: {
  title: string | JSX.Element | number;
  isValid?: boolean;
  isBold?: boolean;
  sx?: AnyType;
}) => {
  return (
    <FormLabel sx={isBold ? { fontWeight: 'bold', ...sx } : sx} error={!isValid}>
      {title}
    </FormLabel>
  );
};

export default FieldTitle;
