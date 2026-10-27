import i18n, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { CODELISTS, COMMON } from '@pkg-constants/translationNamespaces';
import backend from 'i18next-http-backend';
import axios from 'axios';

export const DEFAULT_LNG = 'EN';
export const I18NTRANSLATION = 'translation';

const transformToJSON = (data) => {
  const translations = {};
  (data || []).forEach((group) => {
    translations[group.namespaceCL] = {};
    group.items.forEach((item) => {
      translations[group.namespaceCL][item.itemKey] = item.itemDescription || item.itemKey;
    });
  });

  return translations;
};

// const mockTranslations = (lng, ns) => {
//   const nsTranslations = window['DEFAULT_TRANSLATIONS'][ns];
//   const mocked = {};
//   Object.keys(nsTranslations || {}).forEach((k) => (mocked[k] = `${nsTranslations[k]} ${lng}`));
//   return mocked;
// };

const backendOptions = {
  loadPath: '{{ns}}__SEPARATOR__{{lng}}',
  request: (_options, path, _payload, callback) => {
    const parts = path?.split('__SEPARATOR__');
    const validPath = parts?.length >= 2;
    const ns = validPath ? parts[0] : null;
    const lng = validPath ? parts[1] : null;

    const translationData = i18n?.services?.resourceStore?.data || {};
    const lngData = translationData[lng] || {};
    const filteredNamespaces = [ns].filter(
      (n) =>
        !!n &&
        n !== 'undefined' &&
        n !== 'null' &&
        n !== CODELISTS &&
        n !== I18NTRANSLATION &&
        !lngData[n],
    );
    const params = {
      namespaceCLs: filteredNamespaces.join(','),
    };

    if (filteredNamespaces.length) {
      axios
        .get(
          `${window['REACT_APP_API_URL']}/translation-management/translatable-items/namespace-labels`,
          {
            params,
          },
        )
        .then((result) => {
          callback(null, {
            data:
              window['DEFAULT_TRANSLATIONS'] && window['DEFAULT_TRANSLATIONS'][ns]
                ? window['DEFAULT_TRANSLATIONS'][ns]
                : transformToJSON(result?.data)[ns],
            status: 200,
          });
        })
        .catch(() => {
          console.warn('Failed to load ', ns, '. Using default labels.');
          callback(null, {
            data: window['DEFAULT_TRANSLATIONS'] ? window['DEFAULT_TRANSLATIONS'][ns] : {},
            status: 200,
          });
        });
    }
  },
};

export const setupTranslations = (lng = DEFAULT_LNG) => {
  i18n
    .use(initReactI18next)
    .use(backend)
    .init({
      backend: backendOptions,
      lng,
      debug: false,
      defaultNS: COMMON,
      fallbackLng: DEFAULT_LNG,
      react: {
        wait: true,
        useSuspense: false,
      },
      interpolation: {
        escapeValue: false,
      },
    } as InitOptions);
};

export default setupTranslations;
