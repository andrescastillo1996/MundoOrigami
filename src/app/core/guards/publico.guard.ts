import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from '@core/autenticacion/sesion.service';
import { ROLES, RUTAS } from '@core/constantes/constantes';

export const publicoGuard: CanActivateFn = () => {
  const router = inject(Router);
  const session = inject(SesionService);
  const usuario = session.obtener();

  if (usuario) {
    const rol = usuario.rol || [];
    if (rol.includes(ROLES.ADMINISTRADOR)) {
      router.navigateByUrl(RUTAS.ADMINISTRADOR);
    } else {
      router.navigateByUrl(RUTAS.HOME);
    }
    return false;
  }

  return true;
};
