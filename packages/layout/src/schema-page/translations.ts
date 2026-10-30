import EN from './locales/EN.json';
import VI from './locales/VI.json';

/** Register these under the workspace namespace in the host's i18next instance. */
export const WORKSPACE_TRANSLATIONS = { EN, VI };

export function formatMessageTime(value: string, language: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language, { hour: 'numeric', minute: '2-digit' }).format(date);
}

export function formatMessageDate(value: string, language: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
export function formatPreviewTime(value: string, language: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toDateString() === new Date().toDateString()
    ? formatMessageTime(value, language)
    : formatMessageDate(value, language);
}
