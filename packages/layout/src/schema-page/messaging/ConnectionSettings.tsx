import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { FacebookConfig, prepareFacebook, loginFacebook } from './facebookLogin';

type PageChoice = { id: string; name: string; ticket: string };
export default function ConnectionSettings({
  busy,
  onSave,
  onClose,
  baseUrl,
}: {
  baseUrl?: string;
  busy: boolean;
  onSave: (id: string, ticket: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const { t } = useTranslation('workspace');
  const [config, setConfig] = useState<FacebookConfig>();
  const [pages, setPages] = useState<PageChoice[]>([]);
  const [id, setId] = useState('');
  const [token, setToken] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const active = useRef(true);
  const inFlight = useRef(false);
  useEffect(() => {
    active.current = true;
    const controller = new AbortController();
    setConfig(undefined);
    setPages([]);
    axios
      .get(`${baseUrl}/connection/facebook`, { signal: controller.signal })
      .then(async ({ data }) => {
        await prepareFacebook(data);
        if (!controller.signal.aborted) setConfig(data);
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(
            e.response?.data?.error?.code === 'facebook_not_configured'
              ? 'facebookNotConfigured'
              : 'facebookLoginFailed',
          );
      });
    return () => {
      active.current = false;
      controller.abort();
    };
  }, [baseUrl]);
  const showPages = (choices: PageChoice[]) => {
    setPages(choices);
    setId(choices[0]?.id || '');
    if (!choices.length) setError('facebookNoPages');
  };
  const findPages = () => {
    const credential = token.trim();
    if (busy || working || inFlight.current || !credential) return;
    inFlight.current = true;
    setWorking(true);
    setError('');
    setPages([]);
    axios
      .post(`${baseUrl}/connection/pages`, { access_token: credential })
      .then(({ data }) => {
        if (!active.current) return;
        setToken('');
        showPages(data.pages);
      })
      .catch((e) => {
        if (active.current)
          setError(
            e.response?.data?.error?.code === 'meta_token_expired'
              ? 'errors.meta_token_expired'
              : 'facebookTokenInvalid',
          );
      })
      .finally(() => {
        inFlight.current = false;
        if (active.current) setWorking(false);
      });
  };
  const login = () => {
    if (!config || busy || inFlight.current) return;
    inFlight.current = true;
    setWorking(true);
    setError('');
    setPages([]);
    // Start the SDK popup before awaiting any network work.
    loginFacebook(config)
      .then((token) =>
        axios.post(`${baseUrl}/connection/facebook/pages`, { user_access_token: token }),
      )
      .then(({ data }) => {
        if (!active.current) return;
        showPages(data.pages);
      })
      .catch((e) => {
        if (active.current)
          setError(
            e.message === 'login_cancelled' ? 'facebookLoginCancelled' : 'facebookLoginFailed',
          );
      })
      .finally(() => {
        inFlight.current = false;
        if (active.current) setWorking(false);
      });
  };
  return (
    <section className="inbox-connection-settings" aria-label={t('connectionSettings')}>
      <h2>{t('connectionSettings')}</h2>
      <p>{t('facebookLoginHelp')}</p>
      {error && <p role="alert">{t(error)}</p>}
      <button
        className="inbox-resolve"
        type="button"
        onClick={login}
        disabled={!config || busy || working}
      >
        {t(working ? 'connectingInbox' : 'facebookLogin')}
      </button>
      {!!pages.length && (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const page = pages.find((item) => item.id === id);
            if (!page || busy || working || inFlight.current) return;
            inFlight.current = true;
            setWorking(true);
            try {
              if (await onSave(page.id, page.ticket)) {
                setPages([]);
                onClose();
              }
            } finally {
              inFlight.current = false;
              if (active.current) setWorking(false);
            }
          }}
        >
          <label>
            {t('facebookChoosePage')}
            <select
              value={id}
              onChange={(event) => setId(event.target.value)}
              disabled={busy || working}
            >
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>
          </label>
          <button className="inbox-resolve" type="submit" disabled={!id || busy || working}>
            {t('saveConnection')}
          </button>
        </form>
      )}
      <details>
        <summary>{t('manualConnection')}</summary>
        <p>{t('connectionHelp')}</p>
        <form
          aria-label={t('manualConnection')}
          onSubmit={(event) => {
            event.preventDefault();
            findPages();
          }}
        >
          <label>
            {t('facebookAccessToken')}
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
              autoComplete="off"
              disabled={busy || working}
            />
          </label>
          <button
            className="inbox-resolve"
            type="submit"
            disabled={busy || working || !token.trim()}
          >
            {t(working ? 'findingPages' : 'findPages')}
          </button>
        </form>
      </details>
      <button className="inbox-resolve" type="button" onClick={onClose} disabled={busy || working}>
        {t('cancelConnection')}
      </button>
    </section>
  );
}
