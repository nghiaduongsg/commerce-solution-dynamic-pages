import React, { ReactElement } from 'react';
import { Typography, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { hasValue } from '@pkg-common/utils';
import useStyles from './styles';
import GenericCard from '@pkg-common/atomics/GenericCard/GenericCard';

export interface CardDisplayProps {
  id: string;
  testId?: string;
  title?: string;
  formattedValue: string | ReactElement;
  rawValue: string;
}

const CardDisplay: React.FC<CardDisplayProps> = ({
  title,
  testId,
  formattedValue,
  id,
  rawValue,
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  return (
    <GenericCard
      id={id}
      title={title}
      testId={testId}
      showTitle={false}
      styleOverrides={styles?.card}
    >
      <Typography variant="body1" sx={styles.value}>
        {title}
      </Typography>
      <Tooltip title={`${title} ${rawValue}`} role={hasValue(rawValue) ? 'tooltip' : undefined}>
        <Typography variant="h3" component={'span'} sx={styles.value}>
          {formattedValue ?? '-'}
        </Typography>
      </Tooltip>
    </GenericCard>
  );
};

export default CardDisplay;
