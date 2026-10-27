import { DETAIL_FORM, SEARCH_FORM, SINGLE_RECORD_FORM } from '@pkg-constants/screenTypeIds';

export function getPageView(
  pageId: string,
  pathname: string,
  idKey?: string,
  search = '',
  registry = window['FALLBACK_SCHEMAS'],
) {
  if (pathname.endsWith('/list')) return 'list';
  if (!registry?.[pageId]?.views) return 'form';
  if (!idKey || pathname.endsWith('/edit') || new URLSearchParams(search).get('mode') === 'edit')
    return 'form';
  return 'detail';
}
export const screenTypeForView = (view: string) =>
  view === 'list' ? SEARCH_FORM : view === 'detail' ? DETAIL_FORM : SINGLE_RECORD_FORM;
