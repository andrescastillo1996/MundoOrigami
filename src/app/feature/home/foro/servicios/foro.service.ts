// src/app/feature/home/foro/servicios/foro.service.ts
import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  query,
  orderBy,
  Timestamp
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Publicacion } from '../modelos/publicacion';
import { Comentario } from '../modelos/comentario';

@Injectable({
  providedIn: 'root'
})
export class ForoService {

  private readonly firestore = inject(Firestore);

  constructor() { }



  getPublicaciones(): Observable<Publicacion[]> {
    const publicacionesCollection = collection(this.firestore, 'publicaciones');
    const q = query(publicacionesCollection, orderBy('fechaCreacion', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Publicacion[]>;
  }

  getPublicacion(id: string): Observable<Publicacion | undefined> {
    const publicacionDocRef = doc(this.firestore, `publicaciones/${id}`);
    return docData(publicacionDocRef, { idField: 'id' }) as Observable<Publicacion | undefined>;
  }

  async addPublicacion(publicacion: Omit<Publicacion, 'id' | 'fechaCreacion'>): Promise<string> {
    const publicacionesCollection = collection(this.firestore, 'publicaciones');
    const docRef = await addDoc(publicacionesCollection, {
      ...publicacion,
      fechaCreacion: Timestamp.now()
    });
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  }



  getComentarios(publicacionId: string): Observable<Comentario[]> {
    const comentariosCollection = collection(this.firestore, `publicaciones/${publicacionId}/comentarios`);
    const q = query(comentariosCollection, orderBy('fechaCreacion', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<Comentario[]>;
  }

  async addComentario(publicacionId: string, comentario: Omit<Comentario, 'id' | 'fechaCreacion'>): Promise<string> {
    const comentariosCollection = collection(this.firestore, `publicaciones/${publicacionId}/comentarios`);
    const docRef = await addDoc(comentariosCollection, {
      ...comentario,
      fechaCreacion: Timestamp.now()
    });
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  }
}
