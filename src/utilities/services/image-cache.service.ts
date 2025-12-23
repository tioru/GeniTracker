import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CacheEntry {
  response: HttpResponse<any>;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 3600000; // 1 heure

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET' || !isImageRequest(req.url)) {
    return next(req);
  }

  const cached = cache.get(req.url);
  const now = Date.now();

  // Vérifier si le cache est valide
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log('✅ IMAGE CHARGÉE DEPUIS LE CACHE:', req.url);
    return of(cached.response.clone());
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(req.url, {
          response: event.clone(),
          timestamp: now
        });
        console.log('💾 IMAGE MISE EN CACHE:', req.url);
      }
    })
  );
};

function isImageRequest(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|svg|webp|bmp|ico)(\?.*)?$/i.test(url);
}