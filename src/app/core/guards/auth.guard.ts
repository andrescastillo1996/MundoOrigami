import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from '@core/autenticacion/sesion.service';
import { RUTAS } from '@core/constantes/constantes';

export const authGuard = (rolRequerido?: string): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const session = inject(SesionService);

    const usuario = session.obtener();
    if (!usuario) {
      router.navigateByUrl(RUTAS.LOGIN);
      return false;
    }

    if (!rolRequerido || usuario.rol?.includes(rolRequerido)) {
      return true;
    }

    router.navigateByUrl(RUTAS.LOGIN);
    return false;
  };
};
