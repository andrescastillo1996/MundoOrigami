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
  query
} from '@angular/fire/firestore';
import { LoaderService } from '@core/loader/loader.service';
import { firstValueFrom, Observable } from 'rxjs';
import { Comentario } from '../modelos/comentario.model';
import { Publicacion } from '../modelos/publicacion.model';
import { SesionService } from '@core/autenticacion/sesion.service';

@Injectable({ providedIn: 'root' })
export class ForoService {
  private firestore = inject(Firestore);
  private loader = inject(LoaderService);
  private readonly sesionService = inject(SesionService);

  private publicacionesRef = collection(this.firestore, 'publicaciones');

  getPublicaciones(): Observable<Publicacion[]> {
    return collectionData(this.publicacionesRef, {
      idField: 'id',
    }) as Observable<Publicacion[]>;
  }

  getPublicacionPorId(id: string): Observable<Publicacion> {
    const ref = doc(this.firestore, `publicaciones/${id}`);
    return docData(ref, { idField: 'id' }) as Observable<Publicacion>;
  }

  crearPublicacion(data: Publicacion): Promise<void> {
    const usuario = this.sesionService.obtener();
    if (!usuario) {
      throw new Error('No se pudo obtener el usuario de la sesión.');
    }
    data.autor = usuario; // As
    const ref = doc(this.publicacionesRef); // Crea con ID automático
    return this.loader.showWhileLoading(
      setDoc(ref, data),
      'Guardando publicación...'
    );
  }

  actualizarPublicacion(id: string, data: Partial<Publicacion>): Promise<void> {
    const ref = doc(this.firestore, `publicaciones/${id}`);
    return this.loader.showWhileLoading(
      updateDoc(ref, data),
      'Actualizando publicación...'
    );
  }

  eliminarPublicacion(id: string): Promise<void> {
    const ref = doc(this.firestore, `publicaciones/${id}`);
    return this.loader.showWhileLoading(
      deleteDoc(ref),
      'Eliminando publicación...'
    );
  }

  getComentarios(publicacionId: string): Promise<Comentario[]> {
    const comentariosRef = collection(
      this.firestore,
      `publicaciones/${publicacionId}/comentarios`
    );
    const q = query(comentariosRef, orderBy('fecha', 'asc'));
    const obs$ = collectionData(q, { idField: 'id' }) as any;
    return this.loader.showWhileLoading(
      firstValueFrom(obs$),
      'Cargando comentarios...'
    );
  }

  agregarComentario(
    idPublicacion: string,
    comentario: Comentario
  ): Promise<void> {
    const usuario = this.sesionService.obtener();
    if (!usuario) {
      throw new Error('No se pudo obtener el usuario de la sesión.');
    }
    comentario.autor = usuario; // Asignar el autor del comentario
    const ref = doc(this.firestore, `publicaciones/${idPublicacion}`);
    return this.loader.showWhileLoading(
      updateDoc(ref, {
        comentarios: arrayUnion(comentario),
      }),
      'Agregando comentario...'
    );
  }

  eliminarComentario(
    idPublicacion: string,
    comentario: Comentario
  ): Promise<void> {
    const ref = doc(this.firestore, `publicaciones/${idPublicacion}`);
    return this.loader.showWhileLoading(
      updateDoc(ref, {
        comentarios: arrayRemove(comentario),
      }),
      'Eliminando comentario...'
    );
  }

  async toggleReaccion(
    id: string,
    tipo: 'meGusta' | 'noMeGusta'
  ): Promise<void> {
    const uid = this.sesionService.obtener()?.uid || '';
    const ref = doc(this.firestore, `publicaciones/${id}`);
    const publicacion = await firstValueFrom(this.getPublicacionPorId(id));

    const likes = [...(publicacion.likes || [])];
    const dislikes = [...(publicacion.dislikes || [])];

    const estaEnLikes = likes.includes(uid);
    const estaEnDislikes = dislikes.includes(uid);

    if (tipo === 'meGusta') {
      if (estaEnLikes) {
        likes.splice(likes.indexOf(uid), 1); // Quitar me gusta
      } else {
        likes.push(uid); // Agregar me gusta
        if (estaEnDislikes) {
          dislikes.splice(dislikes.indexOf(uid), 1); // Quitar no me gusta si estaba
        }
      }
    } else {
      if (estaEnDislikes) {
        dislikes.splice(dislikes.indexOf(uid), 1); // Quitar no me gusta
      } else {
        dislikes.push(uid); // Agregar no me gusta
        if (estaEnLikes) {
          likes.splice(likes.indexOf(uid), 1); // Quitar me gusta si estaba
        }
      }
    }

    return updateDoc(ref, { likes, dislikes });
  }
}
