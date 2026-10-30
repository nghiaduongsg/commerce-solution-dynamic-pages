import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { Conversation, InboxData, Message } from '../schemas/model';
import { Filters, readConversations, readMessages } from './dataSource';

type Thread = {
  next: string | null;
  loading: boolean;
  error: boolean;
  loaded: boolean;
  newer: boolean;
  count: number;
  olderWindow?: boolean;
};
const emptyThread: Thread = {
  next: null,
  loading: false,
  error: false,
  loaded: false,
  newer: false,
  count: 0,
};
const unique = <T extends { id: string }>(values: T[]): T[] =>
  Array.from(new Map(values.map((value) => [value.id, value])).values());
const MAX_MESSAGES = 200;
const MAX_THREADS = 10;

export function useInboxData(data: InboxData, filters: Filters) {
  const edits = useRef<
    Record<
      string,
      { resolved: boolean; unread: boolean; preview?: Message; localMessages: Message[] }
    >
  >({});
  const [conversations, setRows] = useState<Conversation[]>(() =>
    (data.conversations || []).map((c) => ({ ...c, messages: [...c.messages] })),
  );
  const [selected, setSelected] = useState(data.conversations?.[0]?.id || '');
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const [listCursor, setListCursor] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(!!data.source);
  const [listError, setListError] = useState(false);
  const [threads, setThreads] = useState<Record<string, Thread>>({});
  const [listRetry, setListRetry] = useState(0);
  const [messageRetry, setMessageRetry] = useState(0);
  const generation = useRef(0);
  const listBusy = useRef(false);
  const listController = useRef<AbortController | null>(null);
  const messageController = useRef<AbortController | null>(null);
  const messageVersion = useRef(0);
  const messageBusy = useRef(false);
  const recency = useRef<string[]>([]);
  const threadRef = useRef(threads);
  threadRef.current = threads;
  const updateConversations: Dispatch<SetStateAction<Conversation[]>> = (update) => {
    setRows((old) => {
      const next = typeof update === 'function' ? update(old) : update;
      if (data.source?.mode === 'demo')
        for (const c of next) {
          if (old.find((item) => item.id === c.id) !== c)
            edits.current[c.id] = {
              resolved: c.resolved,
              unread: c.unread,
              preview: c.preview,
              localMessages: c.messages
                .filter((message) => message.id.startsWith('local-'))
                .slice(-200),
            };
        }
      return next;
    });
  };
  useEffect(() => {
    edits.current = {};
  }, [data.source?.url, data.source?.mode]);

  const fetchList = useCallback(
    async (after: string | null, replace: boolean, version: number, refresh = false) => {
      if (!data.source || listBusy.current) return;
      listBusy.current = true;
      const controller = new AbortController();
      listController.current = controller;
      setLoadingList(true);
      setListError(false);
      try {
        const page = await readConversations(
          data.source,
          after,
          filters,
          controller.signal,
          (c) => {
            const saved = edits.current[c.id];
            return saved
              ? {
                  ...c,
                  resolved: saved.resolved,
                  unread: saved.unread,
                  preview: saved.preview || c.preview,
                }
              : c;
          },
        );
        if (version !== generation.current || controller.signal.aborted) return;
        setRows((old) => {
          if (replace) return page.items;
          if (refresh)
            return unique([
              ...page.items.map((c) => {
                const cached = old.find((item) => item.id === c.id);
                return cached
                  ? {
                      ...c,
                      messages: cached.messages,
                      summary: cached.summary,
                      draft: cached.draft,
                    }
                  : c;
              }),
              ...old.filter((c) => !page.items.some((item) => item.id === c.id)),
            ]).slice(0, 500);
          const items = unique([
            ...old,
            ...page.items.map((c) => {
              const cached = old.find((item) => item.id === c.id);
              return cached
                ? { ...c, messages: cached.messages, summary: cached.summary, draft: cached.draft }
                : c;
            }),
          ]);
          const tail = items.slice(-500);
          const active = items.find((c) => c.id === selectedRef.current);
          return active && !tail.some((c) => c.id === active.id)
            ? [active, ...tail.slice(1)]
            : tail;
        });
        if (!refresh) setListCursor(page.nextCursor);
        if (replace) setSelected(page.items[0]?.id || '');
        if (refresh && !selectedRef.current && page.items.length) setSelected(page.items[0].id);
      } catch {
        if (version === generation.current && !controller.signal.aborted) setListError(true);
      } finally {
        if (version === generation.current) {
          listBusy.current = false;
          setLoadingList(false);
        }
      }
    },
    [data.source, filters.query, filters.channel, filters.status],
  );

  useEffect(() => {
    if (!data.source) return;
    const version = ++generation.current;
    listController.current?.abort();
    messageController.current?.abort();
    ++messageVersion.current;
    listBusy.current = false;
    messageBusy.current = false;
    setRows([]);
    setSelected('');
    setThreads({});
    setListCursor(null);
    setListError(false);
    setLoadingList(true);
    const timer = window.setTimeout(
      () => {
        void fetchList(null, true, version);
      },
      filters.query ? 250 : 0,
    );
    return () => {
      window.clearTimeout(timer);
      listController.current?.abort();
    };
  }, [fetchList, listRetry]);

  const fetchThread = useCallback(
    async (id: string, older: boolean) => {
      if (!data.source || !id || messageBusy.current) return;
      messageBusy.current = true;
      const version = ++messageVersion.current;
      messageController.current?.abort();
      const controller = new AbortController();
      messageController.current = controller;
      const previous = threadRef.current[id] || emptyThread;
      const after = older ? previous.next : null;
      if (older && !after) {
        messageBusy.current = false;
        return;
      }
      setThreads((old) => ({ ...old, [id]: { ...previous, loading: true, error: false } }));
      try {
        const page = await readMessages(data.source, id, after, controller.signal);
        if (controller.signal.aborted || version !== messageVersion.current) return;
        recency.current = [...recency.current.filter((key) => key !== id), id];
        const evicted = recency.current.length > MAX_THREADS ? recency.current.shift() : undefined;
        setRows((old) =>
          old.map((c) => {
            if (c.id === evicted) return { ...c, messages: [], summary: '', draft: '' };
            if (c.id !== id) return c;
            const merged = older
              ? unique([...page.items, ...c.messages])
              : unique([...page.items, ...(edits.current[id]?.localMessages || [])]);
            return {
              ...c,
              ...page.context,
              messages: older ? merged.slice(0, MAX_MESSAGES) : merged.slice(-MAX_MESSAGES),
            };
          }),
        );
        const newer =
          older && (previous.newer || previous.count + page.items.length > MAX_MESSAGES);
        setThreads((old) => {
          const next = {
            ...old,
            [id]: {
              next: page.nextCursor,
              loading: false,
              error: false,
              loaded: true,
              newer: !!newer,
              olderWindow: older,
              count: older
                ? Math.min(MAX_MESSAGES, previous.count + page.items.length)
                : Math.min(
                    MAX_MESSAGES,
                    page.items.length + (edits.current[id]?.localMessages.length || 0),
                  ),
            },
          };
          if (evicted) delete next[evicted];
          return next;
        });
      } catch {
        if (!controller.signal.aborted && version === messageVersion.current)
          setThreads((old) => ({ ...old, [id]: { ...previous, error: true, loading: false } }));
      } finally {
        if (version === messageVersion.current) messageBusy.current = false;
      }
    },
    [data.source],
  );

  useEffect(() => {
    messageController.current?.abort();
    ++messageVersion.current;
    messageBusy.current = false;
    if (data.source && selected && !threadRef.current[selected]?.loaded)
      void fetchThread(selected, false);
    return () => {
      messageController.current?.abort();
      ++messageVersion.current;
      messageBusy.current = false;
    };
  }, [selected, fetchThread, messageRetry]);

  const selectConversation = (id: string) => {
    setSelected(id);
    if (threadRef.current[id]?.loaded)
      recency.current = [...recency.current.filter((key) => key !== id), id];
    if (data.source?.mode !== 'api')
      updateConversations((old) => old.map((c) => (c.id === id ? { ...c, unread: false } : c)));
  };
  const refresh = useCallback(() => {
    void fetchList(null, false, generation.current, true);
    const id = selectedRef.current;
    if (id && !threadRef.current[id]?.olderWindow) void fetchThread(id, false);
  }, [fetchList, fetchThread]);
  useEffect(() => {
    if (data.source?.mode !== 'api') return;
    const timer = window.setInterval(() => {
      if (!document.hidden) refresh();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [data.source?.mode, refresh]);
  const thread = threads[selected] || emptyThread;
  return {
    conversations,
    refresh,
    setConversations: updateConversations,
    selected,
    selectConversation,
    loadingList,
    listError,
    listCursor,
    loadMore: () => {
      if (listCursor) void fetchList(listCursor, false, generation.current);
    },
    retryList: () => setListRetry((value) => value + 1),
    loadingMessages:
      !!data.source && !!selected && ((!thread.loaded && !thread.error) || thread.loading),
    messageError: thread.error,
    messageCursor: thread.next,
    hasNewer: thread.newer,
    loadEarlier: () => {
      void fetchThread(selected, true);
    },
    loadLatest: () => {
      void fetchThread(selected, false);
    },
    retryMessages: () => {
      setThreads((old) => ({ ...old, [selected]: { ...emptyThread } }));
      setMessageRetry((value) => value + 1);
    },
  };
}
