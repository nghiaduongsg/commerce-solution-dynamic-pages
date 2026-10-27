import { SlidersHorizontal, type LucideIcon } from 'lucide-react';

export type ResolveIconFn = (name?: string) => LucideIcon;

let _resolver: ResolveIconFn | null = null;

/**
 * Called once at host application startup
 *
 * Icon import for dynamic content are inntentionally kept outside dynamic-pages - each client
 * product has its own icon set and shoud not be forced to bundle icons they don't use.
 * This injection point is to resolve icons without owning or knowing about them.
 * @param callback
 */
export const registerIconResolver = (callback: ResolveIconFn): void => {
  _resolver = callback;
};

/**
 * Used to resolve icon by name
 *
 * Fallsback to a placeholder instead of throwing so that missing resolver
 * or an unrecognized icon name never crashes the app.
 * @param name
 */
export const resolveFilterIcon = (name?: string): LucideIcon => {
  if (!_resolver) {
    console.warn(
      'resolveFilterIcon was called before registerIconResolver().' +
        'Import your icons config before rendering the app see (src/index.tsx)',
    );
    return SlidersHorizontal;
  }
  return _resolver(name);
};
