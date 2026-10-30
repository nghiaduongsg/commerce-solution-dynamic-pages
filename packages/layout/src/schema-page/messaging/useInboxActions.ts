import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Conversation, InboxSource } from '../schemas/model';
import { apiMessage } from './dataSource';

const errorKey = (error: any) => {
  const code = error?.response?.data?.error?.code;
  const known = [
    'meta_token_expired',
    'meta_reply_restricted',
    'meta_rate_limited',
    'inbox_not_connected',
    'send_status_unknown',
    'conversation_resolved',
    'ai_not_configured',
    'ai_unavailable',
    'forbidden',
  ];
  return known.includes(code) ? `errors.${code}` : 'errors.action_failed';
};
export function useInboxActions(source?: InboxSource) {
  const live = source?.mode === 'api';
  const [connection, setConnection] = useState<{ page_name: string; page_id: string }>();
  const [canReply, setCanReply] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const requests = useRef(new Map<string, { text: string; id: string }>());
  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    setCanReply(false);
    setConnection(undefined);
    if (live)
      axios
        .get(`${source!.url}/connection`, { signal: controller.signal })
        .then(({ data }) => {
          setConnection(data.connection);
          setCanReply(!!data.can_reply);
          setCanManage(!!data.can_manage);
          setAiAvailable(!!data.ai_available);
        })
        .catch((e) => {
          if (!controller.signal.aborted) setError(errorKey(e));
        });
    return () => {
      mounted.current = false;
      controller.abort();
    };
  }, [source?.url, live]);
  const run = async <T>(operation: string, action: () => Promise<T>): Promise<T | undefined> => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(operation);
    setError('');
    try {
      return await action();
    } catch (e) {
      if (mounted.current) setError(errorKey(e));
      return undefined;
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy('');
    }
  };
  return {
    live,
    connection,
    canReply: !live || canReply,
    aiAvailable,
    canManage,
    busy,
    error,
    clearError: () => setError(''),
    connect: async (pageId: string, token: string) =>
      !!(await run('connect', async () => {
        await axios.post(`${source!.url}/connection`, {
          page_id: pageId,
          page_access_token: token,
        });
        const { data } = await axios.get(`${source!.url}/connection`);
        setConnection(data.connection);
        setCanReply(!!data.can_reply);
        setCanManage(!!data.can_manage);
        setAiAvailable(!!data.ai_available);
        return true;
      })),
    send: (id: string, text: string) =>
      run('send', async () => {
        let request = requests.current.get(id);
        if (!request || request.text !== text) {
          request = { text, id: crypto.randomUUID() };
          requests.current.set(id, request);
        }
        try {
          const { data } = await axios.post(`${source!.url}/${encodeURIComponent(id)}/messages`, {
            content: text,
            request_id: request.id,
          });
          requests.current.delete(id);
          return apiMessage(data);
        } catch (e: any) {
          // Keep the key on network/ambiguous failures so retry cannot duplicate delivery.
          if (e.response && e.response.data?.error?.code !== 'send_status_unknown')
            requests.current.delete(id);
          throw e;
        }
      }),
    status: (conversation: Conversation) =>
      run('status', async () => {
        await axios.patch(`${source!.url}/${encodeURIComponent(conversation.id)}`, {
          status: conversation.resolved ? 'open' : 'resolved',
          read: true,
        });
        return true;
      }),
    markRead: (id: string) =>
      axios
        .patch(`${source!.url}/${encodeURIComponent(id)}`, { read: true })
        .catch(() => undefined),
    suggest: (id: string, prompt = '', action?: 'order_confirmation') =>
      run('suggest', async () => {
        const { data } = await axios.post(`${source!.url}/${encodeURIComponent(id)}/suggestion`, {
          prompt: prompt.trim(),
          ...(action ? { action } : {}),
        });
        if (typeof data.draft !== 'string' || !data.draft.trim())
          throw new Error('invalid_suggestion');
        return data.draft as string;
      }),
  };
}
