import { Injectable, inject } from '@angular/core';
import { Origami } from '@core/models/origami';
import { PasoTutorial } from '@core/models/paso-tutorial';
import { LoaderService } from '@core/loader/loader.service';
import { OrigamiEdicion } from '../models/origami-edicion';

// Importamos los adapters
import { OrigamiFirestoreAdapter } from '@core/adapters/origami-firestore-adapter.service';
import { PasoTutorialFirestoreAdapter } from '@core/adapters/paso-tutorial-firestore-adapter.service';

@Injectable({
  providedIn: 'root',
})
export class AdministrarOrigamiService {
  // Ya no inyectamos Firestore directamente en este servicio, ¡excelente!
  private readonly loading = inject(LoaderService);

  // Inyectamos los adapters
  private readonly origamiAdapter = inject(OrigamiFirestoreAdapter);
  private readonly pasoTutorialAdapter = inject(PasoTutorialFirestoreAdapter);

  /**
   * Crea un nuevo Origami y sus pasos. El código es el ID generado por Firebase.
   */
  async agregarOrigamiConPasos(
    origami: Omit<Origami, 'codigo'>,
    pasos: PasoTutorial[]
  ): Promise<void> {
    return this.loading.showWhileLoading(
      (async () => {
        // Usa el adapter para añadir el origami y obtener el código generado
        const codigoGenerado = await this.origamiAdapter.addOrigami(origami);

        // Actualiza el origami con el código generado (Firebase no permite setear el ID al añadir)
        await this.origamiAdapter.updateOrigami(codigoGenerado, { codigo: codigoGenerado });

        // Usa el adapter de pasos para añadir cada paso
        const tareas = pasos.map(paso => {
          paso.tutorialCodigo = codigoGenerado;
          return this.pasoTutorialAdapter.addPaso(paso);
        });

        await Promise.all(tareas);
      })(),
      'Guardando origami...'
    );
  }

  /**
   * Retorna todos los origamis con sus pasos vinculados por `tutorialCodigo`.
   */
  async obtenerOrigamisConPasos(): Promise<OrigamiEdicion[]> {
    return this.loading.showWhileLoading(
      (async () => {
        // Usa el adapter para obtener todos los origamis
        const origamis = await this.origamiAdapter.getAllOrigamis();

        const resultado: OrigamiEdicion[] = [];

        for (const origami of origamis) {
          // Usa el adapter para obtener los pasos de cada origami
          const pasos = await this.pasoTutorialAdapter.getPasosPorCodigoTutorial(origami.codigo);
          resultado.push({ origami, pasos });
        }

        return resultado;
      })(),
      'Cargando origamis...'
    );
  }

  /**
   * Actualiza un origami existente y reemplaza todos sus pasos.
   */
  async actualizarOrigamiConPasos(
    origami: Origami,
    pasos: PasoTutorial[]
  ): Promise<void> {
    return this.loading.showWhileLoading(
      (async () => {
        // Usa el adapter para actualizar el origami
        await this.origamiAdapter.updateOrigami(origami.codigo, origami);

        // Elimina los pasos existentes usando el adapter de pasos
        await this.pasoTutorialAdapter.deletePasosByTutorialCodigo(origami.codigo);

        // Añade los nuevos pasos usando el adapter de pasos
        const nuevosPasos = pasos.map(paso => {
          paso.tutorialCodigo = origami.codigo;
          return this.pasoTutorialAdapter.addPaso(paso);
        });
        await Promise.all(nuevosPasos);
      })(),
      'Actualizando origami...'
    );
  }

  /**
   * Elimina un origami y sus pasos relacionados.
   */
  async eliminarOrigamiConPasos(codigo: string): Promise<void> {
    return this.loading.showWhileLoading(
      (async () => {
        // Elimina el origami usando el adapter
        await this.origamiAdapter.deleteOrigami(codigo);

        // Elimina los pasos relacionados usando el adapter de pasos
        await this.pasoTutorialAdapter.deletePasosByTutorialCodigo(codigo);
      })(),
      'Eliminando origami...'
    );
  }
}