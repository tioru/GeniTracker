import { Injectable, signal } from '@angular/core';

export interface BackgroundLayer { id: number; src: string; }

@Injectable({ providedIn: 'root' })
export class BackgroundService {
  static readonly DEFAULT = 'assets/img/nation/fontaine/10.jpg';

  private nextId = 1;
  private target = BackgroundService.DEFAULT;
  readonly layers = signal<BackgroundLayer[]>([{ id: 0, src: BackgroundService.DEFAULT }]);

  /** Cross-fades to `src` once the image is decoded; no argument = default background */
  async show(src = BackgroundService.DEFAULT): Promise<void> {
    if (src === this.target) return;
    this.target = src;
    const img = new Image();
    img.src = src;
    await img.decode().catch(() => {});   // a broken image still fades in, like a normal <img>
    if (src !== this.target) return;      // another background was asked for meanwhile
    this.layers.update(layers => [...layers.slice(-2), { id: this.nextId++, src }]);
  }

  /** A layer finished fading in: the ones below it are hidden, drop them */
  settle(id: number): void {
    this.layers.update(layers => layers.filter(l => l.id >= id));
  }
}