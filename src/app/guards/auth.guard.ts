import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export const authGuard = (rolPermitido: string): CanActivateFn => {
  return async () => {
    const router = inject(Router);
    const auth = getAuth();

    return new Promise<boolean>((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const uid = user.uid;
          const firestore = getFirestore();
          const userDoc = await getDoc(doc(firestore, 'usuarios', uid));

          if (userDoc.exists()) {
            const rol = userDoc.data()['rol'];
            if (rol === rolPermitido) {
              resolve(true); // acceso permitido
            } else {
              router.navigate(['/home']);
              resolve(false); // no autorizado
            }
          } else {
            router.navigate(['/login']);
            resolve(false); // no existe documento
          }
        } else {
          router.navigate(['/login']);
          resolve(false); // no autenticado
        }
      });
    });
  };
};

