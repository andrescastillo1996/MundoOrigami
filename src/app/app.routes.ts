import { Routes } from '@angular/router';
import { ROLES } from '@core/constantes/constantes';
import { authGuard } from '@core/guards/auth.guard'; // 👈 Nuevo guard
import { publicoGuard } from '@core/guards/publico.guard';

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
    canActivate: [publicoGuard], // 👈 aplicar guard aquí
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('@core/components/registro/registro.page').then(
        m => m.RegistroPage
      ),
    canActivate: [publicoGuard], // 👈 aplicar guard aquí también
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
    canActivate: [authGuard(ROLES.ADMINISTRADOR)],
  },
];
