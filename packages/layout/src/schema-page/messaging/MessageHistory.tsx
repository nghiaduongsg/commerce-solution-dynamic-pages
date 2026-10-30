import React, { useLayoutEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Conversation } from '../schemas/model';
import { formatMessageTime, formatMessageDate } from '../translations';
import { Avatar, ChannelIcon } from './primitives';

export default function MessageHistory({
  conversation,
  loading,
  error,
  hasMore,
  hasNewer,
  onLoadOlder,
  onLoadLatest,
  onRetry,
}: {
  conversation: Conversation;
  loading: boolean;
  error: boolean;
  hasMore: boolean;
  hasNewer: boolean;
  onLoadOlder: () => void;
  onLoadLatest: () => void;
  onRetry: () => void;
}) {
  const { t, i18n } = useTranslation('workspace');
  const scroller = useRef<HTMLDivElement>(null);
  const previous = useRef({ id: '', last: '', count: 0 });
  const anchor = useRef<{ height: number; top: number } | null>(null);
  const last = conversation.messages[conversation.messages.length - 1]?.id || '';
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (previous.current.id === conversation.id && anchor.current) {
      el.scrollTop = anchor.current.top + el.scrollHeight - anchor.current.height;
      anchor.current = null;
    } else if (previous.current.id !== conversation.id || previous.current.last !== last) {
      el.scrollTop = el.scrollHeight;
    }
    previous.current = { id: conversation.id, last, count: conversation.messages.length };
  }, [conversation.id, conversation.messages.length, last]);
  const loadOlder = () => {
    if (loading || !scroller.current) return;
    anchor.current = { height: scroller.current.scrollHeight, top: scroller.current.scrollTop };
    onLoadOlder();
  };
  return (
    <div
      ref={scroller}
      className="inbox-messages"
      role="log"
      aria-label={t('messages')}
      aria-live="polite"
      aria-busy={loading}
    >
      {hasMore && (
        <button className="inbox-load-more" disabled={loading} onClick={loadOlder}>
          {t('loadEarlier')}
        </button>
      )}
      {hasNewer && (
        <button className="inbox-load-more" disabled={loading} onClick={onLoadLatest}>
          {t('backToLatest')}
        </button>
      )}
      {loading && (
        <p className="inbox-load-state" role="status">
          {t('loadingMessages')}
        </p>
      )}
      {error && (
        <div className="inbox-load-state" role="alert">
          {t('loadMessagesFailed')} <button onClick={onRetry}>{t('retry')}</button>
        </div>
      )}
      {!loading && !error && !conversation.messages.length && (
        <p className="inbox-load-state">{t('emptyMessages')}</p>
      )}
      <div className="inbox-date-divider">
        <span>{t('conversationHistory')}</span>
      </div>
      <div className="inbox-conversation-start">
        <ChannelIcon channel={conversation.channel} size={18} />
        <p>{t('conversationStarted', { channel: t(`channels.${conversation.channel}`) })}</p>
      </div>
      {conversation.messages.map((message, index) => (
        <React.Fragment key={message.id}>
          {formatMessageDate(message.time, i18n.resolvedLanguage || i18n.language) !==
            formatMessageDate(
              conversation.messages[index - 1]?.time || '',
              i18n.resolvedLanguage || i18n.language,
            ) && (
            <div className="inbox-date-divider">
              <span>{formatMessageDate(message.time, i18n.resolvedLanguage || i18n.language)}</span>
            </div>
          )}
          <div className={`inbox-message-row ${message.direction === 'out' ? 'outgoing' : ''}`}>
            {message.direction === 'in' && <Avatar conversation={conversation} small />}
            <div className="inbox-message-content">
              <div className="inbox-message-bubble">
                {message.text}
                {message.attachments?.map((attachment, index) => (
                  <a
                    key={`${attachment.url}-${index}`}
                    className="inbox-attachment"
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {attachment.kind === 'image' && (
                      <img
                        loading="lazy"
                        decoding="async"
                        src={attachment.url}
                        alt={attachment.name || t('imageAttachment')}
                      />
                    )}
                    <span>{attachment.name || t('openAttachment')}</span>
                  </a>
                ))}
                {!message.text && !message.attachments?.length && t('unsupportedMessage')}
              </div>
              <div className="inbox-message-time">
                {message.direction === 'out' && <span>{t('you')} · </span>}
                {message.time.startsWith('workspace:')
                  ? t(message.time)
                  : formatMessageTime(message.time, i18n.resolvedLanguage || i18n.language)}
                {message.direction === 'out' && <Check size={13} />}
              </div>
            </div>
          </div>
        </React.Fragment>
      ))}
      {conversation.resolved && (
        <div className="inbox-resolved-note">
          <Check size={14} />
          {t('conversationResolved')}
        </div>
      )}
    </div>
  );
}
