import EventSource from 'sse-events';

const { ON_ERROR, ON_OPEN, ON_CLOSE } = EventSource.types;

export const DOCUMENT_SIGNED = 'DOCUMENT_SIGNED';
export const NOTIFICATION_TOPIC = 'NOTIFICATION';
export const ACKNOWLEDGE_TOPIC = 'ACKNOWLEDGE';
export const SUBSCRIBE_API = '/notification/notifications/subscribe';
export const SUBSCRIBE_RESPONSE = 'SUBSCRIBED';
export const RECONNECT_INTERVAL = 5000;

const setupServerEvents = (API_URL, authClient) => {
  const source = new EventSource({
    url: API_URL,
    path: SUBSCRIBE_API,
    options: {
      headers: {
        Authorization: `Bearer ${authClient?.token}`,
      },
    },
    reconnectInterval: RECONNECT_INTERVAL,
    retryOnNetworkError: true,
  });

  if (source) {
    source.addEventListener(DOCUMENT_SIGNED, () => {
      const successEvent = new CustomEvent('success');
      window.dispatchEvent(successEvent);
    });

    source.addEventListener(NOTIFICATION_TOPIC, (event) => {
      console.log('event', event);
      const data = event.data;
      const { entityId, entityCL } = data;
      const expectedPathname = `${window['CONTEXT_PATH']}/page/${entityCL}/${entityId}`;
      if (window.location.pathname == expectedPathname) {
        window.location.reload();
      }
    });

    source.addEventListener(ACKNOWLEDGE_TOPIC, (event) => {
      if (event.data !== SUBSCRIBE_RESPONSE) {
        source.reconnectInterval = event.data.timeLeft;
      }
    });

    source.addEventListener(ON_OPEN, () => {
      source.retrying = false;
    });
    source.addEventListener(ON_CLOSE, () => {
      source.retrying = false;
    });

    source.addEventListener(ON_ERROR, (error) => {
      if (
        error &&
        !source.retrying &&
        error.data &&
        error.data.code &&
        ((error.data.code >= 200 && error.data.code <= 202) || error.data.code === 204)
      ) {
        delete source.options.headers.Authorization;
        source.retrying = true;
        authClient?.logout?.();
        return;
      }

      source.retrying = false;
    });
  }

  return source;
};

export default setupServerEvents;
