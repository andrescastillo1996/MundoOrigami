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

@Injectable({
  providedIn: 'root',
})
export class AdministrarOrigamiService {
  private readonly firestore = inject(Firestore);

  /**
   * Crea un nuevo Origami y sus pasos. El código es el ID generado por Firebase.
   */
  async agregarOrigamiConPasos(origami: Omit<Origami, 'codigo'>, pasos: PasoTutorial[]): Promise<void> {
    const origamisRef = collection(this.firestore, COLECCIONES.ORIGAMIS);

    // 1. Agregar el origami sin `codigo`, y obtener el ID generado
    const origamiDocRef = await addDoc(origamisRef, {}); // crea el doc vacío para obtener ID
    const codigoGenerado = origamiDocRef.id;

    // 2. Actualizar el documento con los datos y el código
    await updateDoc(origamiDocRef, {
      ...origami,
      codigo: codigoGenerado,
    });

    // 3. Agregar los pasos con el tutorialCodigo
    const pasosRef = collection(this.firestore, COLECCIONES.PASOS);
    const tareas = pasos.map((paso) => {
      paso.tutorialCodigo = codigoGenerado;
      return addDoc(pasosRef, paso);
    });

    await Promise.all(tareas);
  }

  /**
   * Retorna todos los origamis con sus pasos vinculados por `tutorialCodigo`.
   */
  async obtenerOrigamisConPasos(): Promise<OrigamiEdicion[]> {
    const origamisRef = collection(this.firestore, COLECCIONES.ORIGAMIS);

    const origamis = await firstValueFrom(
      collectionData(origamisRef, { idField: 'id' }) as any
    ) as Origami[];

    const resultado: OrigamiEdicion[] = [];

    for (const origami of origamis) {
      const pasosRef = collection(this.firestore, COLECCIONES.PASOS);
      const pasosQuery = query(pasosRef, where('tutorialCodigo', '==', origami.codigo));
      const pasos = await firstValueFrom(collectionData(pasosQuery)) as PasoTutorial[];

      resultado.push({ origami, pasos });
    }

    return resultado;
  }

  /**
   * Actualiza un origami existente y reemplaza todos sus pasos.
   */
  async actualizarOrigamiConPasos(origami: Origami, pasos: PasoTutorial[]): Promise<void> {
    const origamiDocRef = doc(this.firestore, COLECCIONES.ORIGAMIS, origami.codigo.toString());
    const pasosRef = collection(this.firestore, COLECCIONES.PASOS);
    const pasosQuery = query(pasosRef, where('tutorialCodigo', '==', origami.codigo));

    // 1. Actualizar los datos del origami
    await updateDoc(origamiDocRef, { ...origami });

    // 2. Eliminar los pasos anteriores
    const snapshot = await getDocs(pasosQuery);
    const deletes = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletes);

    // 3. Crear los nuevos pasos
    const nuevosPasos = pasos.map((paso) => {
      paso.tutorialCodigo = origami.codigo;
      return addDoc(pasosRef, paso);
    });
    await Promise.all(nuevosPasos);
  }


  async eliminarOrigamiConPasos(codigo: string): Promise<void> {
    // 1. Eliminar el documento del origami
    const origamiDocRef = doc(this.firestore, COLECCIONES.ORIGAMIS, codigo);
    await deleteDoc(origamiDocRef);
  
    // 2. Eliminar los pasos relacionados
    const pasosRef = collection(this.firestore, COLECCIONES.PASOS);
    const pasosQuery = query(pasosRef, where('tutorialCodigo', '==', codigo));
    const snapshot = await getDocs(pasosQuery);
    const deletes = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletes);
  }
  
}
