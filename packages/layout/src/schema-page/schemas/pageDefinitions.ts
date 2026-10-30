import { Conversation, InboxData, Message } from './model';

export type DashboardCard = { id: string; title: string; description: string; path: string };
export type DashboardData = { cards: DashboardCard[] };

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const strings = (value: Record<string, unknown>, keys: string[]) =>
  keys.every((key) => typeof value[key] === 'string');

export function isMessage(value: unknown): value is Message {
  return (
    record(value) &&
    strings(value, ['id', 'text', 'time']) &&
    (value.direction === 'in' || value.direction === 'out')
  );
}

export function isConversation(value: unknown): value is Conversation {
  return (
    record(value) &&
    strings(value, [
      'id',
      'name',
      'initials',
      'color',
      'handle',
      'topic',
      'intent',
      'summary',
      'draft',
    ]) &&
    (value.channel === 'Instagram' || value.channel === 'Messenger') &&
    typeof value.unread === 'boolean' &&
    typeof value.resolved === 'boolean' &&
    Array.isArray(value.messages) &&
    value.messages.every(isMessage) &&
    (value.preview === undefined || isMessage(value.preview))
  );
}

export function isInboxData(value: unknown): value is InboxData {
  if (!record(value) || typeof value.workspace !== 'string') return false;
  if (record(value.source)) {
    const source = value.source;
    return (
      (source.mode === 'demo' || source.mode === 'api') &&
      typeof source.url === 'string' &&
      /^\/(?!\/)/.test(source.url) &&
      !source.url.includes('..') &&
      Number.isInteger(source.pageSize) &&
      Number(source.pageSize) > 0 &&
      Number(source.pageSize) <= 50 &&
      Number.isInteger(source.messagePageSize) &&
      Number(source.messagePageSize) > 0 &&
      Number(source.messagePageSize) <= 100
    );
  }
  if (!Array.isArray(value.conversations)) return false;
  if (!value.conversations.every(isConversation)) return false;
  return new Set(value.conversations.map((c) => c.id)).size === value.conversations.length;
}

export function isDashboardData(value: unknown): value is DashboardData {
  return (
    record(value) &&
    Array.isArray(value.cards) &&
    value.cards.every(
      (card) =>
        record(card) &&
        strings(card, ['id', 'title', 'description', 'path']) &&
        typeof card.path === 'string' &&
        card.path.startsWith('/') &&
        !card.path.startsWith('//'),
    )
  );
}
