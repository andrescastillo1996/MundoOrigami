export interface Origami {
  codigo: number;
  nombre: string;
  url: string;
  descripcion: string;
  tipoOrigami: string;
  estado: string;
  tipoRecurso: string;
 estadoProceso?: 'sin-empezar' | 'en-ejecucion' | 'finalizado';
 }
