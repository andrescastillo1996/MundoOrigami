// src/app/core/autenticacion/autenticacion.service.ts
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { COLECCIONES, ROLES, RUTAS } from '@core/constantes/constantes';
import { MENSAJES_ERROR } from '@core/constantes/mensajes-error';
import { Usuario } from '@core/models/usuario.model';
import { SesionService } from './sesion.service';
import { LoaderService } from '@core/loader/loader.service';
import { FirebaseAutenticacionServiceAdapterService } from '../adapters/firebase-autenticacion-service-adapter.service'; // Importa el nuevo servicio

@Injectable({ providedIn: 'root' })
export class AutenticacionService {
  private readonly router = inject(Router);
  private readonly session = inject(SesionService);
  private readonly loading = inject(LoaderService);
  private readonly firebaseAdapter = inject(FirebaseAutenticacionServiceAdapterService);

  async iniciarSesion(correo: string, contrasena: string): Promise<void> {
    await this.loading.showWhileLoading(
      (async () => {
        // Usamos el adaptador para las llamadas de Firebase
        const credenciales = await this.firebaseAdapter.firebaseSignInWithEmailAndPassword(correo, contrasena);
        const uid = credenciales.user.uid;

        const documento = await this.firebaseAdapter.firebaseGetUserDocument(uid);

        if (!documento.exists()) {
          throw new Error(MENSAJES_ERROR.NO_SE_ENCONTRO_USUARIO);
        }

        const usuario = documento.data() as Usuario;
        this.session.guardar(usuario);

        const rol = usuario.rol;
        this.router.navigateByUrl(
          rol.includes(ROLES.ADMINISTRADOR) ? RUTAS.ADMINISTRADOR : RUTAS.HOME
        );
      })(),
      'Iniciando sesión...'
    );
  }

  cerrarSesion(): void {
    this.firebaseAdapter.firebaseSignOut();
    this.session.eliminar();
    this.router.navigateByUrl(RUTAS.LOGIN);
  }

  obtenerUsuario(): Usuario | null {
    return this.session.obtener();
  }
}