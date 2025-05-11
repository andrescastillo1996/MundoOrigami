export interface Usuario {
  uid?: string;
  nombre: string;
  correo: string;
  contrasena: string;
  rol: string[];
  fechaCreacion?: string;
}
