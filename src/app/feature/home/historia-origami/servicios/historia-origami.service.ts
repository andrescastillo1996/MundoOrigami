import { inject, Injectable } from '@angular/core';
import { HistoriaOrigamiFirestoreAdapter } from '@core/adapters/historia-origami-firestore-adapter.service'; // <--- Ajusta esta ruta a donde tengas tu adapter
import { HistoriaOrigami } from '@core/models/historia-origami';


@Injectable({
  providedIn: 'root',
})
export class HistoriaOrigamiService {

  private historiaOrigamiAdapter = inject(HistoriaOrigamiFirestoreAdapter);

  /**
   * Recupera los ejemplos prácticos a través del adapter.
   * La lógica de acceso a datos y carga está encapsulada en el adapter.
   * @returns Una Promesa que se resuelve con un array de objetos HistoriaOrigami.
   */
  async getEjemplosPracticos(): Promise<HistoriaOrigami[]> {
    // Simplemente delegamos la llamada al adapter
    return this.historiaOrigamiAdapter.getEjemplosPracticos();
  }
}