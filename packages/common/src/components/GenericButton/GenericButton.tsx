import React from 'react';
import { Button } from '@mui/material';
import GenericButtonProps from './GenenicButton';
import ShortcutsTooltip from '@pkg-common/components/ShortcutsTooltip';
import WarningDialog from '@pkg-form/templates/ArrayTemplate/BasicTemplate/WarningDialog';
import { useButtonClick } from '@pkg-common/hooks/useButtonClick';

const GenericButton = ({
  id,
  variant,
  size,
  label,
  ariaLabel,
  ariaDescription,
  ariaKeyboardShortcuts,
  ariaControls,
  onClick,
  styles,
  type,
  disabled,
  testId,
  href,
  startIcon,
  endIcon,
  ariaHasPopup = false,
  warning,
  loading,
  color,
  openInNewTab,
}: GenericButtonProps) => {
  const { whenToWarn, translation } = warning || {};

  const { onConfirm, onButtonClick, onCancel, clicked, inProgress } = useButtonClick(
    warning,
    onClick,
    undefined,
    openInNewTab,
  );

  const ButtonComp = Button as React.ElementType;

  return (
    <ShortcutsTooltip label={ariaLabel || label} shortcuts={ariaKeyboardShortcuts}>
      <ButtonComp
        variant={variant ?? 'outlined'}
        color={(color ?? 'primary') as any}
        sx={styles ?? {}}
        id={id}
        tabIndex={0}
        data-testid={testId ?? id}
        onClick={onButtonClick as any}
        size={size ?? 'medium'}
        type={type ?? 'button'}
        disabled={disabled || inProgress}
        aria-disabled={disabled || inProgress}
        aria-label={ariaLabel ?? label}
        aria-describedby={ariaDescription ? `${id}-desc` : undefined}
        aria-keyshortcuts={ariaKeyboardShortcuts}
        aria-controls={ariaControls}
        href={href}
        endIcon={endIcon}
        startIcon={startIcon}
        aria-haspopup={ariaHasPopup}
        loading={loading}
      >
        {label || ariaLabel}
        {ariaDescription && (
          <span id={`${id}-desc`} style={{ display: 'none' }}>
            {ariaDescription}
          </span>
        )}
      </ButtonComp>
      {clicked && warning && warning?.fieldId && (
        <WarningDialog
          id={id}
          onConfirm={onConfirm}
          onClose={onCancel}
          warnOnAction={{ whenToWarn, translation }}
          open={clicked}
        />
      )}
    </ShortcutsTooltip>
  );
};

export default GenericButton;
