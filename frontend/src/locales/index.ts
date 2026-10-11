import { be, type Strings } from "./be";

/**
 * Locale registry. Belarusian is primary; add `ru` here when translations land
 * (mirror `be.ts`, then switch `defaultLocale` or wire a locale switcher).
 */
export const locales = { be } as const;

export type Locale = keyof typeof locales;

export const defaultLocale: Locale = "be";

/** Active UI strings. Import as `t` in components. */
export const t: Strings = locales[defaultLocale];

export type { Strings };
