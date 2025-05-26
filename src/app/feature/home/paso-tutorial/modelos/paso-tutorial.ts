// src/app/core/models/paso-tutorial.ts
export interface PasoTutorial {
  id?: string; // El ID del documento, opcional
  codigoTutorial: string; // Referencia al código del tutorial padre
  orden: number;
  descripcion: string;
  imagen?: string; // URL de la imagen del paso, si aplica
  // Agrega cualquier otra propiedad que tus pasos puedan tener
}
