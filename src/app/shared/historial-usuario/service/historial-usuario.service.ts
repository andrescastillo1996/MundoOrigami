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
  getDocs,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { HistorialUsuario } from '../model/historial-usuario';
import { ESTADOS_TUTORIAL } from '@core/constantes/constantes';
import { LoaderService } from '@core/loader/loader.service';

@Injectable()
export class HistorialUsuarioService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private loading = inject(LoaderService);

  private historialRef = collection(this.firestore, 'historialUsuario');

  getHistorialPorTutorial(
    tutorialCodigo: string
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

  async iniciarTutorial(tutorialCodigo: string): Promise<void> {
    await this.loading.showWhileLoading(
      (async () => {
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
          if (data.estadoProceso !== ESTADOS_TUTORIAL.SIN_EMPEZAR) return;
        }

        await setDoc(docRef, {
          uid,
          tutorialCodigo,
          estadoProceso: ESTADOS_TUTORIAL.EN_EJECUCION,
          fechaInicio: new Date().toISOString(),
        });
      })(),
      'Iniciando tutorial...'
    );
  }

  // ✅ Cambiado de number → string
  async finalizarTutorial(tutorialCodigo: string): Promise<void> {
    await this.loading.showWhileLoading(
      (async () => {
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
      })(),
      'Finalizando tutorial...'
    );
  }

  async getHistorialDelUsuario(): Promise<HistorialUsuario[]> {
    return this.loading.showWhileLoading(
      (async () => {
        const uid = this.auth.currentUser?.uid;
        if (!uid) return [];

        const q = query(this.historialRef, where('uid', '==', uid));
        const querySnapshot = await getDocs(q);

        const historial: HistorialUsuario[] = [];
        querySnapshot.forEach(doc => {
          historial.push(doc.data() as HistorialUsuario);
        });

        return historial;
      })(),
      'Cargando historial...'
    );
  }
}
