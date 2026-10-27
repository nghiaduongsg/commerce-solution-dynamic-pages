import React from 'react';
import { Grid } from '@mui/material';
import { FormColumns } from '@pkg-form/types';
import useFieldVisibility from '@pkg-form/hooks/useFieldVisibility';
import { AnyType } from '@pkg-common/types';

const getStyles = () => {
  return {
    containerHidden: {
      display: 'none',
      height: 0,
    },
    container: {
      margin: 0,
      padding: 0,
    },
  };
};

const FormWidgetContainer = ({
  id,
  children,
  xsColumns,
  smColumns,
  mdColumns,
  lgColumns,
  xlColumns,
}: {
  namespace: string;
  id: string;
  children: AnyType;
  xsColumns: FormColumns;
  smColumns: FormColumns;
  mdColumns: FormColumns;
  lgColumns: FormColumns;
  xlColumns: FormColumns;
}) => {
  const styles = getStyles();

  const options = children?.props?.uiSchema['ui:options'];
  const readonly = children?.props?.uiSchema['ui:readonly'];
  const disabled = children?.props?.uiSchema['ui:disabled'];
  const buttons = children?.props?.uiSchema['ui:buttons'];
  const template = children?.props?.uiSchema['ui:template'];
  const { visible, preventRender } = useFieldVisibility(id, readonly, disabled, options);
  const { clearFrom } = options || {};

  // TODO: Examine if this is needed. This is a group container. Therefore when we have a 'ClearFrom'
  // we need to maintain the DOM elements in order for them to clear the values.
  if (!visible && preventRender && !clearFrom) {
    return null;
  }

  return (
    <Grid
      key={id}
      size={{ xs: xsColumns, sm: smColumns, md: mdColumns, lg: lgColumns, xl: xlColumns }}
      sx={visible ? styles.container : styles.containerHidden}
      spacing={4}
    >
      {(template || !buttons) && children}
      {buttons && !template && (
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
      )}
    </Grid>
  );
};

export default FormWidgetContainer;
