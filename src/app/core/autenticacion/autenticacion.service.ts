import { inject, Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { COLECCIONES, RUTAS } from '@shared/constantes/constantes';
import { MENSAJES_ERROR } from '@shared/constantes/mensajes-error';

@Injectable({
  providedIn: 'root',
})
export class AutenticacionService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);

  async iniciarSesion(correo: string, contrasena: string): Promise<void> {
    try {
      const credenciales = await signInWithEmailAndPassword(
        this.auth,
        correo,
        contrasena
      );

      const uid = credenciales.user.uid;
      const documentoUsuario = await getDoc(
        doc(this.firestore, COLECCIONES.USUARIOS, uid)
      );

      if (!documentoUsuario.exists()) {
        throw new Error(MENSAJES_ERROR.NO_SE_ENCONTRO_USUARIO);
      }

      const datos = documentoUsuario.data();
      const rol = datos?.['rol'] || 'usuario';

      // Navegación por rol
      if (rol === 'admin') {
        this.router.navigateByUrl(RUTAS.ADMINISTRADOR);
      } else {
        this.router.navigateByUrl('/home');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error desconocido al iniciar sesión');
    }
  }
}
