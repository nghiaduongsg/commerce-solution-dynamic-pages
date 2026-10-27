import React from 'react';
import { LinearProgress, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnyType } from '@pkg-common/types';

const useStyles = () => {
  return {
    root: {
      width: '100%',
      marginTop: useTheme().spacing(8),
    },
  };
};

export default function LinearLoader({
  styles = {},
  ariaLabel,
}: {
  styles?: AnyType;
  ariaLabel: string;
}) {
  const classes = useStyles();

  return (
    <Box sx={classes.root} style={{ ...styles }}>
      <LinearProgress aria-busy={true} aria-label={ariaLabel} />
    </Box>
  );
}
