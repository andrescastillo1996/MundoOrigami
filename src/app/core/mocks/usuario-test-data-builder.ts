import { ROLES } from '@core/constantes/constantes';
import { Usuario } from '@core/models/usuario.model';

export class UsuarioTestDataBuilder {
  private usuario: Usuario;

  constructor() {
    this.usuario = {
      nombre: 'usuario',
      correo: 'correo@gmail.com',
      rol: [ROLES.USUARIO],
    };
  }

  conUuid(uid: string): this {
    this.usuario.uid = uid;
    return this;
  }

  conNombre(nombre: string): this {
    this.usuario.nombre = nombre;
    return this;
  }

  conEmail(email: string): this {
    this.usuario.correo = email;
    return this;
  }

  conRoles(roles: string[]) {
    this.usuario.rol = [];
    this.usuario.rol = [...roles];
    return this;
  }

  construir(): Usuario {
    return this.usuario;
  }
}
