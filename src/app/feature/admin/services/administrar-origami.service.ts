import { Injectable, inject } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { COLECCIONES } from '@core/constantes/constantes';
import { Origami } from '@core/models/origami';
import { PasoTutorial } from '@core/models/paso-tutorial';
import { firstValueFrom } from 'rxjs';
import { OrigamiEdicion } from '../models/origami-edicion';
import { LoaderService } from '@core/loader/loader.service';

@Injectable({
  providedIn: 'root',
})
export class AdministrarOrigamiService {
  private readonly firestore = inject(Firestore);
  private readonly loading = inject(LoaderService);

  /**
   * Crea un nuevo Origami y sus pasos. El código es el ID generado por Firebase.
   */
  async agregarOrigamiConPasos(
    origami: Omit<Origami, 'codigo'>,
    pasos: PasoTutorial[]
  ): Promise<void> {
    return this.loading.showWhileLoading(
      (async () => {
        const origamisRef = collection(this.firestore, COLECCIONES.ORIGAMIS);

        const origamiDocRef = await addDoc(origamisRef, {});
        const codigoGenerado = origamiDocRef.id;

        await updateDoc(origamiDocRef, {
          ...origami,
          codigo: codigoGenerado,
        });

        const pasosRef = collection(this.firestore, COLECCIONES.PASOS);
        const tareas = pasos.map(paso => {
          paso.tutorialCodigo = codigoGenerado;
          return addDoc(pasosRef, paso);
        });

        await Promise.all(tareas);
      })(),
      'Guardando origami...'
    );
  }

  /**
   * Retorna todos los origamis con sus pasos vinculados por `tutorialCodigo`.
   */
  async obtenerOrigamisConPasos(): Promise<OrigamiEdicion[]> {
    return this.loading.showWhileLoading(
      (async () => {
        const origamisRef = collection(this.firestore, COLECCIONES.ORIGAMIS);

        const origamis = (await firstValueFrom(
          collectionData(origamisRef, { idField: 'id' }) as any
        )) as Origami[];

        const resultado: OrigamiEdicion[] = [];

        for (const origami of origamis) {
          const pasosRef = collection(this.firestore, COLECCIONES.PASOS);
          const pasosQuery = query(
            pasosRef,
            where('tutorialCodigo', '==', origami.codigo)
          );
          const pasos = (await firstValueFrom(
            collectionData(pasosQuery)
          )) as PasoTutorial[];

          resultado.push({ origami, pasos });
        }

        return resultado;
      })(),
      'Cargando origamis...'
    );
  }

  /**
   * Actualiza un origami existente y reemplaza todos sus pasos.
   */
  async actualizarOrigamiConPasos(
    origami: Origami,
    pasos: PasoTutorial[]
  ): Promise<void> {
    return this.loading.showWhileLoading(
      (async () => {
        const origamiDocRef = doc(
          this.firestore,
          COLECCIONES.ORIGAMIS,
          origami.codigo.toString()
        );
        const pasosRef = collection(this.firestore, COLECCIONES.PASOS);
        const pasosQuery = query(
          pasosRef,
          where('tutorialCodigo', '==', origami.codigo)
        );

        await updateDoc(origamiDocRef, { ...origami });

        const snapshot = await getDocs(pasosQuery);
        const deletes = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
        await Promise.all(deletes);

        const nuevosPasos = pasos.map(paso => {
          paso.tutorialCodigo = origami.codigo;
          return addDoc(pasosRef, paso);
        });
        await Promise.all(nuevosPasos);
      })(),
      'Actualizando origami...'
    );
  }

  /**
   * Elimina un origami y sus pasos relacionados.
   */
  async eliminarOrigamiConPasos(codigo: string): Promise<void> {
    return this.loading.showWhileLoading(
      (async () => {
        const origamiDocRef = doc(this.firestore, COLECCIONES.ORIGAMIS, codigo);
        await deleteDoc(origamiDocRef);

        const pasosRef = collection(this.firestore, COLECCIONES.PASOS);
        const pasosQuery = query(
          pasosRef,
          where('tutorialCodigo', '==', codigo)
        );
        const snapshot = await getDocs(pasosQuery);
        const deletes = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
        await Promise.all(deletes);
      })(),
      'Eliminando origami...'
    );
  }
}
