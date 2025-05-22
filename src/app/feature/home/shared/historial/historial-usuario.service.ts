import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  doc,
  setDoc,
  updateDoc,
  getDoc,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { HistorialUsuario } from './modelo/historial-usuario';
import { ESTADOS_TUTORIAL } from '@core/constantes/constantes';

@Injectable()
export class HistorialUsuarioService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private historialRef = collection(this.firestore, 'historialUsuario');

  getHistorialPorTutorial(
    tutorialCodigo: number
  ): Observable<HistorialUsuario | undefined> {
    const uid = this.auth.currentUser?.uid;
    if (!uid)
      return new Observable<undefined>(observer => observer.next(undefined));

    const q = query(
      this.historialRef,
      where('uid', '==', uid),
      where('tutorialCodigo', '==', tutorialCodigo)
    );
    return collectionData(q).pipe(
      map(data => data[0] as HistorialUsuario | undefined)
    );
  }

  async iniciarTutorial(tutorialCodigo: number): Promise<void> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) return;

    const docRef = doc(
      this.firestore,
      'historialUsuario',
      `${uid}_${tutorialCodigo}`
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as HistorialUsuario;
      if (data.estadoProceso !== ESTADOS_TUTORIAL.SIN_EMPEZAR) return; // No sobrescribas si ya está iniciado
    }

    await setDoc(docRef, {
      uid,
      tutorialCodigo,
      estadoProceso: ESTADOS_TUTORIAL.EN_EJECUCION,
      fechaInicio: new Date().toISOString(),
    });
  }

  async finalizarTutorial(tutorialCodigo: number): Promise<void> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) return;

    const docRef = doc(
      this.firestore,
      'historialUsuario',
      `${uid}_${tutorialCodigo}`
    );
    await updateDoc(docRef, {
      estadoProceso: ESTADOS_TUTORIAL.FINALIZADO,
      fechaFin: new Date().toISOString(),
    });
  }

  getHistorialDelUsuario(): Observable<HistorialUsuario[]> {
    const uid = this.auth.currentUser?.uid;
    if (!uid)
      return new Observable<HistorialUsuario[]>(observer => observer.next([]));

    const q = query(this.historialRef, where('uid', '==', uid));
    return collectionData(q) as Observable<HistorialUsuario[]>;
  }
}
