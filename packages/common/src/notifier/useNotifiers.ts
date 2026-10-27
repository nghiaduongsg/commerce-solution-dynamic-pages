import { Notification } from './types';
import { useDispatch, useSelector } from 'react-redux';

import { selectNotifications } from './selectors';
import { RemoveSnackbar, EnqueueSnackbar } from './reducers';
import { useCallback } from 'react';
import { equalityCheck } from '@pkg-common/utils/utils';

const useNotifiers = () => {
  const dispatch = useDispatch();

  return {
    notifications: useSelector(selectNotifications, equalityCheck),
    clearNotification: useCallback((key: string) => dispatch(RemoveSnackbar({ key })), [dispatch]),
    enqueueSnackbar: useCallback(
      ({ key, message, severity, namespace }: Notification) =>
        dispatch(EnqueueSnackbar({ key, message, severity, namespace })),
      [dispatch],
    ),
  };
};

export default useNotifiers;
