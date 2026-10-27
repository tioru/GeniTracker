import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

export const availableLangs = ['fr', 'en'];
export const langStorageKey = 'lang';

export function getInitialLang(): string {
  try {
    const stored = localStorage.getItem(langStorageKey);
    if (stored && availableLangs.includes(stored)) {
      return stored;
    }
  } catch {}
  return 'fr';
}

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  getTranslation(lang: string) {
    return this.http.get<Translation>(`assets/i18n/${lang}.json`);
  }
}
