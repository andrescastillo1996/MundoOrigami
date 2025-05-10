import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./app/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'registro',
    loadComponent: () => import('./app/registro/registro.page').then(m => m.RegistroPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.page').then(m => m.AdminPage),
    canActivate: [authGuard('admin')],
  }
];

