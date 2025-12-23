import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, HttpResponse<any>>();

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ne mettre en cache que les requêtes GET pour les images
    if (req.method !== 'GET' || !this.isImageRequest(req.url)) {
      return next.handle(req);
    }

    // Vérifier si la réponse est en cache
    const cachedResponse = this.cache.get(req.url);
    if (cachedResponse) {
      return of(cachedResponse.clone());
    }

    // Sinon, faire la requête et mettre en cache
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cache.set(req.url, event.clone());
        }
      })
    );
  }

  private isImageRequest(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|svg|webp|bmp|ico)(\?.*)?$/i.test(url);
  }

  // Méthode optionnelle pour vider le cache
  clearCache(): void {
    this.cache.clear();
  }
}