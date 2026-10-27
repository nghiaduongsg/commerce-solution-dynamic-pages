import React, { SyntheticEvent, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { SimpleDialogProps } from './SimpleDialog.d';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import { CLOSE_MODALS_SHORTCUT } from '@pkg-constants/keyboardShortcuts';
import { hasValue } from '@pkg-common/utils';
import useLatestButtonAction from '@pkg-common/button/useLatestButtonAction';

export default function SimpleDialog({
  id,
  children,
  title,
  open,
  onClose,
  size = 'sm',
  fullWidth = true,
  keepMounted = true,
  isSimple = false,
  buttons,
  filters = false,
}: SimpleDialogProps) {
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const firstMounted = useRef(false);
  const { latestButtonAction, clearLatestButtonAction } = useLatestButtonAction();
  const handleStopPropagation = (e: SyntheticEvent): void => e?.stopPropagation();

  useEffect(() => {
    if (!firstMounted.current && open && keepMounted) {
      firstMounted.current = true;
    }
  }, [keepMounted, open]);

  const handleClose = () => {
    if (hasValue(latestButtonAction)) {
      clearLatestButtonAction();
    }
    if (onClose) {
      onClose();
    }
  };

  if (!firstMounted.current && !open && !keepMounted) {
    return null;
  }

  if (firstMounted.current) {
    return (
      <Dialog
        onKeyDown={handleStopPropagation}
        onClick={handleStopPropagation}
        onMouseDown={handleStopPropagation}
        onMouseUp={handleStopPropagation}
        onPointerDown={handleStopPropagation}
        onPointerUp={handleStopPropagation}
        open={open}
        onClose={handleClose}
        maxWidth={size}
        fullWidth={fullWidth}
        keepMounted={true}
        autoFocus={true}
        slotProps={{
          paper: {
            id,
            'aria-labelledby': !isSimple ? `${id}-dialog-title` : undefined,
            'aria-label': isSimple ? title : undefined,
            role: 'dialog',
            'aria-modal': 'true',
            'aria-hidden': !open,
          },
        }}
      >
        {!isSimple && (
          <DialogTitle>
            <div
              style={{ fontSize: '1rem' }}
              id={`${id}-dialog-title`}
              data-testid={`${id}-dialog-title`}
            >
              {title}
            </div>
            {onClose && (
              <GenericIconButton
                id={`${id}-close-dialog-btn`}
                label={translate('close', { ns: COMMON, lng: selectedLanguage })}
                ariaLabel={translate('close', { ns: COMMON, lng: selectedLanguage })}
                onClick={handleClose}
                ariaKeyboardShortcuts={CLOSE_MODALS_SHORTCUT}
                icon={<AssetByType input="icons" name="Close" />}
              />
            )}
          </DialogTitle>
        )}
        <DialogContent dividers sx={filters || isSimple ? { padding: 0 } : {}}>
          {children}
        </DialogContent>
        {buttons && <DialogActions>{buttons}</DialogActions>}
      </Dialog>
    );
  } else
    return (
      <Dialog
        onKeyDown={handleStopPropagation}
        onClick={handleStopPropagation}
        onMouseDown={handleStopPropagation}
        onMouseUp={handleStopPropagation}
        onPointerDown={handleStopPropagation}
        onPointerUp={handleStopPropagation}
        open={open}
        onClose={handleClose}
        maxWidth={size}
        fullWidth={fullWidth}
        keepMounted={false}
        autoFocus={true}
        slotProps={{
          paper: {
            id,
            'aria-labelledby': !isSimple ? `${id}-dialog-title` : undefined,
            'aria-label': isSimple ? title : undefined,
            role: 'dialog',
            'aria-modal': 'true',
            'aria-hidden': !open,
          },
        }}
      >
        {!isSimple && (
          <DialogTitle>
            <div
              style={{ fontSize: '1rem' }}
              id={`${id}-dialog-title`}
              data-testid={`${id}-dialog-title`}
            >
              {title}
            </div>
            {onClose && (
              <GenericIconButton
                id={`${id}-close-dialog-btn`}
                label={translate('close', { ns: COMMON, lng: selectedLanguage })}
                ariaLabel={translate('close', { ns: COMMON, lng: selectedLanguage })}
                onClick={handleClose}
                icon={<AssetByType input="icons" name="Close" />}
              />
            )}
          </DialogTitle>
        )}
        <DialogContent
          dividers
          sx={filters ? { padding: '0px' } : {}}
          onKeyDown={(e) => {
            if (e.key.toLowerCase() === 'r') e.stopPropagation();
          }}
        >
          {children}
        </DialogContent>
        {buttons && <DialogActions>{buttons}</DialogActions>}
      </Dialog>
    );
}
