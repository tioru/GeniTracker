import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CharactersComponent } from './characters/characters.component';

export const routes: Routes = [
    {
      path: '',
      component: AppComponent,
    },
    {
      path: 'characters',
      component: CharactersComponent,
    }
]