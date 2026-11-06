import { Component, computed, inject } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { CharactersService } from '../characters/characters.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { httpResource } from '@angular/common/http';
import { Character } from './character';
import { CachedSrcDirective } from '../../utilities/directives/cachedSrc';
import { Elements, Nations } from '../characters/filters';
import { DatePipe } from '@angular/common';
import { IntlDatePipe } from '../../utilities/pipes/date.pipe';

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

  public birthday = computed(() => {
    const [month, day] = (this.character.value()?.birthday ?? '').split('/').map(Number);
    return month && day ? new Date(2000, month - 1, day) : null;
  });

}
