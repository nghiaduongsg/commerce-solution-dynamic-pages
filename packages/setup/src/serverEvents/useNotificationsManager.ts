import { useCallback, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import useAuth from '@pkg-setup/src/auth/useAuth';
import authClient from '@pkg-setup/src/auth/authClient';
import setupServerEvents from '@pkg-setup/src/serverEvents/serverEventsSetup';
import { useSystem } from '@pkg-setup/index';
import useServerEvents from '@pkg-setup/src/serverEvents/useServerEvents';
import { Timeout } from 'react-number-format/types/types';

export const NOTIF_INTERVAL = window['NOTIF_INTERVAL'] || 10000;
export const PAGES_WITH_NOTIFICATIONS = ['FormDefinition', 'HumanTask', 'BillSegment'];

const getQueryParameter = (application: string) => {
  if (application === 'IRM') return 'UNR_NOTIF';
  else if (application === 'ISS') return 'ISS_UNOTIF';
  else throw new Error(`Unknown application: ${application}`);
};

const useNotificationsManager = (pageId: any, isList?: boolean, forceSSE?: boolean) => {
  const { token } = useAuth();
  const { apiUrl, application } = useSystem();
  const { updateCounterNotifications, count } = useServerEvents();
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRequestInFlight = useRef(false);

  const currentNotificationsNumber = useMemo(() => {
    return count || 0;
  }, [count]);

  const onCountChanged = useCallback(
    (unread) => {
      if (unread !== currentNotificationsNumber) {
        updateCounterNotifications(unread);
      }
    },
    [updateCounterNotifications, currentNotificationsNumber],
  );

  const refreshNotificationsNumber = useCallback(async () => {
    if (isRequestInFlight.current) return;
    isRequestInFlight.current = true;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      const queryParam = getQueryParameter(application);
      const response = await axios.post(
        `${apiUrl}/query-management/queries/${queryParam}/execute?enablePagination=false&isControlActive=FALSE&page=0&size=100`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortControllerRef.current.signal,
        },
      );
      onCountChanged(response.data.content?.[0]?.count ?? 0);
    } catch (error) {
      if (!axios.isCancel(error)) console.error(error);
    } finally {
      isRequestInFlight.current = false;
    }
  }, [apiUrl, token, application, onCountChanged]);

  const useSSE = useMemo(() => {
    if (forceSSE) return true;
    return !isList && PAGES_WITH_NOTIFICATIONS.indexOf(pageId) >= 0;
  }, [pageId, isList, forceSSE]);

  const sse = useRef(setupServerEvents(apiUrl, authClient));
  const poll = useRef<Timeout | null>(null);
  const prevUseSSE = useRef<boolean | null>(null);

  useEffect(() => {
    if (prevUseSSE.current === useSSE) return;
    prevUseSSE.current = useSSE;

    if (poll.current) {
      clearInterval(poll.current);
      poll.current = null;
    }

    if (useSSE) {
      sse.current?.open();
    } else {
      sse.current?.close();
      if (token) {
        void refreshNotificationsNumber();
        poll.current = setInterval(() => {
          void refreshNotificationsNumber();
        }, NOTIF_INTERVAL);
      }
    }

    return () => {
      if (poll.current) {
        clearInterval(poll.current);
        poll.current = null;
      }
      if (abortControllerRef.current) abortControllerRef.current.abort();
      isRequestInFlight.current = false;
    };
  }, [useSSE, refreshNotificationsNumber, token]);
};

export default useNotificationsManager;
