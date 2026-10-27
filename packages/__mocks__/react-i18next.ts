module.exports = {
  language: 'en',
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: (lng) => lng,
    },
  }),
};

export {};
