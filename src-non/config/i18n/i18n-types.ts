/**
 * i18n type contracts.
 *
 * Locale: supported locale codes.
 * I18nConfig: runtime configuration shape.
 * TranslationMessages: message schema imported from i18n.schema.
 */

import type { TranslationMessages } from './i18n.schema';

export type Locale = 'en' | 'zh-TW';

export interface I18nConfig {
  defaultLocale: Locale;
  locales: Locale[];
}

export type { TranslationMessages };
