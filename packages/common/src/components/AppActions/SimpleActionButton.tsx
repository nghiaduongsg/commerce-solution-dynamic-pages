import React, { useContext } from 'react';
import { Button, ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { AnyType } from '@pkg-common/types';
import WarningDialog from '@pkg-form/templates/ArrayTemplate/BasicTemplate/WarningDialog';
import {
  DELETE_FOCUSED_ITEM_FROM_LIST_SHORTCUT,
  DUPLICATE_FOCUSED_ITEM_FROM_LIST_SHORTCUT,
  EDIT_FOCUSED_ITEM_FROM_LIST_SHORTCUT,
  EDIT_FOCUSED_ITEM_FROM_LIST_IN_NEW_TAB_SHORTCUT,
} from '@pkg-constants/keyboardShortcuts';
import { useButtonClick } from '@pkg-common/hooks/useButtonClick';
import useButtonPress from '@pkg-common/button/useButtonPress';
import { WithLink } from '@pkg-common/components/AppActions/WithLink';
import MenuContext from './MenuContext';

const keyboardShortcuts = {
  edit_list_item: [
    EDIT_FOCUSED_ITEM_FROM_LIST_SHORTCUT,
    EDIT_FOCUSED_ITEM_FROM_LIST_IN_NEW_TAB_SHORTCUT,
  ],
  delete_list_item: DELETE_FOCUSED_ITEM_FROM_LIST_SHORTCUT,
  duplicate_list_item: DUPLICATE_FOCUSED_ITEM_FROM_LIST_SHORTCUT,
};

export default function SimpleActionButton({
  id,
  elementId,
  icon,
  dataTestId,
  disabled,
  onClick,
  sx,
  warning,
  title,
  defaultIcon,
  finalApi,
  isRedirect = false,
  openInNewTab = false,
}: AnyType) {
  const { whenToWarn, translation } = warning ?? {};
  const { onConfirm, onButtonClick, onCancel, clicked } = useButtonClick(
    warning,
    onClick,
    undefined,
    openInNewTab,
  );

  const { markButtonPress } = useButtonPress(`${id}_btn_call_delete`);

  const shortcut = keyboardShortcuts[icon?.toLowerCase() ?? ''];
  const ariaShortcuts = Array.isArray(shortcut) ? shortcut.join(' ') : shortcut ?? '';

  const inMenu = useContext(MenuContext);

  const buttonId = elementId
    ? `${id}-${elementId}-${icon?.toLowerCase()}-btn`
    : `${id}-${icon?.toLowerCase()}-btn`;

  const content = (
    <WithLink finalApi={finalApi} isRedirect={isRedirect}>
      {icon && <ListItemIcon>{defaultIcon}</ListItemIcon>}
      {title && (
        <ListItemText id={`${title}-element:${elementId}-action-btn`}>{title}</ListItemText>
      )}
    </WithLink>
  );

  const buttonProps = {
    onClick: onButtonClick,
    id: buttonId,
    'data-testid': dataTestId,
    'aria-keyshortcuts': ariaShortcuts,
    'aria-label': title,
    disabled,
    'aria-haspopup': !!warning,
    'aria-controls': warning ? 'confirmation-dialog' : undefined,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onButtonClick(e);
      }
    },
  };

  return (
    <>
      {inMenu ? (
        <MenuItem
          {...buttonProps}
          tabIndex={0}
          selected={clicked}
          disableRipple
          sx={{ ...sx, ...(disabled ? { pointerEvents: 'none' } : {}) }}
        >
          {content}
        </MenuItem>
      ) : (
        <Button
          {...buttonProps}
          variant="text"
          size="small"
          type="button"
          sx={{ ...sx, ...(disabled ? { pointerEvents: 'none' } : {}) }}
        >
          {content}
        </Button>
      )}
      {warning && warning?.fieldId && (
        <WarningDialog
          id={id}
          onConfirm={(e) => {
            onConfirm(e);
            markButtonPress();
          }}
          onClose={onCancel}
          warnOnAction={{ whenToWarn, translation }}
          open={clicked}
        />
      )}
    </>
  );
}
