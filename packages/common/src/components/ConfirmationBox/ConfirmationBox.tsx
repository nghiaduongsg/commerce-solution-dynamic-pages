import React from 'react';
import { Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';
import GenericButton from '@pkg-common/components/GenericButton/GenericButton';
import ConfirmationBoxProps from './ConfirmationBox.d';
import { focusTrap } from '@pkg-common/utils';

const ConfirmationBox = ({
  open,
  onClose,
  title,
  message,
  choices,
  testId,
}: ConfirmationBoxProps): React.JSX.Element => {
  return (
    <Dialog
      open={open}
      onKeyDown={(e) => e.stopPropagation()}
      onClose={() => onClose()}
      onClick={(e) => e.stopPropagation()}
      aria-labelledby={`confirmation-dialog-title`}
      aria-describedby={`confirmation-message`}
      role="dialog"
      keepMounted={false}
      autoFocus={true}
      slotProps={{
        paper: {
          id: `confirmation-dialog-${title}`,
          'aria-labelledby': 'confirmation-dialog-title',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-hidden': !open,
          onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => focusTrap(e),
        },
      }}
    >
      {title && (
        <DialogTitle>
          <div style={{ fontSize: '1rem' }} id="confirmation-dialog-title">
            {title}
          </div>
        </DialogTitle>
      )}
      <DialogContent
        id="confirmation-message"
        data-testid={testId ?? 'confirmation-message'}
        dividers
      >
        {message}
      </DialogContent>
      <DialogActions>
        {choices.map((choice, i) => (
          <GenericButton
            id={`confirmation-dialog-${choice.testId ?? choice.label}-btn`}
            key={i}
            onClick={() => {
              choice.action && choice.action();
              onClose();
            }}
            label={choice.label}
            variant={choice.variant ?? 'outlined'}
            ariaLabel={choice.label}
            ariaDescription={choice.label}
          />
        ))}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationBox;
