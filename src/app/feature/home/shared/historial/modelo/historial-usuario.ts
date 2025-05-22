export interface HistorialUsuario {
  uid: string; // ID del usuario
  tutorialCodigo: number; // Código del tutorial
  estadoProceso: 'sin-empezar' | 'en-ejecucion' | 'finalizado';
  fechaInicio?: string; // ISO opcional
  fechaFin?: string; // ISO opcional
}
