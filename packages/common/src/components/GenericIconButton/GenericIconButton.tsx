import React, { forwardRef } from 'react';
import { IconButton } from '@mui/material';
import GenericIconButtonProps from './GenenicIconButton';
import ShortcutsTooltip from '../ShortcutsTooltip';
import WarningDialog from '@pkg-form/templates/ArrayTemplate/BasicTemplate/WarningDialog';
import { useButtonClick } from '@pkg-common/hooks/useButtonClick';

const GenericIconButton = forwardRef(
  (
    {
      id,
      label,
      ariaLabel,
      ariaDescription,
      ariaControls,
      size = 'small',
      ariaHasPopup = false,
      onClick,
      icon,
      disabled,
      testId,
      ariaExpanded,
      styles,
      ariaKeyboardShortcuts,
      warning,
      applyDebounce = true,
      onKeyDown,
      openInNewTab,
    }: GenericIconButtonProps,
    ref,
  ) => {
    const { fieldId, whenToWarn, translation } = warning || {};

    const { onConfirm, onButtonClick, onCancel, clicked, inProgress } = useButtonClick(
      warning,
      onClick,
      // @ts-ignore
      ref,
      openInNewTab,
    );

    return (
      <ShortcutsTooltip label={ariaLabel ?? label} shortcuts={ariaKeyboardShortcuts}>
        {/*@ts-ignore*/}
        <IconButton
          ref={ref}
          sx={{ ...styles, ...(disabled && ['Mui-disabled']) }}
          role="button"
          onClick={applyDebounce ? onButtonClick : onClick}
          data-testid={testId}
          id={id}
          aria-haspopup={ariaHasPopup}
          aria-controls={ariaControls}
          aria-label={ariaLabel ?? label}
          aria-disabled={disabled || inProgress}
          aria-describedby={ariaDescription ? `${id}-desc` : undefined}
          aria-expanded={ariaExpanded}
          aria-keyshortcuts={ariaKeyboardShortcuts}
          tabIndex={0}
          size={size}
          disabled={disabled || inProgress}
          onKeyDown={onKeyDown}
        >
          {icon}
        </IconButton>
        {ariaDescription && (
          <span id={`${id}-desc`} style={{ display: 'none' }}>
            {ariaDescription}
          </span>
        )}
        {warning && fieldId && (
          <WarningDialog
            id={fieldId}
            onConfirm={onConfirm}
            onClose={onCancel}
            warnOnAction={{ whenToWarn, translation }}
            open={clicked}
          />
        )}
      </ShortcutsTooltip>
    );
  },
);

export default GenericIconButton;
