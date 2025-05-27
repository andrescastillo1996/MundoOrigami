import { Usuario } from '@core/models/usuario.model';
import { Comentario } from './comentario.model';

export interface Publicacion {
  id: string;
  titulo: string;
  descripcion: string;
  url: string;
  autor?: Usuario;
  fechaCreacion: Date;
  likes: string[]; // IDs de usuario
  dislikes: string[];
  comentarios?: Comentario[]; // Array de comentarios asociados a la publicación
}
