import React from 'react';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import useItem from '@pkg-form/templates/ArrayTemplate/hooks/useItem';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { useTheme } from '@mui/material/styles';

import { ArrayItemProps } from '@pkg-form/templates/ArrayItem/ArrayItem';
import { Box } from '@mui/material';
import { hasValue } from '@pkg-common/utils';

const getStyles = (theme) => ({
  containerActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorIcon: {
    color: theme.palette?.error.main,
  },
});

const TableItem = ({
  id,
  item,
  onDeleteConfirmPressed,
  onDelete,
  onEdit,
  onDuplicate,
  buttons,
}: ArrayItemProps) => {
  const classes = getStyles(useTheme());

  const { index } = item;

  const deleteConfirm = buttons?.buttons?.find(
    (btn) => btn.type === 'DELETE' && !hasValue(btn.warnOnAction),
  );

  const { isValid, defaultActions } = useItem(id, {
    onEdit,
    onDuplicate: () => onDuplicate(index),
    onDelete: deleteConfirm ? onDelete : onDeleteConfirmPressed,
  });

  if (!buttons) {
    return null;
  }

  return (
    <Box sx={classes.containerActions}>
      <AppActions
        page={{ id }}
        actions={buttons}
        checkPermissions={true}
        defaultActions={defaultActions}
      />
      {!isValid && (
        <AssetByType input="icons" name="ErrorOutline" props={{ className: classes.errorIcon }} />
      )}
    </Box>
  );
};

export default TableItem;
