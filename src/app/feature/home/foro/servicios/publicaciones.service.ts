// src/app/feature/foro/servicios/publicaciones.service.ts

import { inject, Injectable } from '@angular/core';
// ¡Importa Timestamp de @angular/fire/firestore!
import { Firestore, collection, collectionData, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, Timestamp } from '@angular/fire/firestore';
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
   * Obtiene todas las publicaciones ordenadas por fecha de creación descendente.
   */
  getPublicaciones(): Observable<Publicacion[]> {
    const q = query(this.publicacionesCollection, orderBy('fechaCreacion', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Publicacion[]>;
  }

  /**
   * Obtiene una publicación por su ID.
   * @param id El ID de la publicación.
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
   * Crea una nueva publicación en Firestore.
   * La fecha de creación se establece automáticamente como un Timestamp de Firebase.
   * @param publicacion Los datos de la publicación (excepto el ID y fechaCreacion).
   * @returns El ID de la publicación creada.
   */
  async crearPublicacion(publicacion: Omit<Publicacion, 'id' | 'fechaCreacion'>): Promise<string> {
    const nuevaPublicacion = {
      ...publicacion,
      fechaCreacion: Timestamp.now(), // <-- ¡Este es el cambio clave!
    };
    const docRef = await addDoc(this.publicacionesCollection, nuevaPublicacion);
    return docRef.id;
  }

  /**
   * Actualiza una publicación existente en Firestore.
   * @param publicacion La publicación con los datos actualizados (debe incluir el ID).
   */
  async actualizarPublicacion(publicacion: Publicacion): Promise<void> {
    if (!publicacion.id) {
      throw new Error('El ID de la publicación es necesario para actualizarla.');
    }
    const docRef = doc(this.firestore, COLECCIONES.PUBLICACIONES, publicacion.id);
    await updateDoc(docRef, { ...publicacion });
  }

  /**
   * Elimina una publicación de Firestore por su ID.
   * @param id El ID de la publicación a eliminar.
   */
  async eliminarPublicacion(id: string): Promise<void> {
    const docRef = doc(this.firestore, COLECCIONES.PUBLICACIONES, id);
    await deleteDoc(docRef);
  }
}
