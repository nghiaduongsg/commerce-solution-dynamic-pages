import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Card, CardContent, Typography } from '@mui/material';
import { InfoRounded } from '@mui/icons-material';

const getStyles = (theme) => {
  return {
    card: {
      marginBottom: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      width: '100%',
      boxShadow: 'none',
      backgroundColor: theme.palette?.primary.light,
      pointerEvents: 'none',
      borderRadius: theme.spacing(4),
      borderLeft: `7px solid ${theme.palette?.primary.main}`,
    },
    icon: {
      color: theme.palette?.primary.main,
      marginRight: theme.spacing(2),
    },
  };
};

const GenericInfoCard = ({ info, children }: { info: string; children?: React.ReactNode }) => {
  const styles = getStyles(useTheme());

  return (
    <Card sx={styles.card}>
      <CardContent style={{ display: 'flex' }}>
        <InfoRounded sx={styles.icon}></InfoRounded>
        <Typography variant="body1">{info}</Typography>
        {children}
      </CardContent>
    </Card>
  );
};

export default GenericInfoCard;
