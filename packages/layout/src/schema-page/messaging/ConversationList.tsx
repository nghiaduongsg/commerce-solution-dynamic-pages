import React from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Conversation } from '../schemas/model';
import { Avatar, ChannelIcon } from './primitives';
import { formatPreviewTime } from '../translations';
export default function ConversationList({
  conversations,
  selected,
  onSelect,
  query,
  setQuery,
  channel,
  setChannel,
  filter,
  setFilter,
  loading = false,
  error = false,
  hasMore = false,
  onLoadMore,
  onRetry,
  showUnread = true,
}: {
  conversations: Conversation[];
  selected: string;
  onSelect: (id: string) => void;
  query: string;
  setQuery: (value: string) => void;
  channel: string;
  setChannel: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  loading?: boolean;
  error?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRetry?: () => void;
  showUnread?: boolean;
}) {
  const { t, i18n } = useTranslation('workspace');
  const messageTime = (value: string) =>
    value.startsWith('workspace:')
      ? t(value)
      : formatPreviewTime(value, i18n.resolvedLanguage || i18n.language);
  const filtered = conversations.filter(
    (c) =>
      (channel === 'all' || c.channel === channel) &&
      (filter === 'resolved' ? c.resolved : !c.resolved && (filter !== 'unread' || c.unread)) &&
      `${c.name} ${c.handle} ${c.preview?.text || ''} ${c.messages.map((m) => m.text).join(' ')}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <aside className="inbox-list" aria-label={t('conversations')}>
      <div className="inbox-list-heading">
        <h2>
          {' '}
          {t('conversations')} <span>{filtered.length}</span>
        </h2>
        <label className="inbox-channel-select">
          <span className="sr-only"> {t('filterChannel')} </span>
          <select value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="all">{t('allChannels')}</option>
            <option value="Instagram">{t('channels.Instagram')}</option>
            <option value="Messenger">{t('channels.Messenger')}</option>
          </select>
          <ChevronDown size={14} />
        </label>
      </div>
      <label className="inbox-search">
        <Search size={17} />
        <input
          placeholder={t('searchConversations')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t('searchConversations')}
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label={t('clearSearch')}>
            <X size={14} />
          </button>
        )}
      </label>
      <div className="inbox-tabs" aria-label={t('conversationStatus')}>
        {(showUnread ? ['open', 'unread', 'resolved'] : ['open', 'resolved']).map((tab) => (
          <button
            key={t(`statuses.${tab}`)}
            aria-pressed={filter === tab}
            className={filter === tab ? 'active' : ''}
            onClick={() => setFilter(tab)}
          >
            {t(`statuses.${tab}`)}
            {tab === 'unread' && (
              <span>{conversations.filter((c) => c.unread && !c.resolved).length}</span>
            )}
          </button>
        ))}
      </div>
      <div
        className="inbox-conversation-scroll"
        aria-busy={loading}
        onScroll={(event) => {
          const el = event.currentTarget;
          if (
            hasMore &&
            !loading &&
            !error &&
            el.scrollHeight - el.scrollTop - el.clientHeight < 80
          )
            onLoadMore?.();
        }}
      >
        {filtered.map((c) => (
          <button
            key={c.id}
            className={`inbox-conversation ${selected === c.id ? 'selected' : ''}`}
            aria-pressed={selected === c.id}
            onClick={() => onSelect(c.id)}
          >
            <div className="inbox-avatar-wrap">
              <Avatar conversation={c} />
              <span className={`inbox-channel-badge ${c.channel.toLowerCase()}`}>
                <ChannelIcon channel={c.channel} size={11} />
              </span>
            </div>
            <div className="inbox-conversation-copy">
              <div className="inbox-conversation-title">
                <strong>{c.name}</strong>
                <time>
                  {messageTime((c.preview || c.messages[c.messages.length - 1])?.time || '')}
                </time>
              </div>
              <p>{(c.preview || c.messages[c.messages.length - 1])?.text || ''}</p>
              <div className="inbox-conversation-bottom">
                <span>{t(c.topic)}</span>
                {c.unread && <i aria-label={t('statuses.unread')} />}
              </div>
            </div>
          </button>
        ))}
        {!filtered.length && !loading && !error && (
          <div className="inbox-empty">
            <Search size={25} />
            <h3> {t('noConversations')} </h3>
            <p> {t('tryFilter')} </p>
          </div>
        )}
        {loading && (
          <p role="status" className="inbox-load-state">
            {t('loadingConversations')}
          </p>
        )}
        {error && (
          <div role="alert" className="inbox-load-state">
            {t('loadConversationsFailed')} <button onClick={onRetry}>{t('retry')}</button>
          </div>
        )}
        {hasMore && !error && (
          <button className="inbox-load-more" onClick={onLoadMore} disabled={loading}>
            {t('loadMoreConversations')}
          </button>
        )}
      </div>
      <div className="inbox-list-footer">
        <span className="inbox-status-dot" /> {t('conversations')}{' '}
        <span>{t('loadedCount', { count: conversations.length })}</span>
      </div>
    </aside>
  );
}
