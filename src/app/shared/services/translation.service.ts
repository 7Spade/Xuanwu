/**
 * Translation Service
 * Wrapper for Angular i18n/localize functionality
 * 
 * @layer Shared
 * @package @angular/localize
 * @responsibility Provide translation and localization services
 */
import { inject, Injectable, LOCALE_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Translation {
  [key: string]: string | Translation;
}

/**
 * Translation Service
 * Provides i18n translation functionality
 * 
 * @example
 * ```typescript
 * constructor(private translate: TranslationService) {}
 * 
 * // Get translation
 * this.translate.get('common.save'); // Returns 'Save' or '儲存'
 * 
 * // Get with parameters
 * this.translate.get('validation.minLength', { min: 5 }); // Returns 'Minimum length is 5'
 * 
 * // Change language
 * this.translate.use('zh-TW');
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly defaultLocale = inject(LOCALE_ID);
  
  private translations = signal<Translation>({});
  private currentLang = signal<string>(this.defaultLocale);

  /**
   * Available languages
   */
  readonly availableLanguages = ['en', 'zh-TW'];

  /**
   * Current language signal
   */
  readonly currentLanguage = this.currentLang.asReadonly();

  constructor() {
    // Load default language on init
    this.use(this.defaultLocale).subscribe();
  }

  /**
   * Switch to a different language
   * @param lang - Language code (e.g., 'en', 'zh-TW')
   * @returns Observable that completes when language is loaded
   */
  use(lang: string): Observable<Translation> {
    if (!this.availableLanguages.includes(lang)) {
      console.warn(`Language ${lang} not available, using default`);
      lang = 'en';
    }

    return this.http.get<Translation>(`/assets/i18n/${lang}.json`).pipe(
      tap(translations => {
        this.translations.set(translations);
        this.currentLang.set(lang);
      }),
      catchError(error => {
        console.error(`Failed to load language ${lang}`, error);
        return of({});
      })
    );
  }

  /**
   * Get translation for a key
   * @param key - Translation key (dot notation, e.g., 'common.save')
   * @param params - Optional parameters for interpolation
   * @returns Translated string
   */
  get(key: string, params?: Record<string, any>): string {
    const keys = key.split('.');
    let value: any = this.translations();

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Interpolate parameters
    if (params) {
      return this.interpolate(value, params);
    }

    return value;
  }

  /**
   * Get translation as an observable
   * @param key - Translation key
   * @param params - Optional parameters
   * @returns Observable of translated string
   */
  get$(key: string, params?: Record<string, any>): Observable<string> {
    return of(this.get(key, params));
  }

  /**
   * Interpolate parameters in translation string
   * @param text - Text with {param} placeholders
   * @param params - Parameters to interpolate
   * @returns Interpolated string
   */
  private interpolate(text: string, params: Record<string, any>): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key].toString() : match;
    });
  }

  /**
   * Check if a translation key exists
   * @param key - Translation key
   * @returns True if key exists
   */
  has(key: string): boolean {
    const keys = key.split('.');
    let value: any = this.translations();

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return false;
      }
    }

    return typeof value === 'string';
  }
}
