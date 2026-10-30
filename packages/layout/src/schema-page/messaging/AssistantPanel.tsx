import React, { useState } from 'react';
import { Sparkles, X, ArrowUpRight, CircleHelp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Conversation } from '../schemas/model';
import { Avatar, ChannelIcon } from './primitives';
export default function AssistantPanel({
  conversation,
  onUseDraft,
  onClose,
  live = false,
  aiAvailable = false,
  generating = false,
  onGenerate,
}: {
  conversation: Conversation;
  onUseDraft: () => void;
  onClose: () => void;
  live?: boolean;
  aiAvailable?: boolean;
  generating?: boolean;
  onGenerate?: (prompt: string, action?: 'order_confirmation') => void;
}) {
  const { t } = useTranslation('workspace');
  const [prompt, setPrompt] = useState('');
  return (
    <aside className="inbox-assistant" aria-label={t('assistantContext')}>
      <div className="inbox-panel-heading">
        <span>
          <Sparkles size={18} /> {t('assistant')}{' '}
        </span>
        <button
          className="inbox-icon-button assistant-close"
          onClick={onClose}
          aria-label={t('closeAssistant')}
        >
          <X size={17} />
        </button>
        {!live && <span className="inbox-preview-tag"> {t('preview')} </span>}
      </div>
      <div className="inbox-assistant-scroll">
        <div className="inbox-customer">
          <Avatar conversation={conversation} />
          <h3>{conversation.name}</h3>
          <span>{conversation.handle}</span>
          <div>
            <ChannelIcon channel={conversation.channel} /> {t(`channels.${conversation.channel}`)}
          </div>
        </div>
        <section className="inbox-context-section">
          <h3> {t('summary')} </h3>
          <p>{conversation.summary || t('noSummary')}</p>
          {!!conversation.intent && (
            <div className="inbox-intent">
              <span> {t('intent')} </span>
              <strong>{t(conversation.intent)}</strong>
            </div>
          )}
        </section>
        <section className="inbox-draft-card">
          <div className="inbox-draft-title">
            <Sparkles size={16} />
            <h3> {t('suggestedReply')} </h3>
          </div>
          <p>{conversation.draft || t('noSuggestion')}</p>
          {live && (
            <>
              <label className="inbox-assistant-prompt" htmlFor="inbox-assistant-prompt">
                {t('assistantPromptLabel')}
              </label>
              <textarea
                id="inbox-assistant-prompt"
                className="inbox-assistant-prompt-input"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={t('assistantPromptPlaceholder')}
                aria-describedby="inbox-assistant-prompt-help"
                maxLength={2000}
                rows={3}
                disabled={!aiAvailable || generating || conversation.resolved}
              />
              <small id="inbox-assistant-prompt-help">{t('assistantPromptHelp')}</small>
              <button
                type="button"
                className="inbox-use-draft"
                onClick={() => onGenerate?.(prompt.trim())}
                disabled={!aiAvailable || generating || conversation.resolved}
              >
                {t(generating ? 'generatingDraft' : 'generateDraft')}
              </button>
              {!aiAvailable && <p>{t('aiSetupRequired')}</p>}
              <button
                type="button"
                className="inbox-use-draft"
                onClick={() => onGenerate?.(prompt.trim(), 'order_confirmation')}
                disabled={!aiAvailable || generating || conversation.resolved}
              >
                {t('generateOrderConfirmation')}
              </button>
              <small>{t('orderConfirmationHelp')}</small>
            </>
          )}
          <button
            className="inbox-use-draft"
            onClick={onUseDraft}
            disabled={conversation.resolved || !conversation.draft}
          >
            {' '}
            {t('useDraft')} <ArrowUpRight size={16} />
          </button>
          <small> {t(live ? 'reviewLiveSuggestion' : 'reviewSuggestion')} </small>
        </section>
        <section className="inbox-context-section">
          <h3> {t('nextSteps')} </h3>
          <div className="inbox-next-step">
            <span>1</span>
            <p> {t('confirmDetails')} </p>
          </div>
          <div className="inbox-next-step">
            <span>2</span>
            <p> {t('checkSource')} </p>
          </div>
          <div className="inbox-next-step">
            <span>3</span>
            <p> {t('personalize')} </p>
          </div>
        </section>
        <div className="inbox-review-note">
          <CircleHelp size={16} />
          <p> {t('reviewNote')} </p>
        </div>
      </div>
    </aside>
  );
}
