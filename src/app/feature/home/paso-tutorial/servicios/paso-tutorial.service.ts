import { Injectable, inject } from '@angular/core';
import {
  collection,
  collectionData,
  Firestore,
  query,
  where,
} from '@angular/fire/firestore';
import { LoaderService } from '@core/loader/loader.service';
import { PasoTutorial } from '@core/models/paso-tutorial';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PasoTutorialService {
  private firestore = inject(Firestore);
  private loading = inject(LoaderService);

  async getPasosPorCodigoTutorial(codigo: number): Promise<PasoTutorial[]> {
    return this.loading.showWhileLoading(
      (async () => {
        const pasosRef = collection(this.firestore, 'pasos');
        const q = query(pasosRef, where('tutorialCodigo', '==', codigo));
        const pasos = await firstValueFrom(collectionData(q));
        return pasos as PasoTutorial[];
      })(),
      'Cargando pasos...'
    );
  }
}
