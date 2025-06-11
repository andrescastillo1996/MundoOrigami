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
    if (!data) {
      return null;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      // Si la data no es un JSON válido, capturamos el error y devolvemos null
      console.error('Error al parsear datos de sesión:', e);
      sessionStorage.removeItem(CLAVE_SESION); // Opcional: limpiar la entrada corrupta
      return null;
    }
  }

  eliminar(): void {
    sessionStorage.removeItem(CLAVE_SESION);
  }

  existe(): boolean {
    return !!sessionStorage.getItem(CLAVE_SESION);
  }
}
