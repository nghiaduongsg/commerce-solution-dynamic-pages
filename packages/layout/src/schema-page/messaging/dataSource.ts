import axios from 'axios';
import { Conversation, InboxSource, Message } from '../schemas/model';
import { isConversation, isMessage } from '../schemas/pageDefinitions';

export type Filters = { query: string; channel: string; status: string };
export type Page<T> = { items: T[]; nextCursor: string | null };
export type ThreadPage = Page<Message> & {
  context?: { summary: string; draft: string; intent: string };
};
const cursor = (value: unknown): string | null =>
  typeof value === 'string' && value ? value : null;
const demoCursor = (value: string | null) => {
  if (value !== null && !/^\d{1,6}$/.test(value)) throw new Error('invalid_page');
  return value || '0';
};

function matches(c: Conversation, filters: Filters) {
  return (
    (filters.channel === 'all' || c.channel === filters.channel) &&
    (filters.status === 'resolved'
      ? c.resolved
      : !c.resolved && (filters.status !== 'unread' || c.unread)) &&
    `${c.name} ${c.handle} ${c.preview?.text || ''}`
      .toLowerCase()
      .includes(filters.query.trim().toLowerCase())
  );
}

export function apiMessage(value: any): Message {
  if (
    !value ||
    typeof value.id !== 'string' ||
    typeof value.content !== 'string' ||
    typeof value.created_at !== 'string' ||
    !['inbound', 'outbound'].includes(value.direction)
  )
    throw new Error('invalid_page');
  return {
    id: value.id,
    text: value.content,
    time: value.created_at,
    direction: value.direction === 'inbound' ? 'in' : 'out',
    attachments: Array.isArray(value.attachments)
      ? value.attachments.filter(
          (a: any) =>
            typeof a.url === 'string' && a.url.startsWith('https://') && typeof a.kind === 'string',
        )
      : [],
  };
}

export async function readConversations(
  source: InboxSource,
  after: string | null,
  filters: Filters,
  signal: AbortSignal,
  decorate: (conversation: Conversation) => Conversation = (conversation) => conversation,
): Promise<Page<Conversation>> {
  if (source.mode === 'api') {
    const { data } = await axios.get(source.url, {
      signal,
      params: {
        limit: source.pageSize,
        cursor: after || undefined,
        q: filters.query || undefined,
        channel: filters.channel === 'all' ? undefined : filters.channel.toLowerCase(),
        status: filters.status,
      },
    });
    if (!Array.isArray(data.conversations) || data.conversations.length > source.pageSize)
      throw new Error('invalid_page');
    return {
      items: data.conversations.map((c: any): Conversation => {
        if (
          typeof c.id !== 'string' ||
          typeof c.customer_external_id !== 'string' ||
          !['messenger', 'instagram'].includes(c.channel)
        )
          throw new Error('invalid_page');
        const avatar =
          typeof c.customer_avatar === 'string' && c.customer_avatar.startsWith('https://')
            ? c.customer_avatar
            : undefined;
        return {
          id: c.id,
          name: c.customer_name || c.customer_external_id,
          handle: c.customer_external_id,
          ...(avatar ? { avatar } : {}),
          initials: (c.customer_name || c.customer_external_id)
            .split(/\s+/)
            .filter(Boolean)
            .slice(-2)
            .map((part: string) => Array.from(part)[0])
            .join('')
            .toUpperCase(),
          color: '#dce7df',
          channel: c.channel === 'instagram' ? 'Instagram' : 'Messenger',
          topic: 'workspace:topics.message',
          unread: !!c.unread,
          resolved: c.status === 'resolved',
          intent: '',
          summary: '',
          draft: '',
          messages: [],
          preview: c.preview ? apiMessage(c.preview) : undefined,
        };
      }),
      nextCursor: cursor(data.next_cursor),
    };
  }
  // Demo pages are static summaries. Scan past nonmatching pages without loading histories.
  let next = after;
  const seen = new Set<string>();
  for (let attempt = 0; attempt < 100; attempt++) {
    const id = demoCursor(next);
    if (seen.has(id)) throw new Error('invalid_page');
    seen.add(id);
    const { data } = await axios.get(`${source.url}/conversations/${id}.json`, { signal });
    if (
      !Array.isArray(data.items) ||
      data.items.length > source.pageSize ||
      !data.items.every(isConversation)
    )
      throw new Error('invalid_page');
    next = cursor(data.nextCursor);
    const items = data.items.map(decorate).filter((item: Conversation) => matches(item, filters));
    if (items.length || !next) return { items, nextCursor: next };
  }
  throw new Error('invalid_page');
}

export async function readMessages(
  source: InboxSource,
  id: string,
  after: string | null,
  signal: AbortSignal,
): Promise<ThreadPage> {
  const url =
    source.mode === 'api'
      ? `${source.url}/${encodeURIComponent(id)}/messages`
      : `${source.url}/messages/${encodeURIComponent(id)}/${demoCursor(after)}.json`;
  const { data } = await axios.get(url, {
    signal,
    ...(source.mode === 'api'
      ? { params: { limit: source.messagePageSize, cursor: after || undefined } }
      : {}),
  });
  const items =
    source.mode === 'api'
      ? Array.isArray(data.messages)
        ? data.messages.map(apiMessage)
        : null
      : data.items;
  if (!Array.isArray(items) || items.length > source.messagePageSize || !items.every(isMessage))
    throw new Error('invalid_page');
  const context = data.context;
  if (context && !['summary', 'draft', 'intent'].every((key) => typeof context[key] === 'string'))
    throw new Error('invalid_page');
  return {
    items: [...items].reverse(),
    nextCursor: cursor(source.mode === 'api' ? data.next_cursor : data.nextCursor),
    ...(context ? { context } : {}),
  };
}
