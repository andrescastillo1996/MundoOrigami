import { Origami } from '@core/models/origami';
import { Timestamp } from 'firebase/firestore';

export interface Tutorial {
  codigo: string;
  fechaCreacion: string;
  fechaModificacion: string;
  totalPasos: number;
  descripcion: string;
  origami: Origami;
}
