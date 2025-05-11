import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

/**
 * Guarda de rutas protegidas por autenticación y roles.
 * @param rolRequerido - Rol necesario para acceder (por ejemplo: 'admin', 'user').
 * @returns true si el usuario está autenticado y tiene el rol requerido, false si no.
 */
export const authGuard = (rolRequerido?: string): CanActivateFn => {
  return async () => {
    const auth = inject(Auth);
    const router = inject(Router);
    const firestore = inject(Firestore);

    const usuarioActual = auth.currentUser;

    console.log('Usuario actual:', usuarioActual);

    // 1. Redirige si no hay usuario autenticado
    if (!usuarioActual) {
      router.navigateByUrl('/login');
      return false;
    }

    // 2. Si no se requiere rol específico, permite el acceso
    if (!rolRequerido) return true;

    try {
      console.log('UID del usuario:', usuarioActual.uid);
      // 3. Buscar documento del usuario por su UID
      const refUsuario = doc(firestore, `usuarios/${usuarioActual.uid}`);
      const snapshot = await getDoc(refUsuario);
      const datosUsuario = snapshot.data();
      console.log('Datos del usuario:', datosUsuario);

      // 4. Validar rol
      const roles = datosUsuario?.['roles'] as string[] | undefined;

      if (roles?.includes(rolRequerido)) {
        return true;
      } else {
        router.navigateByUrl('/login');
        return false;
      }
    } catch (error) {
      console.error('Error al verificar roles del usuario:', error);
      router.navigateByUrl('/login');
      return false;
    }
  };
};
