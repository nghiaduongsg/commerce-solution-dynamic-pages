import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ConnectionSettings({
  pageId,
  busy,
  onSave,
  onClose,
}: {
  pageId?: string;
  busy: boolean;
  onSave: (id: string, token: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const { t } = useTranslation('workspace');
  const [id, setId] = useState(pageId || '');
  const [token, setToken] = useState('');
  return (
    <section className="inbox-connection-settings" aria-label={t('connectionSettings')}>
      <h2>{t('connectionSettings')}</h2>
      <p>{t('connectionHelp')}</p>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy || !id.trim() || !token.trim()) return;
          const credential = token.trim();
          setToken('');
          if (await onSave(id.trim(), credential)) onClose();
        }}
      >
        <label>
          {t('facebookPageId')}
          <input
            value={id}
            onChange={(event) => setId(event.target.value)}
            required
            autoComplete="off"
            disabled={busy}
          />
        </label>
        <label>
          {t('facebookAccessToken')}
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            required
            autoComplete="off"
            disabled={busy}
          />
        </label>
        <button
          className="inbox-resolve"
          type="submit"
          disabled={busy || !id.trim() || !token.trim()}
        >
          {t(busy ? 'connectingInbox' : 'saveConnection')}
        </button>
        <button className="inbox-resolve" type="button" disabled={busy} onClick={onClose}>
          {t('cancelConnection')}
        </button>
      </form>
    </section>
  );
}
