import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Character } from './character';

@Injectable({ providedIn: 'root' })
export class CharactersService {

  private http = inject(HttpClient);

  public characters = toSignal(this.http.get<Character[]>('assets/data/characters.json'), { initialValue: [] });
}
