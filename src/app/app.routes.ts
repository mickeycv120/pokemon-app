import { Routes } from '@angular/router';
import { Board } from '../pages/board/board';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: Board,
  },
];
