import { COMMON_UI_TRANSLATIONS, formatUiNumber } from './index';

const { createInstance }: typeof import('i18next') = jest.requireActual(
  '../../../../node_modules/i18next/dist/cjs/i18next.js',
);

test('formats upload sizes using the active language and a catalog template', async () => {
  const i18n = createInstance();
  await i18n.init({
    lng: 'EN',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    resources: {
      EN: { common: COMMON_UI_TRANSLATIONS.EN },
      VI: { common: COMMON_UI_TRANSLATIONS.VI },
    },
  });
  expect(i18n.t('ui.fileSize', { size: formatUiNumber(1234.5, i18n.language) })).toBe(
    '1,234.50 KB',
  );
  await i18n.changeLanguage('VI');
  expect(i18n.t('ui.fileSize', { size: formatUiNumber(1234.5, i18n.language) })).toBe(
    '1.234,50 KB',
  );
  expect(i18n.t('ui.loadingData')).toBe('Đang tải dữ liệu…');
  expect(i18n.t('ui.configurationNotFound', { id: 'Product' })).toBe(
    'Không tìm thấy cấu hình cho Product',
  );
});
