import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';

import { imageCacheInterceptor } from '../utilities/core/interceptors/image-cache.interceptor';
import { availableLangs, defaultLang, getInitialLang, TranslocoHttpLoader } from '../utilities/core/i18n/transloco-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(withXhr(),
      withInterceptors([imageCacheInterceptor])
    ),
    provideTransloco({
      config: {
        availableLangs: availableLangs,
        defaultLang: getInitialLang(),
        fallbackLang: defaultLang,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader
    })
  ]
};
