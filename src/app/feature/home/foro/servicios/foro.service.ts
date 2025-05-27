import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, collectionGroup } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable()
export class ForoService {
  private firestore = inject(Firestore);

  getPublicaciones(): Observable<any[]> {
    const publicacionesRef = collection(this.firestore, 'publicaciones');
    return collectionData(publicacionesRef, { idField: 'id' });
  }

  agregarPublicacion(contenido: string): Promise<void> {
    const publicacionesRef = collection(this.firestore, 'publicaciones');
    return addDoc(publicacionesRef, {
      contenido,
      autor: 'UsuarioEjemplo',
      fechaCreacion: new Date()
    }).then(() => {});
  }

  getComentarios(publicacionId: string): Observable<any[]> {
    const comentariosRef = collection(this.firestore, `publicaciones/${publicacionId}/comentarios`);
    return collectionData(comentariosRef, { idField: 'id' });
  }

  agregarComentario(publicacionId: string, contenido: string): Promise<void> {
    const comentariosRef = collection(this.firestore, `publicaciones/${publicacionId}/comentarios`);
    return addDoc(comentariosRef, {
      contenido,
      autor: 'UsuarioEjemplo',
      fechaCreacion: new Date()
    }).then(() => {});
  }
}
