import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { HistorialUsuario } from '../model/historial-usuario';
import { ESTADOS_TUTORIAL } from '@core/constantes/constantes';
import { LoaderService } from '@core/loader/loader.service';


import { HistorialUsuarioFirestoreAdapter } from '@core/adapters/historial-usuario-firestore-adapter.service';

@Injectable({
  providedIn: 'root', // Ahora el servicio es un singleton, lo cual es más común
})
export class HistorialUsuarioService {
  // Ya no inyectamos Firestore directamente
  private auth = inject(Auth);
  private loading = inject(LoaderService);

  // Inyectamos el nuevo adapter
  private readonly historialAdapter = inject(HistorialUsuarioFirestoreAdapter);

  getHistorialPorTutorial(
    tutorialCodigo: string
  ): Observable<HistorialUsuario | undefined> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) {
      // Si no hay UID, devolvemos un observable que emite undefined y completa
      return new Observable<undefined>(observer => {
        observer.next(undefined);
        observer.complete();
      });
    }

    return this.historialAdapter.getHistorialPorTutorialObservable(uid, tutorialCodigo);
  }

  async iniciarTutorial(tutorialCodigo: string): Promise<void> {
    await this.loading.showWhileLoading(
      (async () => {
        const uid = this.auth.currentUser?.uid;
        if (!uid) return; // No hacer nada si no hay UID

        const docId = `${uid}_${tutorialCodigo}`;
        const historialExistente = await this.historialAdapter.getHistorialDoc(docId);

        // Si ya existe y no está SIN_EMPEZAR, no hacemos nada
        if (historialExistente && historialExistente.estadoProceso !== ESTADOS_TUTORIAL.SIN_EMPEZAR) {
          return;
        }

        // Si no existe o está SIN_EMPEZAR, lo creamos/actualizamos a EN_EJECUCION
        await this.historialAdapter.setHistorial(docId, {
          uid,
          tutorialCodigo,
          estadoProceso: ESTADOS_TUTORIAL.EN_EJECUCION,
          fechaInicio: new Date().toISOString(),
        });
      })(),
      'Iniciando tutorial...'
    );
  }

  async finalizarTutorial(tutorialCodigo: string): Promise<void> {
    await this.loading.showWhileLoading(
      (async () => {
        const uid = this.auth.currentUser?.uid;
        if (!uid) return; // No hacer nada si no hay UID

        const docId = `${uid}_${tutorialCodigo}`;
        await this.historialAdapter.updateHistorial(docId, {
          estadoProceso: ESTADOS_TUTORIAL.FINALIZADO,
          fechaFin: new Date().toISOString(),
        });
      })(),
      'Finalizando tutorial...'
    );
  }

  async getHistorialDelUsuario(): Promise<HistorialUsuario[]> {
    return this.loading.showWhileLoading(
      (async () => {
        const uid = this.auth.currentUser?.uid;
        if (!uid) return []; // Si no hay UID, retorna un array vacío

        return this.historialAdapter.getHistorialByUid(uid);
      })(),
      'Cargando historial...'
    );
  }
}