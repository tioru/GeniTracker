import { Component, computed, DestroyRef, effect, inject, linkedSignal, untracked } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { CharactersService } from '../characters/characters.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { httpResource } from '@angular/common/http';
import { Character } from '../../utilities/models/character';
import { CachedSrcDirective } from '../../utilities/directives/cachedSrc';
import { IntlDatePipe } from '../../utilities/pipes/date.pipe';
import { BackgroundService } from '../../utilities/services/background.service';
import { Elements, Nations } from '../../utilities/game-data';

@Component({
  imports: [CachedSrcDirective, TranslocoDirective, IntlDatePipe],
  selector: 'app-character',
  styleUrl: './character.component.scss',
  templateUrl: './character.component.html',
})
export class CharacterComponent {
  private transloco = inject(TranslocoService);
  private charactersService = inject(CharactersService);

  private name = toSignal(inject(ActivatedRoute).paramMap.pipe(map(params => params.get('name'))));
  public lang = toSignal(this.transloco.langChanges$, { initialValue: this.transloco.getActiveLang() });

  public entry = computed(() => this.charactersService.characters().find(c => c.name.en === this.name()));
  public id = computed(() => this.entry()?.id);

  public character = httpResource<Character>(() => {
    const id = this.id();
    return id ? `assets/data/characters/${this.lang()}/${id}.json` : undefined;
  });

  // undefined for the Traveler and Manekin(a), who have no element
  public element = computed(() => Elements.find(e => e.key === this.character.value()?.element));

  // undefined for characters with no nation (Traveler, Aloy, Nicole, Skirk…)
  public nation = computed(() => Nations.find(n => n.key === this.character.value()?.nation));

  public elementClass = computed(() => this.character.value()?.element?.toLowerCase() ?? 'unknown');

  public backgrounds = computed(() => this.nation()?.backgrounds ?? []);
  
  // Back to the first image whenever the nation changes
  public slide = linkedSignal({ source: this.backgrounds, computation: () => 0 });

  public birthday = computed(() => {
    const [month, day] = (this.character.value()?.birthday ?? '').split('/').map(Number);
    return month && day ? new Date(2000, month - 1, day) : null;
  });

  private bg = inject(BackgroundService);

  constructor() {
    effect(() => {
      const src = this.backgrounds()[this.slide()];
      untracked(() => this.bg.show(src));
    });

    effect(onCleanup => {
      const count = this.backgrounds().length;
      this.slide();
      if (count < 2) return;
      const timer = setTimeout(() => this.slide.update(i => (i + 1) % count), 7000);
      onCleanup(() => clearTimeout(timer));
    });

    inject(DestroyRef).onDestroy(() => this.bg.show());
  }
}
