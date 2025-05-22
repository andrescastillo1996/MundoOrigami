import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Tutorial } from '../modelos/tutorial';

@Injectable()
export class TutorialService {
  private firestore = inject(Firestore);

  getTutorialPorCodigo(codigo: number): Observable<Tutorial | undefined> {
    const tutorialsRef = collection(this.firestore, 'tutoriales');
    const q = query(tutorialsRef, where('codigo', '==', codigo));
    return collectionData(q).pipe(
      map(tutorials => tutorials[0] as Tutorial | undefined)
    );
  }
}
