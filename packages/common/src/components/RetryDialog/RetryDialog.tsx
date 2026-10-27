import React, { useEffect, useState } from 'react';
import ConfirmationBox from '../ConfirmationBox/ConfirmationBox';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import { useSystem } from '@pkg-setup/index';

const RetryDialog = (): React.JSX.Element | null => {
  const { selectedLanguage } = useSystem();
  const { t } = useTranslation([COMMON]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handler = (e: Event) => {
      setMessage((e as CustomEvent).detail || t('conflict'));
      setOpen(true);
    };
    globalThis.addEventListener('http-retry-409', handler);
    return () => globalThis.removeEventListener('http-retry-409', handler);
  }, [t]);

  const handleClose = () => {
    setOpen(false);
    setMessage('');
  };

  const choices: Array<{
    label: string;
    action: () => void;
    variant: 'outlined' | 'contained';
    testId: string;
  }> = [
    {
      label: t('close'),
      action: handleClose,
      variant: 'outlined',
      testId: 'conflict-close',
    },
    {
      label: t('refresh'),
      action: () => globalThis.location.reload(),
      variant: 'contained',
      testId: 'conflict-refresh',
    },
  ];

  if (!open) return null;

  return (
    <ConfirmationBox
      open={open}
      onClose={handleClose}
      title={t('errorMessage')}
      message={`⚠️ ${t('conflictMessage', {
        ns: COMMON,
        lng: selectedLanguage,
        message,
      })}`}
      choices={choices}
      testId="retry-dialog"
    />
  );
};

export default RetryDialog;
