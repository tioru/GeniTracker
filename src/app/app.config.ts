import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { imageCacheInterceptor } from '../utilities/core/interceptors/image-cache.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(withXhr()),
    importProvidersFrom([BrowserAnimationsModule]),
    provideHttpClient(withXhr(), 
      withInterceptors([imageCacheInterceptor])
    )
  ]
};
