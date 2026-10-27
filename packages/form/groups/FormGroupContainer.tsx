import React, { ReactElement } from 'react';
import { Grid } from '@mui/material';

const getStyles = () => {
  return {
    container: {
      width: '100%',
      padding: 0,
      margin: 0,
    },
    containerUnique: {
      width: '100%',
      padding: 0,
      margin: 0,
    },
    containerHidden: {
      display: 'none',
      height: 0,
    },
  };
};

const FormGroupContainer = ({
  children,
  visible,
  totalGroups,
  applySpacing = true,
  columns,
}: {
  children: Array<ReactElement | null | undefined> | ReactElement;
  totalGroups: number;
  visible?: boolean;
  applySpacing?: boolean;
  columns;
}) => {
  const styles = getStyles();

  return (
    <Grid
      size={{
        xs: columns?.xs || 12,
        sm: columns?.sm || 12,
        md: columns?.md || 12,
        lg: columns?.lg || 12,
        xl: columns?.xl || 12,
      }}
      sx={
        !visible
          ? styles.containerHidden
          : totalGroups === 1 || !applySpacing
            ? styles.containerUnique
            : styles.container
      }
    >
      {children}
    </Grid>
  );
};

export default FormGroupContainer;
