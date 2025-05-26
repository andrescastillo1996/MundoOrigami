export interface Origami {
  codigo: string;
  nombre: string;
  url: string;
  descripcion: string;
  tipoOrigami: string;
  estado: string;
  tipoRecurso: string;
  estadoProceso?: 'sin-empezar' | 'en-ejecucion' | 'finalizado';
}
