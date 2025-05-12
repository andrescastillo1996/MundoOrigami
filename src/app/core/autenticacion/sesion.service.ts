import { Injectable } from '@angular/core';
import { Usuario } from '@core/models/usuario.model';

const CLAVE_SESION = 'usuario';

@Injectable({
  providedIn: 'root',
})
export class SesionService {
  guardar(usuario: Usuario): void {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
  }

  obtener(): Usuario | null {
    const data = localStorage.getItem(CLAVE_SESION);
    return data ? JSON.parse(data) : null;
  }

  eliminar(): void {
    localStorage.removeItem(CLAVE_SESION);
  }

  existe(): boolean {
    return !!localStorage.getItem(CLAVE_SESION);
  }
}
