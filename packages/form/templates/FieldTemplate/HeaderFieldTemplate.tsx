import React, { ReactElement } from 'react';
import FieldTitle from '@pkg-form/templates/FieldTitle/FieldTitle';
import { Grid } from '@mui/material';
import { AnyType } from '@pkg-common/types';

const styles = {
  widget: {
    paddingTop: '12px',
    margin: 0,
    width: '100%',
  },
};

const HeaderFieldTemplate = ({
  id,
  title,
  children,
  isValid,
}: {
  id: string;
  title: ReactElement;
  children: ReactElement;
  isValid: boolean;
}) => {
  return (
    <Grid
      id={`${id}-field-container`}
      container
      alignItems="center"
      justifyContent="flex-start"
      wrap="wrap"
      direction="row"
      sx={styles.widget}
    >
      <FieldTitle title={title} isValid={isValid} />
      {children}
    </Grid>
  );
};

export default HeaderFieldTemplate;
