import { Injectable, inject } from '@angular/core';
import { collection, collectionData, Firestore, query, where } from '@angular/fire/firestore';
import { PasoTutorial } from '../modelos/paso-tutorial';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PasoTutorialService {
  private firestore = inject(Firestore);

  getPasosPorCodigoTutorial(codigo: number): Observable<PasoTutorial[]> {
    const pasosRef = collection(this.firestore, 'pasos');
    const q = query(pasosRef, where('tutorialCodigo', '==', codigo));
    return collectionData(q) as Observable<PasoTutorial[]>;
  }
}
