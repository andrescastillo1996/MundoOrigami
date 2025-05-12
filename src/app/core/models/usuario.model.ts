export interface Usuario {
  uid?: string;
  nombre: string;
  correo: string;
  rol: string[];
  fechaCreacion?: string;
}
