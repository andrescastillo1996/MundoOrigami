import { Injectable, inject } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs'; // Mantenemos Observable
import { Comentario } from '../modelos/comentario.model';
import { Publicacion } from '../modelos/publicacion.model';
import { SesionService } from '@core/autenticacion/sesion.service';
import { LoaderService } from '@core/loader/loader.service'; // Inyectamos LoaderService

// Importamos el nuevo adapter
import { ForoFirestoreAdapter } from '@core/adapters/foro-firestore-adapter.service';

@Injectable({ providedIn: 'root' })
export class ForoService {
  // Ya no inyectamos Firestore directamente
  private loader = inject(LoaderService);
  private readonly sesionService = inject(SesionService);

  // Inyectamos el nuevo adapter
  private readonly foroFirestoreAdapter = inject(ForoFirestoreAdapter);

  getPublicaciones(): Observable<Publicacion[]> {
    return this.foroFirestoreAdapter.getPublicaciones();
  }

  getPublicacionPorId(id: string): Observable<Publicacion> {
    return this.foroFirestoreAdapter.getPublicacionPorId(id);
  }

  async crearPublicacion(data: Publicacion): Promise<void> {
    const usuario = this.sesionService.obtener();
    if (!usuario) {
      throw new Error('No se pudo obtener el usuario de la sesión.');
    }
    data.autor = usuario;
    return this.loader.showWhileLoading(
      this.foroFirestoreAdapter.crearPublicacion(data),
      'Guardando publicación...'
    );
  }

  async actualizarPublicacion(id: string, data: Partial<Publicacion>): Promise<void> {
    return this.loader.showWhileLoading(
      this.foroFirestoreAdapter.actualizarPublicacion(id, data),
      'Actualizando publicación...'
    );
  }

  async eliminarPublicacion(id: string): Promise<void> {
    return this.loader.showWhileLoading(
      this.foroFirestoreAdapter.eliminarPublicacion(id),
      'Eliminando publicación...'
    );
  }

  async getComentarios(publicacionId: string): Promise<Comentario[]> {
    return this.loader.showWhileLoading(
      this.foroFirestoreAdapter.getComentarios(publicacionId),
      'Cargando comentarios...'
    );
  }

  async agregarComentario(idPublicacion: string, comentario: Comentario): Promise<void> {
    const usuario = this.sesionService.obtener();
    if (!usuario) {
      throw new Error('No se pudo obtener el usuario de la sesión.');
    }
    comentario.autor = usuario;
    return this.loader.showWhileLoading(
      this.foroFirestoreAdapter.agregarComentarioToArray(idPublicacion, comentario),
      'Agregando comentario...'
    );
  }

  async eliminarComentario(idPublicacion: string, comentario: Comentario): Promise<void> {
    return this.loader.showWhileLoading(
      this.foroFirestoreAdapter.eliminarComentarioFromArray(idPublicacion, comentario),
      'Eliminando comentario...'
    );
  }

  async toggleReaccion(id: string, tipo: 'meGusta' | 'noMeGusta'): Promise<void> {
    const uid = this.sesionService.obtener()?.uid || '';
    // Obtener la publicación actual para manejar las reacciones localmente
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
    } else { // tipo === 'noMeGusta'
      if (estaEnDislikes) {
        dislikes.splice(dislikes.indexOf(uid), 1); // Quitar no me gusta
      } else {
        dislikes.push(uid); // Agregar no me gusta
        if (estaEnLikes) {
          likes.splice(likes.indexOf(uid), 1); // Quitar me gusta si estaba
        }
      }
    }

    // Usar el adapter para actualizar las reacciones
    return this.foroFirestoreAdapter.updateReacciones(id, likes, dislikes);
  }
}