import { inject, Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { COLECCIONES, ROLES, RUTAS } from '@core/constantes/constantes';
import { MENSAJES_ERROR } from '@core/constantes/mensajes-error';
import { Usuario } from '@core/models/usuario.model';
import { SesionService } from './sesion.service';

@Injectable({ providedIn: 'root' })
export class AutenticacionService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);
  private readonly session = inject(SesionService);

  async iniciarSesion(correo: string, contrasena: string): Promise<void> {
    try {
      const credenciales = await signInWithEmailAndPassword(
        this.auth,
        correo,
        contrasena
      );
      const uid = credenciales.user.uid;

      const documento = await getDoc(
        doc(this.firestore, COLECCIONES.USUARIOS, uid)
      );
      if (!documento.exists())
        throw new Error(MENSAJES_ERROR.NO_SE_ENCONTRO_USUARIO);

      const usuario = documento.data() as Usuario;
      this.session.guardar(usuario);

      const rol = usuario.rol;
      this.router.navigateByUrl(
        rol.includes(ROLES.ADMINISTRADOR) ? RUTAS.ADMINISTRADOR : RUTAS.HOME
      );
    } catch (error: any) {
      throw new Error(error.message || 'Error desconocido al iniciar sesión');
    }
  }

  cerrarSesion(): void {
    this.auth.signOut();
    this.session.eliminar();
    this.router.navigateByUrl(RUTAS.LOGIN);
  }

  obtenerUsuario(): Usuario | null {
    return this.session.obtener();
  }
}
