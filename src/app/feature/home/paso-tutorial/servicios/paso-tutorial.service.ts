import { Injectable, inject } from '@angular/core';

import { LoaderService } from '@core/loader/loader.service';
import { PasoTutorial } from '@core/models/paso-tutorial';

import { PasoTutorialFirestoreAdapter } from '@core/adapters/paso-tutorial-firestore-adapter.service';

@Injectable({
  providedIn: 'root',
})
export class PasoTutorialService {
  private loading = inject(LoaderService);
  private pasoTutorialAdapter = inject(PasoTutorialFirestoreAdapter);

  async getPasosPorCodigoTutorial(codigo: string): Promise<PasoTutorial[]> {
    return this.loading.showWhileLoading(
      this.pasoTutorialAdapter.getPasosPorCodigoTutorial(codigo),
      'Cargando pasos...'
    );
  }
}
