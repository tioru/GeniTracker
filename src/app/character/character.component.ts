import { Component, computed, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { CharactersService } from '../characters/characters.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { httpResource } from '@angular/common/http';
import { Character } from './character';

@Component({
  imports: [],
  selector: 'app-character',
  styleUrl: './character.component.scss',
  templateUrl: './character.component.html',
})
export class CharacterComponent {
  private transloco = inject(TranslocoService);
  private charactersService = inject(CharactersService);

  private name = toSignal(inject(ActivatedRoute).paramMap.pipe(map(params => params.get('name'))));
  private lang = toSignal(this.transloco.langChanges$, { initialValue: this.transloco.getActiveLang() });


  public entry = computed(() => this.charactersService.characters().find(c => c.name.en === this.name()));
  public id = computed(() => this.entry()?.id);

  public character = httpResource<Character>(() => {
    const id = this.id();
    return id ? `assets/data/characters/${this.lang()}/${id}.json` : undefined;
  });
}
