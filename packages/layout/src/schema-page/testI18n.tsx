import React from 'react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { render as renderUI } from '@testing-library/react';
import { WORKSPACE_TRANSLATIONS } from './translations';

export const testI18n = createInstance();
void testI18n.init({
  lng: 'EN',
  fallbackLng: 'EN',
  defaultNS: 'workspace',
  initImmediate: false,
  interpolation: { escapeValue: false },
  resources: {
    EN: {
      workspace: WORKSPACE_TRANSLATIONS.EN,
      workspaceTest: {
        inbox: { title: 'Inbox', description: 'A little more context. A better conversation.' },
        orders: 'Orders',
      },
    },
    VI: {
      workspace: WORKSPACE_TRANSLATIONS.VI,
      workspaceTest: {
        inbox: { title: 'Hộp thư', description: 'Thêm thông tin. Hội thoại hiệu quả hơn.' },
        orders: 'Đơn hàng',
      },
    },
  },
});

export function render(element: React.ReactElement) {
  return renderUI(<I18nextProvider i18n={testI18n}>{element}</I18nextProvider>);
}

beforeEach(async () => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: jest.fn(() => ({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });
  await testI18n.changeLanguage('EN');
});
