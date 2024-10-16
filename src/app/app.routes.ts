import { Routes } from '@angular/router';
import { CharactersComponent } from './characters/characters.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    {
      path: '',
      component: HomeComponent,
    },
    {
      path: 'characters',
      component: CharactersComponent,
    }
]