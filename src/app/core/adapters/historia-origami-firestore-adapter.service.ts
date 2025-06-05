import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { COLECCIONES } from '@core/constantes/constantes'; // Asegúrate de que la ruta sea correcta
import { LoaderService } from '@core/loader/loader.service'; // Asegúrate de que la ruta sea correcta
import { HistoriaOrigami } from '@core/models/historia-origami';

@Injectable({
  providedIn: 'root',
})
export class HistoriaOrigamiFirestoreAdapter {
  private readonly firestore = inject(Firestore);
  private readonly loading = inject(LoaderService);
  private readonly ejemplosPracticosCollectionRef = collection(
    this.firestore,
    COLECCIONES.EJEMPLOS_PRACTICOS
  );

  /**
   * Recupera todos los documentos de ejemplos prácticos de Firestore.
   * Integra LoaderService para una indicación automática de carga.
   * @returns Una Promesa que se resuelve con un array de objetos HistoriaOrigami.
   */
  async getEjemplosPracticos(): Promise<HistoriaOrigami[]> {
    return this.loading.showWhileLoading(
      (async () => {
        const ejemplos = await firstValueFrom(
          collectionData(this.ejemplosPracticosCollectionRef, { idField: 'id' })
        );
        return ejemplos as HistoriaOrigami[];
      })(),
      'Cargando ejemplos prácticos...'
    );
  }
}