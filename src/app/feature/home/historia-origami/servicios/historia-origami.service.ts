import { inject, Injectable } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { HistoriaOrigami } from '../modelos/historia-origami';
import { COLECCIONES } from '@core/constantes/constantes';

@Injectable()
export class HistoriaOrigamiService {
  private firestore = inject(Firestore);

  getEjemplosPracticos(): Observable<HistoriaOrigami[]> {
    const ejemplosRef = collection(
      this.firestore,
      COLECCIONES.EJEMPLOS_PRACTICOS
    );
    return collectionData(ejemplosRef, { idField: 'id' }) as Observable<
      HistoriaOrigami[]
    >;
  }
}
