import EN from './EN.json';
import VI from './VI.json';

/** Merge into the host's common namespace without replacing its existing labels. */
export const COMMON_UI_TRANSLATIONS = { EN, VI };

export const formatUiNumber = (value: number, language: string) =>
  new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    value,
  );
