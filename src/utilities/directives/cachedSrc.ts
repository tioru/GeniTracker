import { DestroyRef, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ImageCacheService } from '../services/image-cache.service';

@Directive({
  selector: 'img[cachedSrc]',
  standalone: true
})
export class CachedSrcDirective {
  cachedSrc = input.required<string>();

  private img = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;
  private imageCache = inject(ImageCacheService);
  private observer?: IntersectionObserver;
  private loading?: Subscription;

  constructor() {
    effect(() => this.show(this.cachedSrc()));

    inject(DestroyRef).onDestroy(() => this.stop());
  }

  private show(url: string) {
    this.stop();

    const cached = this.imageCache.imageObjectUrls.get(url);
    if (cached) {
      this.img.src = cached;
      return;
    }

    this.observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) {
        return;
      }
      this.observer?.disconnect();
      this.loading = this.imageCache.loadImage(url).subscribe({
        next: objectUrl => this.img.src = objectUrl,
        error: () => this.img.src = url,
      });
    }, { rootMargin: '200px' });
    this.observer.observe(this.img);
  }

  private stop() {
    this.observer?.disconnect();
    this.loading?.unsubscribe();
  }
}
