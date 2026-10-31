import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Send, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InboxData } from './schemas/model';
import { useInboxData } from './messaging/useInboxData';
import { useInboxActions } from './messaging/useInboxActions';
import { useInboxStream } from './messaging/useInboxStream';
import ConversationList from './messaging/ConversationList';
import { Avatar, ChannelIcon } from './messaging/primitives';
import './inbox.css';
const AssistantPanel = lazy(
  () => import(/* webpackChunkName: "messaging-assistant" */ './messaging/AssistantPanel'),
);
const MessageHistory = lazy(
  () => import(/* webpackChunkName: "messaging-history" */ './messaging/MessageHistory'),
);
const ConnectionSettings = lazy(
  () => import(/* webpackChunkName: "messaging-connection" */ './messaging/ConnectionSettings'),
);
export default function Inbox({
  title,
  description,
  data,
}: {
  title: string;
  description?: string;
  data: InboxData;
}) {
  const { t } = useTranslation('workspace');

  const [query, setQuery] = useState('');
  const [channel, setChannel] = useState('all');
  const [filter, setFilter] = useState('open');
  const inbox = useInboxData(data, { query, channel, status: filter });
  const { conversations, setConversations, selected, selectConversation } = inbox;
  const actions = useInboxActions(data.source);
  const readOnly = !actions.canReply;
  const live = actions.live;
  const workspace = actions.connection?.page_name || data.workspace;
  // Real-time updates: refresh immediately when the backend streams a change,
  // instead of waiting for the periodic poll. Only runs for a live, connected
  // inbox; it reconnects with backoff and falls back to the poll if unavailable.
  useInboxStream({
    enabled: live && !!actions.connection && !!data.source?.url,
    baseUrl: data.source?.url || '',
    onRefresh: inbox.refresh,
  });
  const [desktop, setDesktop] = useState(
    () => window.matchMedia?.('(min-width: 1200px)').matches || false,
  );
  useEffect(() => {
    const media = window.matchMedia?.('(min-width: 1200px)');
    const update = () => setDesktop(!!media?.matches);
    media?.addEventListener?.('change', update);
    return () => media?.removeEventListener?.('change', update);
  }, []);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [threadOpen, setThreadOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const composer = useRef<HTMLTextAreaElement>(null);
  const conversation = conversations.find((c) => c.id === selected)!;
  const draft = drafts[selected] || '';
  useEffect(() => {
    if (
      live &&
      actions.canReply &&
      conversation?.unread &&
      !inbox.loadingMessages &&
      !inbox.messageError
    ) {
      const id = selected;
      void actions.markRead(id).then((result) => {
        if (result)
          setConversations((items) =>
            items.map((c) => (c.id === id ? { ...c, unread: false } : c)),
          );
      });
    }
  }, [
    selected,
    conversation?.unread,
    inbox.loadingMessages,
    inbox.messageError,
    live,
    actions.canReply,
  ]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const useDraft = () => {
    if (!conversation || !conversation.draft || readOnly) return;
    setDrafts((values) => ({ ...values, [selected]: conversation.draft }));
    setAssistantOpen(false);
    composer.current?.focus();
    setNotice(live ? 'liveDraftAdded' : 'draftAdded');
  };
  const send = async () => {
    if (
      !conversation ||
      !draft.trim() ||
      conversation.resolved ||
      readOnly ||
      actions.busy ||
      inbox.loadingMessages
    )
      return;
    const id = selected;
    const text = draft.trim();
    const message = live
      ? await actions.send(id, text)
      : {
          id: `local-${Date.now()}`,
          direction: 'out' as const,
          text,
          time: new Date().toISOString(),
        };
    if (!message) return;
    setConversations((items) =>
      items.map((c) =>
        c.id === id
          ? {
              ...c,
              messages: [...c.messages, message].slice(-200),
              preview: message,
              unread: false,
            }
          : c,
      ),
    );
    setDrafts((values) => (values[id]?.trim() === text ? { ...values, [id]: '' } : values));
    setNotice(live ? 'replySent' : 'replyAdded');
  };
  const toggleResolved = async () => {
    if (!conversation || readOnly || actions.busy) return;
    const id = selected;
    if (live && !(await actions.status(conversation))) return;
    setConversations((items) =>
      items.map((c) => (c.id === id ? { ...c, resolved: !c.resolved, unread: false } : c)),
    );
    setNotice(
      live
        ? conversation.resolved
          ? 'liveReopened'
          : 'liveResolved'
        : conversation.resolved
          ? 'reopened'
          : 'resolved',
    );
    if (live) inbox.retryList();
  };
  const suggest = async (prompt: string, action?: 'order_confirmation') => {
    if (!conversation || actions.busy) return;
    const id = selected;
    const suggestion = await actions.suggest(id, prompt, action);
    if (suggestion)
      setConversations((items) =>
        items.map((c) => (c.id === id ? { ...c, draft: suggestion } : c)),
      );
  };
  return (
    <div
      className={`social-inbox ${threadOpen ? 'thread-open' : ''} ${assistantOpen ? 'assistant-open' : ''}`}
    >
      <header className="inbox-page-heading">
        <div>
          <div className="inbox-eyebrow"> {t('customerWorkspace')} </div>
          <h1>
            {t(title)}
            <span className="inbox-heading-dot" />
          </h1>
          <p>{description ? t(description) : null}</p>
        </div>
        <div className="inbox-workspace">
          <span className="inbox-store-mark">{workspace.slice(0, 1).toLowerCase()}</span>
          <div>
            <strong>{workspace}</strong>
            <span> {t(live ? 'channels.Messenger' : 'connectedChannels')} </span>
          </div>
        </div>
      </header>
      {live && actions.canManage && (
        <button
          className="inbox-resolve"
          type="button"
          onClick={() => setSettingsOpen((open) => !open)}
        >
          {t('connectionSettings')}
        </button>
      )}
      {settingsOpen && (
        <Suspense fallback={<div role="status">{t('loadingWorkspace')}</div>}>
          <ConnectionSettings
            baseUrl={data.source?.url}
            busy={!!actions.busy}
            onClose={() => setSettingsOpen(false)}
            onSave={async (id, token) => {
              const saved = await actions.connect(id, token);
              if (saved) inbox.retryList();
              return saved;
            }}
          />
        </Suspense>
      )}
      <div className="inbox-demo-banner">
        <span>
          <span className="inbox-status-dot" />
          <strong>
            {' '}
            {t(
              live ? (actions.connection ? 'liveInbox' : 'connectingInbox') : 'interactivePreview',
            )}{' '}
          </strong>
          <span className="inbox-banner-detail">
            {' '}
            {t(live ? 'liveDescription' : 'demoDescription')}{' '}
          </span>
        </span>
        {live ? (
          <button
            type="button"
            className="inbox-resolve"
            onClick={inbox.refresh}
            disabled={inbox.loadingList}
          >
            {t('refreshInbox')}
          </button>
        ) : (
          <span className="inbox-demo-label"> {t('notConnected')} </span>
        )}
      </div>
      {actions.error && (
        <div className="inbox-action-error" role="alert">
          {t(actions.error)}{' '}
          <button type="button" onClick={actions.clearError}>
            {t('dismissError')}
          </button>
        </div>
      )}
      <div className="inbox-workspace-grid">
        <ConversationList
          conversations={conversations}
          selected={selected}
          onSelect={(id) => {
            selectConversation(id);
            setThreadOpen(true);
          }}
          query={query}
          setQuery={setQuery}
          channel={channel}
          setChannel={setChannel}
          filter={filter}
          setFilter={setFilter}
          loading={inbox.loadingList}
          error={!!inbox.listError}
          hasMore={!!inbox.listCursor}
          onLoadMore={inbox.loadMore}
          onRetry={inbox.retryList}
          showUnread
        />
        {conversation ? (
          <section
            className="inbox-thread"
            aria-label={t('conversationWith', { name: conversation.name })}
          >
            <header className="inbox-thread-header">
              <button
                className="inbox-icon-button inbox-mobile-back"
                aria-label={t('backToConversations')}
                onClick={() => setThreadOpen(false)}
              >
                <ArrowLeft size={20} />
              </button>
              <Avatar conversation={conversation} small />
              <div className="inbox-thread-person">
                <h2>{conversation.name}</h2>
                <span>
                  <ChannelIcon channel={conversation.channel} size={12} />{' '}
                  {t(`channels.${conversation.channel}`)} <b>·</b> {workspace}
                </span>
              </div>
              <button
                className="inbox-icon-button inbox-assistant-toggle"
                aria-label={t('openAssistant')}
                onClick={() => setAssistantOpen(true)}
              >
                <Sparkles size={19} />
              </button>
              <button
                className={`inbox-resolve ${conversation.resolved ? 'is-resolved' : ''}`}
                onClick={toggleResolved}
                disabled={readOnly || !!actions.busy}
              >
                <Check size={16} />
                {t(conversation.resolved ? 'reopen' : 'resolve')}
              </button>
            </header>
            <div className="inbox-thread-context">
              <span className="inbox-context-pill">{t(conversation.topic)}</span>
              {!live && (
                <span>
                  {' '}
                  {t('assignedTo')} <strong> {t('you')} </strong>
                </span>
              )}
            </div>
            <Suspense
              fallback={
                <div className="inbox-load-state" role="status">
                  {t('loadingMessages')}
                </div>
              }
            >
              <MessageHistory
                conversation={conversation}
                loading={inbox.loadingMessages}
                error={!!inbox.messageError}
                hasMore={!!inbox.messageCursor}
                hasNewer={inbox.hasNewer}
                onLoadOlder={inbox.loadEarlier}
                onLoadLatest={inbox.loadLatest}
                onRetry={inbox.retryMessages}
              />
            </Suspense>
            <div className="inbox-compose-area">
              <button
                className="inbox-ai-nudge"
                onClick={useDraft}
                disabled={
                  conversation.resolved || readOnly || inbox.loadingMessages || !conversation.draft
                }
              >
                <Sparkles size={15} />
                <span> {t('headStart')} </span>
                <strong>
                  {' '}
                  {t(live ? 'useDraft' : 'useSampleDraft')} <ArrowUpRight size={14} />
                </strong>
              </button>
              <form
                className="inbox-composer"
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                <div className="inbox-reply-label">
                  {' '}
                  {t('reply')}{' '}
                  <span>{t('via', { channel: t(`channels.${conversation.channel}`) })}</span>
                </div>
                <textarea
                  ref={composer}
                  aria-label={t('replyTo', { name: conversation.name })}
                  placeholder={
                    conversation.resolved
                      ? t('reopenToReply')
                      : t('writeReply', { name: conversation.name.split(' ')[0] })
                  }
                  value={draft}
                  disabled={conversation.resolved || readOnly || actions.busy === 'send'}
                  maxLength={2000}
                  onChange={(e) =>
                    setDrafts((values) => ({ ...values, [selected]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
                <div className="inbox-compose-footer">
                  <span> {t('keyboardHint')} </span>
                  <button
                    type="submit"
                    className="inbox-send"
                    disabled={
                      !draft.trim() ||
                      conversation.resolved ||
                      readOnly ||
                      inbox.loadingMessages ||
                      !!actions.busy
                    }
                  >
                    {' '}
                    {t(actions.busy === 'send' ? 'sendingReply' : 'sendReply')} <Send size={15} />
                  </button>
                </div>
              </form>
              <div className="inbox-compose-caption">
                {' '}
                {t(live ? (readOnly ? 'noReplyPermission' : 'liveDelivery') : 'demoDelivery')}{' '}
              </div>
            </div>
          </section>
        ) : (
          <section className="inbox-thread inbox-no-thread">
            <p>{t(inbox.loadingList ? 'loadingConversations' : 'emptyInbox')}</p>
          </section>
        )}
        {conversation && (desktop || assistantOpen) && (
          <Suspense
            fallback={
              <aside className="inbox-assistant" role="status">
                {t('loadingAssistant')}
              </aside>
            }
          >
            <AssistantPanel
              key={selected}
              conversation={conversation}
              onUseDraft={useDraft}
              onClose={() => setAssistantOpen(false)}
              live={live}
              aiAvailable={actions.aiAvailable && actions.canReply}
              generating={actions.busy === 'suggest'}
              onGenerate={suggest}
            />
          </Suspense>
        )}
      </div>
      <div className={`inbox-toast ${notice ? 'visible' : ''}`} role="status">
        {notice ? t(notice) : ''}
      </div>
    </div>
  );
}
