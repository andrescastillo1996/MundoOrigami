// src/app/feature/home/modelos/comentario.model.ts
import { Timestamp } from '@angular/fire/firestore';

export interface Comentario {
  id?: string; // Opcional, será el id del documento de Firestore
  contenido: string;
  fechaCreacion: Timestamp;
  usuarioNombre: string;
  usuarioId: string;
}
