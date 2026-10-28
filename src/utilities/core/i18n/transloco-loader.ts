import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

export const defaultLang = 'en';
export const availableLangs = ['fr', defaultLang];
export const langStorageKey = 'lang';

export function getInitialLang(): string {
  try {
    const stored = localStorage.getItem(langStorageKey);
    if (stored && availableLangs.includes(stored)) {
      return stored;
    }
  } catch {}
  return defaultLang;
}

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  getTranslation(lang: string) {
    return this.http.get<Translation>(`assets/i18n/${lang}.json`);
  }
}
