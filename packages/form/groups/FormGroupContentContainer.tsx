import React, { ReactElement } from 'react';
import { Box, Grid, GridSpacing } from '@mui/material';
import { AnyType } from '@pkg-common/types';
import { SxProps } from '@mui/system';

const useStyles = () => {
  return {
    container: {
      padding: 0,
      margin: 0,
      width: '100%',
      // marginTop: 8
    },
  };
};

const FormGroupContentContainer = ({
  children,
  alignContent = 'flex-start',
  spacing,
  sx = {},
}: {
  children: Array<ReactElement | null | undefined> | ReactElement;
  alignContent?: AnyType;
  spacing?: GridSpacing;
  sx?: SxProps;
}) => {
  const styles = useStyles();

  return (
    <Grid
      container
      alignItems="flex-start"
      justifyContent={alignContent}
      wrap="wrap"
      direction="row"
      sx={{ ...styles.container, ...sx }}
      spacing={spacing || 2}
    >
      {children}
    </Grid>
  );
};

export default FormGroupContentContainer;
