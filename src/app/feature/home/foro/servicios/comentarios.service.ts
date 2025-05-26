import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Comentario } from '../modelos/comentario';
import { COLECCIONES } from '@core/constantes/constantes';

@Injectable({
  providedIn: 'root'
})
export class ComentariosService {
  private firestore = inject(Firestore);

  /**

   * @param publicacionId
   */
  getComentariosDePublicacion(publicacionId: string): Observable<Comentario[]> {
    const comentariosCollection = collection(this.firestore, COLECCIONES.PUBLICACIONES, publicacionId, COLECCIONES.COMENTARIOS);
    const q = query(comentariosCollection, orderBy('fechaCreacion', 'asc')); // Order comments chronologically
    return collectionData(q, { idField: 'id' }) as Observable<Comentario[]>;
  }

  /**
  .
   * @param publicacionId
   * @param comentario
   */
  async agregarComentario(publicacionId: string, comentario: Omit<Comentario, 'id' | 'fechaCreacion'>): Promise<string> {
    const comentariosCollection = collection(this.firestore, COLECCIONES.PUBLICACIONES, publicacionId, COLECCIONES.COMENTARIOS);
    const nuevoComentario = {
      ...comentario,
      fechaCreacion: new Date(),
    };
    const docRef = await addDoc(comentariosCollection, nuevoComentario);
    return docRef.id;
  }

}
