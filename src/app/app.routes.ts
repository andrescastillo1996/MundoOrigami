import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@core/components/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('@core/components/registro/registro.page').then(
        m => m.RegistroPage
      ),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('@feature/home/home.page').then(m => m.HomePage),
    canActivate: [authGuard()],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('@feature/admin/admin.page').then(m => m.AdminPage),
    canActivate: [authGuard('administrador')],
  },
];
