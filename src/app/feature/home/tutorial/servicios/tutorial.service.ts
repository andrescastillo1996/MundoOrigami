import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
} from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { Tutorial } from '../modelos/tutorial';
import { LoaderService } from '@core/loader/loader.service';

@Injectable()
export class TutorialService {
  private firestore = inject(Firestore);
  private loading = inject(LoaderService);

 async getTutorialPorCodigo(codigo: string): Promise<Tutorial | undefined> {
  return this.loading.showWhileLoading(
    (async () => {
      const tutorialsRef = collection(this.firestore, 'tutoriales');
      const q = query(tutorialsRef, where('codigo', '==', codigo));
      const tutorials = await firstValueFrom(collectionData(q));
      return tutorials[0] as Tutorial | undefined;
    })(),
    'Cargando tutorial...'
  );
}

}
