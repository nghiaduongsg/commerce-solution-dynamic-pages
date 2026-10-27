import React from 'react';
import { AnyType } from '@pkg-common/types';
import TruncatedInput from '@pkg-common/components/TruncatedInput/TruncatedInput';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { tokens } from '@pkg-theme/src/color-schemes';

const formatValue = (val: any): string => {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

const SingleValueRenderer = ({ value }: { value: AnyType }) => {
  const displayValue = formatValue(value);

  if (value === 'true' || value === true) {
    return <CheckBox sx={{ color: tokens.neutral[600] }} data-testid="CheckBoxIcon" />;
  } else if (value === 'false' || value === false) {
    return (
      <CheckBoxOutlineBlank
        sx={{ color: tokens.neutral[600] }}
        data-testid="CheckBoxOutlineBlank"
      />
    );
  } else {
    return (
      <TruncatedInput truncate={{ enabled: true, width: 300, lines: 1 }} title={displayValue}>
        {displayValue}
      </TruncatedInput>
    );
  }
};

export default SingleValueRenderer;
