import { Usuario } from '@core/models/usuario.model';

export interface Comentario {
  id: string;
  publicacionId: string;
  texto: string;
  autor?: Usuario;
  fecha: Date;
}
