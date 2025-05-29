import { inject, Injectable } from '@angular/core';
import { FirebaseRegistroServiceAdapterService } from '@core/adapters/firebase-registro-service-adapter.service';
import { LoaderService } from '@core/loader/loader.service';

@Injectable({
  providedIn: 'root',
})
export class RegistroService {
  // Ya no inyectamos Auth ni Firestore directamente
  private readonly loading = inject(LoaderService);
  private readonly firebaseRegistroAdapter = inject(FirebaseRegistroServiceAdapterService); // Inyecta el nuevo adaptador

  async registrarUsuario(
    email: string,
    password: string,
    nombre: string
  ): Promise<void> {
    await this.loading.showWhileLoading(
      (async () => {
        // Usamos el adaptador para crear el usuario en Firebase Auth
        const cred = await this.firebaseRegistroAdapter.firebaseCreateUserWithEmailAndPassword(
          email,
          password
        );

        // Usamos el adaptador para guardar el documento del usuario en Firestore
        await this.firebaseRegistroAdapter.firebaseSetUserDocument(cred.user.uid, {
          uid: cred.user.uid,
          nombre,
          email,
          rol: ['usuario'],
          fechaCreacion: new Date().toString(), // Considera usar un Timestamp de Firestore para fechas
        });
      })(),
      'Registrando usuario...'
    );
  }
}