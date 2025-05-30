import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { Origami } from '@core/models/origami'; // Assuming this path
import { COLECCIONES } from '@core/constantes/constantes'; // Assuming this path
import { LoaderService } from '@core/loader/loader.service'; // Assuming this path

@Injectable({
  providedIn: 'root',
})
export class OrigamiFirestoreAdapter {
  private readonly firestore = inject(Firestore);
  private readonly loading = inject(LoaderService);
  private readonly origamisCollectionRef = collection(
    this.firestore,
    COLECCIONES.ORIGAMIS
  );

  /**
   * Retrieves all Origami documents from Firestore.
   * Integrates LoaderService for automatic loading indication.
   * @returns A Promise that resolves with an array of Origami objects.
   */
  async getAllOrigamis(): Promise<Origami[]> {
    return this.loading.showWhileLoading(
      (async () => {
        const origamis = await firstValueFrom(
          collectionData(this.origamisCollectionRef, { idField: 'id' })
        );
        return origamis as Origami[];
      })(),
      'Cargando origamis...'
    );
  }
}
