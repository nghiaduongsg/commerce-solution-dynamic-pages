import { getPageView, screenTypeForView } from './pageViews';
import { DETAIL_FORM, SEARCH_FORM, SINGLE_RECORD_FORM } from '@pkg-constants/screenTypeIds';
const registry = {
  Product: { views: { list: {}, form: {}, detail: {} } },
  Party: { pageUiSchema: {} },
};
test('selects independent list, create, edit and detail declarations', () => {
  expect(getPageView('Product', '/page/Product/list', undefined, '', registry)).toBe('list');
  expect(getPageView('Product', '/page/Product', undefined, '', registry)).toBe('form');
  expect(getPageView('Product', '/page/Product/p1', 'p1', '', registry)).toBe('detail');
  expect(getPageView('Product', '/page/Product/p1/view', 'p1', '', registry)).toBe('detail');
  expect(getPageView('Product', '/page/Product/p1/edit', 'p1', '', registry)).toBe('form');
  expect(screenTypeForView('list')).toBe(SEARCH_FORM);
  expect(screenTypeForView('form')).toBe(SINGLE_RECORD_FORM);
  expect(screenTypeForView('detail')).toBe(DETAIL_FORM);
});
test('preserves the legacy form route behavior', () => {
  expect(getPageView('Party', '/page/Party/p1', 'p1', '', registry)).toBe('form');
});
