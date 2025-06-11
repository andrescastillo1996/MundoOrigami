import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  orderBy,
  query,
} from '@angular/fire/firestore';
import { firstValueFrom, Observable } from 'rxjs';
import { Publicacion } from '@feature/home/foro/modelos/publicacion.model'; // Asegúrate de que esta ruta sea correcta
import { Comentario } from '@feature/home/foro/modelos/comentario.model'; // Asegúrate de que esta ruta sea correcta

@Injectable({
  providedIn: 'root',
})
export class ForoFirestoreAdapter {
  private readonly firestore = inject(Firestore);
  private readonly publicacionesCollectionRef = collection(this.firestore, 'publicaciones');

  /**
   * Obtiene todas las publicaciones de la colección 'publicaciones'.
   * @returns Un Observable de un array de Publicacion.
   */
  getPublicaciones(): Observable<Publicacion[]> {
    return collectionData(this.publicacionesCollectionRef, {
      idField: 'id',
    }) as Observable<Publicacion[]>;
  }

  /**
   * Obtiene una publicación por su ID.
   * @param id El ID de la publicación.
   * @returns Un Observable de la Publicacion.
   */
  getPublicacionPorId(id: string): Observable<Publicacion> {
    const ref = doc(this.firestore, `publicaciones/${id}`);
    return docData(ref, { idField: 'id' }) as Observable<Publicacion>;
  }

  /**
   * Crea una nueva publicación en Firestore.
   * Genera un ID automático para el documento.
   * @param data Los datos de la publicación.
   * @returns Una promesa que resuelve cuando la publicación ha sido creada.
   */
  async crearPublicacion(data: Publicacion): Promise<void> {
    const ref = doc(this.publicacionesCollectionRef); // Crea con ID automático
    // Aseguramos que el ID del documento sea el mismo que el idField
    const publicacionConId = { ...data, id: ref.id };
    await setDoc(ref, publicacionConId);
  }

  /**
   * Actualiza una publicación existente.
   * @param id El ID de la publicación a actualizar.
   * @param data Los datos parciales o completos para actualizar la publicación.
   * @returns Una promesa que resuelve cuando la publicación ha sido actualizada.
   */
  async actualizarPublicacion(id: string, data: Partial<Publicacion>): Promise<void> {
    const ref = doc(this.firestore, `publicaciones/${id}`);
    await updateDoc(ref, data);
  }

  /**
   * Elimina una publicación por su ID.
   * @param id El ID de la publicación a eliminar.
   * @returns Una promesa que resuelve cuando la publicación ha sido eliminada.
   */
  async eliminarPublicacion(id: string): Promise<void> {
    const ref = doc(this.firestore, `publicaciones/${id}`);
    await deleteDoc(ref);
  }

  /**
   * Obtiene los comentarios de una publicación específica.
   * @param publicacionId El ID de la publicación.
   * @returns Una promesa que resuelve con un array de Comentario.
   */
  async getComentarios(publicacionId: string): Promise<Comentario[]> {
    const comentariosRef = collection(this.firestore, `publicaciones/${publicacionId}/comentarios`);
    const q = query(comentariosRef, orderBy('fecha', 'asc'));
    const obs$ = collectionData(q, { idField: 'id' }) as Observable<Comentario[]>;
    return firstValueFrom(obs$);
  }

  /**
   * Añade un comentario a un array de comentarios dentro de una publicación.
   * @param publicacionId El ID de la publicación a la que se añadirá el comentario.
   * @param comentario Los datos del comentario a añadir.
   * @returns Una promesa que resuelve cuando el comentario ha sido añadido.
   */
  async agregarComentarioToArray(publicacionId: string, comentario: Comentario): Promise<void> {
    const ref = doc(this.firestore, `publicaciones/${publicacionId}`);
    await updateDoc(ref, {
      comentarios: arrayUnion(comentario),
    });
  }

  /**
   * Elimina un comentario de un array de comentarios dentro de una publicación.
   * @param publicacionId El ID de la publicación del comentario.
   * @param comentario El comentario a eliminar (Firestore lo compara por valor).
   * @returns Una promesa que resuelve cuando el comentario ha sido eliminado.
   */
  async eliminarComentarioFromArray(publicacionId: string, comentario: Comentario): Promise<void> {
    const ref = doc(this.firestore, `publicaciones/${publicacionId}`);
    await updateDoc(ref, {
      comentarios: arrayRemove(comentario),
    });
  }

  /**
   * Actualiza los arrays de 'likes' y 'dislikes' de una publicación.
   * @param publicacionId El ID de la publicación.
   * @param likes Array de UIDs de usuarios que dieron 'me gusta'.
   * @param dislikes Array de UIDs de usuarios que dieron 'no me gusta'.
   * @returns Una promesa que resuelve cuando las reacciones han sido actualizadas.
   */
  async updateReacciones(publicacionId: string, likes: string[], dislikes: string[]): Promise<void> {
    const ref = doc(this.firestore, `publicaciones/${publicacionId}`);
    await updateDoc(ref, { likes, dislikes });
  }
}