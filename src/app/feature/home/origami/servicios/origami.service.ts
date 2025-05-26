import { inject, Injectable } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { Origami } from '@core/models/origami';

import { COLECCIONES } from '@core/constantes/constantes';
import { LoaderService } from '@core/loader/loader.service';

@Injectable()
export class OrigamiService {
  private firestore = inject(Firestore);
  private loading = inject(LoaderService);

  async getOrigamis(): Promise<Origami[]> {
    return this.loading.showWhileLoading(
      (async () => {
        const origamiRef = collection(this.firestore, COLECCIONES.ORIGAMIS);
        const origamis = await firstValueFrom(
          collectionData(origamiRef, { idField: 'id' })
        );
        return origamis as Origami[];
      })(),
      'Cargando origamis...'
    );
  }
}
