import { inject, Injectable } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { LiteCharacter } from './lite_character';
import { Character } from '../../utilities/models/character';

@Injectable({ providedIn: 'root' })
export class CharactersService {

  private http = inject(HttpClient);

  public characters = toSignal(this.http.get<LiteCharacter[]>('assets/data/characters.json'), { initialValue: [] });

  public findByName(name: string | undefined): LiteCharacter | undefined {
    return this.characters().find(character => character.name.en === name);
  }

  // Must be called from an injection context (component field or constructor)
  public characterResource(id: () => number | undefined, lang: () => string) {
    return httpResource<Character>(() => {
      const value = id();
      return value ? `assets/data/characters/${lang()}/${value}.json` : undefined;
    });
  }
}
