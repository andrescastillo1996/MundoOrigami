
export interface Publicacion {
  id?: string; // ID opcional para cuando se crea
  titulo: string;
  contenido: string;
  usuarioId: string;
  usuarioNombre: string;
  fechaCreacion: any; // Puede ser Date, Timestamp, o string (Timestamp.now() es lo ideal)
  imagenUrl?: string; // ¡Campo para la URL de la imagen (opcional)!
}
