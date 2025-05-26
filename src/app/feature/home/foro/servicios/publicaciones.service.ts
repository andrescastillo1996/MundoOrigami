import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Publicacion } from '../modelos/publicacion';
import { COLECCIONES } from '@core/constantes/constantes';

@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {
  private firestore = inject(Firestore);
  private publicacionesCollection = collection(this.firestore, COLECCIONES.PUBLICACIONES);

  /**

   */
  getPublicaciones(): Observable<Publicacion[]> {
    const q = query(this.publicacionesCollection, orderBy('fechaCreacion', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Publicacion[]>;
  }

  /**
   *
   * @param id
   */
  async getPublicacionById(id: string): Promise<Publicacion | undefined> {
    const docRef = doc(this.firestore, COLECCIONES.PUBLICACIONES, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Publicacion;
    } else {
      return undefined;
    }
  }

  /**

   * @param publicacion
   */
  async crearPublicacion(publicacion: Omit<Publicacion, 'id' | 'fechaCreacion'>): Promise<string> {
    const nuevaPublicacion = {
      ...publicacion,
      fechaCreacion: new Date(),
    };
    const docRef = await addDoc(this.publicacionesCollection, nuevaPublicacion);
    return docRef.id;
  }

  /**

   * @param publicacion
   */
  async actualizarPublicacion(publicacion: Publicacion): Promise<void> {
    if (!publicacion.id) {
      throw new Error('El ID de la publicación es necesario para actualizarla.');
    }
    const docRef = doc(this.firestore, COLECCIONES.PUBLICACIONES, publicacion.id);
    await updateDoc(docRef, { ...publicacion });
  }

  /**
   *
   * @param id
   */
  async eliminarPublicacion(id: string): Promise<void> {
    const docRef = doc(this.firestore, COLECCIONES.PUBLICACIONES, id);
    await deleteDoc(docRef);
  }
}
