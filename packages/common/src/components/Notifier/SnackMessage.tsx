import React, { forwardRef, useEffect } from 'react';
import { useSnackbar, SnackbarContent } from 'notistack';
import Snackbars from './Snackbars';
import useNotification from '@pkg-common/notifier/useNotification';
import usePrevious from '@pkg-common/hooks/usePrevious';
import { Box } from '@mui/material';

const SNACKBAR_TIMEOUT = 5000;

const SnackMessage = forwardRef<HTMLDivElement, { id: string; message: string }>(
  ({ id, message }: { id: string; message: string }, ref) => {
    const prevMessageId = usePrevious(id);

    const { closeSnackbar } = useSnackbar();
    const notification = useNotification(id);
    const { severity } = notification || {};

    useEffect(() => {
      if (id === prevMessageId) {
        const timeout = setTimeout(() => {
          closeSnackbar(id);
          if (timeout) {
            clearTimeout(timeout);
          }
        }, SNACKBAR_TIMEOUT);
      }
    }, [closeSnackbar, id, prevMessageId]);

    return (
      <>
        <SnackbarContent ref={ref}>
          <Snackbars id={id} message={message} color={severity} />
        </SnackbarContent>
        <Box
          role="alert"
          aria-live="assertive"
          style={{ position: 'absolute', height: 0, overflow: 'hidden' }}
        >
          {message}
        </Box>
      </>
    );
  },
);

export default SnackMessage;
