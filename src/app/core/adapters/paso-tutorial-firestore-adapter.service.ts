import { Injectable, inject } from '@angular/core';
import {
  collection,
  collectionData,
  Firestore,
  query,
  where,
  addDoc,   // Importación necesaria para addPaso
  getDocs,  // Importación necesaria para deletePasosByTutorialCodigo
  deleteDoc // Importación necesaria para deletePasosByTutorialCodigo
} from '@angular/fire/firestore';
import { PasoTutorial } from '@core/models/paso-tutorial';
import { firstValueFrom } from 'rxjs';
import { COLECCIONES } from '@core/constantes/constantes'; // Asegúrate de que esta ruta sea correcta

@Injectable({
  providedIn: 'root',
})
export class PasoTutorialFirestoreAdapter {
  private firestore = inject(Firestore);
  // Usa la referencia de la colección centralizada para los pasos
  private readonly pasosCollectionRef = collection(this.firestore, COLECCIONES.PASOS);

  constructor() {}

  /**
   * Obtiene los pasos de un tutorial desde Firestore basándose en su código.
   * @param tutorialCodigo El código del tutorial.
   * @returns Una promesa que resuelve con un array de PasoTutorial.
   */
  async getPasosPorCodigoTutorial(
    tutorialCodigo: string
  ): Promise<PasoTutorial[]> {
    const q = query(this.pasosCollectionRef, where('tutorialCodigo', '==', tutorialCodigo));
    const pasos = await firstValueFrom(collectionData(q));
    return pasos as PasoTutorial[];
  }

  /**
   * Añade un nuevo paso tutorial a Firestore.
   * @param pasoData Los datos del paso a añadir.
   */
  async addPaso(pasoData: PasoTutorial): Promise<void> {
    await addDoc(this.pasosCollectionRef, pasoData);
  }

  /**
   * Elimina todos los pasos tutoriales asociados a un código de tutorial específico.
   * @param tutorialCodigo El código del tutorial cuyos pasos se van a eliminar.
   */
  async deletePasosByTutorialCodigo(tutorialCodigo: string): Promise<void> {
    const q = query(
      this.pasosCollectionRef,
      where('tutorialCodigo', '==', tutorialCodigo)
    );
    const snapshot = await getDocs(q); // Obtiene todos los documentos que coinciden
    const deletes = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref)); // Crea una promesa para cada eliminación
    await Promise.all(deletes); // Espera a que todas las eliminaciones se completen
  }
}