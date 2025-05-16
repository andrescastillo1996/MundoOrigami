import { inject, Injectable } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Origami } from '../modelo/origami';

import { COLECCIONES } from '@core/constantes/constantes';

@Injectable()
export class OrigamiService {
  private firestore = inject(Firestore);

  getOrigamis(): Observable<Origami[]> {
    const origamiRef = collection(this.firestore, COLECCIONES.ORIGAMIS);
    return collectionData(origamiRef, { idField: 'id' }) as Observable<Origami[]>;
  }
}
