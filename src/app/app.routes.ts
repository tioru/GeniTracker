import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'characters',
    loadComponent: () => import('./characters/characters.component').then((m) => m.CharactersComponent),
  }
]