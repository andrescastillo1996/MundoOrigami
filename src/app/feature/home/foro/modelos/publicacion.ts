export interface Publicacion {
  id?: string; // Opcional, ya que Firestore lo genera, pero útil para manipulación local
  titulo: string;
  contenido: string;
  fechaCreacion: Date;
  usuarioNombre: string;
  usuarioId: string; // Para vincular al usuario que la creó
}
