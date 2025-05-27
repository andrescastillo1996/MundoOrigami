export interface Publicacion {
  id?: string;
  titulo: string;
  contenido: string;
  fechaCreacion: any;
  usuarioNombre: string;
  usuarioId: string;
}

export interface Comentario {
  id?: string;
  contenido: string;
  fecha: any;
  usuarioNombre: string;
  usuarioId: string;
}
