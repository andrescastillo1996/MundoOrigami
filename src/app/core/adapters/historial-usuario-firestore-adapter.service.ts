import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  setDoc,
  updateDoc,
  query,
  where,
  getDoc, // Para getHistorialDoc
  getDocs,
} from '@angular/fire/firestore';
import { Observable, firstValueFrom, map } from 'rxjs';
import { COLECCIONES } from '@core/constantes/constantes'; // Asegúrate de la ruta correcta
import { HistorialUsuario } from '@shared/historial-usuario/model/historial-usuario';

@Injectable({
  providedIn: 'root',
})
export class HistorialUsuarioFirestoreAdapter {
  private readonly firestore = inject(Firestore);
  private readonly historialCollectionRef = collection(this.firestore, COLECCIONES.HISTORIAL_USUARIO);

  /**
   * Obtiene un documento de historial de usuario por su UID y código de tutorial.
   * Utiliza la ID del documento en el formato `uid_tutorialCodigo`.
   * @param docId El ID del documento (uid_tutorialCodigo).
   * @returns Un Observable de HistorialUsuario o undefined si no existe.
   */
  getHistorialDoc(docId: string): Promise<HistorialUsuario | undefined> {
    const docRef = doc(this.historialCollectionRef, docId);
    return getDoc(docRef).then(docSnap => {
      if (docSnap.exists()) {
        return docSnap.data() as HistorialUsuario;
      }
      return undefined;
    });
  }

  /**
   * Obtiene un Observable del historial de usuario para un tutorial y UID específicos.
   * @param uid El UID del usuario.
   * @param tutorialCodigo El código del tutorial.
   * @returns Un Observable de HistorialUsuario o undefined.
   */
  getHistorialPorTutorialObservable(uid: string, tutorialCodigo: string): Observable<HistorialUsuario | undefined> {
    const q = query(
      this.historialCollectionRef,
      where('uid', '==', uid),
      where('tutorialCodigo', '==', tutorialCodigo)
    );
    // collectionData con un pipe map para manejar el array resultante
    return collectionData(q, { idField: 'id' }).pipe(
      map(data => data[0] as HistorialUsuario | undefined)
    );
  }


  /**
   * Establece un documento de historial de usuario.
   * Usado para iniciar un nuevo registro o sobrescribir uno existente si el ID coincide.
   * @param docId El ID del documento (ej. `uid_tutorialCodigo`).
   * @param data Los datos del historial a guardar.
   */
  async setHistorial(docId: string, data: HistorialUsuario): Promise<void> {
    const docRef = doc(this.historialCollectionRef, docId);
    await setDoc(docRef, data);
  }

  /**
   * Actualiza un documento de historial de usuario existente.
   * @param docId El ID del documento a actualizar.
   * @param data Los datos parciales o completos para actualizar.
   */
  async updateHistorial(docId: string, data: Partial<HistorialUsuario>): Promise<void> {
    const docRef = doc(this.historialCollectionRef, docId);
    await updateDoc(docRef, data);
  }

  /**
   * Obtiene todos los documentos de historial para un UID específico.
   * @param uid El UID del usuario.
   * @returns Una promesa que resuelve con un array de HistorialUsuario.
   */
  async getHistorialByUid(uid: string): Promise<HistorialUsuario[]> {
    const q = query(this.historialCollectionRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    const historial: HistorialUsuario[] = [];
    querySnapshot.forEach(doc => {
      historial.push(doc.data() as HistorialUsuario);
    });
    return historial;
  }
}