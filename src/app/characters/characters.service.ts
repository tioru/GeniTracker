import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Characters } from './characters';

@Injectable({ providedIn: 'root' })
export class CharactersService {

  private http = inject(HttpClient);

  public characters = toSignal(this.http.get<Characters[]>('assets/data/characters.json'), { initialValue: [] });
}
