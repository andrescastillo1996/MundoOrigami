import { Origami } from "@feature/home/origami/modelo/origami";
import { Timestamp } from "firebase/firestore";

export interface Tutorial {
  codigo: number;
  fechaCreacion: string;
  fechaModificacion: string;
  totalPasos: number;
  descripcion: string;
  origami: Origami;
}
