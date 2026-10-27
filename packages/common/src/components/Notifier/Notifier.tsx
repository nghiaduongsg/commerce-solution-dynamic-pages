import React, { useEffect } from 'react';
import { useSnackbar } from 'notistack';

import useNotifiers from '@pkg-common/notifier/useNotifiers';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';

let displayed: Array<string | number> = [];

const storeDisplayed = (id: string | number) => {
  displayed = [...displayed, id];
};

const snackBarProviderCustomization = {
  error: {
    persist: true,
  },
};
const Notifier: React.FC = () => {
  const { notifications, clearNotification } = useNotifiers();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const namespaces = [
    COMMON,
    ...notifications.map((notification) => notification.namespace),
  ] as string[];

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation(namespaces);

  useEffect(() => {
    notifications.forEach(({ key, message, severity = 'dark', namespace }) => {
      if (displayed.includes(key)) {
        return;
      }

      enqueueSnackbar(
        translate(message, {
          defaultValue: message || 'genericError',
          ns: namespace,
          lng: selectedLanguage,
        }),
        {
          key,
          ...snackBarProviderCustomization[severity],
        },
      );
      storeDisplayed(key);
    });
  }, [notifications, closeSnackbar, enqueueSnackbar, clearNotification]);

  return null;
};

export default Notifier;
