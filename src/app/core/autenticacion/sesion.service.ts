import { Injectable } from '@angular/core';
import { Usuario } from '@core/models/usuario.model';

const CLAVE_SESION = 'usuario';

@Injectable({
  providedIn: 'root',
})
export class SesionService {
  guardar(usuario: Usuario): void {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
  }

  obtener(): Usuario | null {
    const data = sessionStorage.getItem(CLAVE_SESION);
    return data ? JSON.parse(data) : null;
  }

  eliminar(): void {
    sessionStorage.removeItem(CLAVE_SESION);
  }

  existe(): boolean {
    return !!sessionStorage.getItem(CLAVE_SESION);
  }
}
