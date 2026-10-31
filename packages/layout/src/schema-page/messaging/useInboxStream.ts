import { useEffect, useRef } from 'react';
import axios from 'axios';

type Options = {
  // Only connect when the inbox is live and a Page connection exists.
  enabled: boolean;
  // The inbox source url, e.g. "/api/v1/inbox". The ticket and stream endpoints
  // are derived from it ("/ticket" and "/stream").
  baseUrl: string;
  // Called (debounced) whenever the server signals that the inbox changed, and
  // once after every successful reconnect to catch up on anything missed.
  onRefresh: () => void;
};

const MAX_BACKOFF_MS = 30_000;
const REFRESH_DEBOUNCE_MS = 250;

/**
 * useInboxStream keeps a WebSocket open to the inbox live endpoint and calls
 * onRefresh whenever the backend reports a change. The browser cannot send an
 * Authorization header on an upgrade, so it first fetches a short-lived,
 * single-connection ticket from the authenticated REST API and presents that in
 * the stream URL. Disconnections reconnect with exponential backoff and jitter;
 * each reconnect re-fetches a fresh ticket and refreshes once to resync.
 */
export function useInboxStream({ enabled, baseUrl, onRefresh }: Options): void {
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (!enabled || typeof WebSocket === 'undefined') return;

    let disposed = false;
    let socket: WebSocket | null = null;
    let attempt = 0;
    let hadConnection = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    const scheduleRefresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        if (!disposed) onRefreshRef.current();
      }, REFRESH_DEBOUNCE_MS);
    };

    const scheduleReconnect = () => {
      if (disposed) return;
      // Exponential backoff capped at 30s, with 50-100% jitter to avoid a
      // thundering herd of reconnects after a backend restart.
      const ceiling = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** Math.min(attempt, 5));
      attempt += 1;
      const delay = ceiling / 2 + Math.random() * (ceiling / 2);
      reconnectTimer = setTimeout(connect, delay);
    };

    const connect = async () => {
      if (disposed) return;
      let ticket: string | undefined;
      try {
        const res = await axios.get(`${baseUrl}/ticket`);
        ticket = res?.data?.ticket;
      } catch {
        ticket = undefined;
      }
      if (disposed) return;
      if (!ticket) {
        scheduleReconnect();
        return;
      }
      const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const url = `${scheme}://${window.location.host}${baseUrl}/stream?ticket=${encodeURIComponent(ticket)}`;
      try {
        socket = new WebSocket(url);
      } catch {
        scheduleReconnect();
        return;
      }
      socket.onopen = () => {
        attempt = 0;
        if (hadConnection) scheduleRefresh(); // reconnected: resync
        hadConnection = true;
      };
      socket.onmessage = (event) => {
        let type = '';
        try {
          type = JSON.parse(event.data)?.type;
        } catch {
          type = '';
        }
        if (type === 'refresh') scheduleRefresh();
      };
      socket.onclose = () => {
        socket = null;
        scheduleReconnect();
      };
      socket.onerror = () => {
        try {
          socket?.close();
        } catch {
          /* onclose will drive the reconnect */
        }
      };
    };

    void connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      clearTimeout(refreshTimer);
      if (socket) {
        socket.onclose = null;
        socket.onerror = null;
        try {
          socket.close();
        } catch {
          /* ignore */
        }
      }
    };
  }, [enabled, baseUrl]);
}
