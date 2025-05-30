import { Comentario } from '@feature/home/foro/modelos/comentario.model';
import { UsuarioTestDataBuilder } from './usuario-test-data-builder'; // Asegúrate de tener esta clase creada

export class ComentarioTestDataBuilder {
  private comentario: Comentario;

  constructor() {
    this.comentario = {
      id: 'comentario001',
      publicacionId: 'pub001',
      texto: 'Este es un comentario de prueba.',
      autor: new UsuarioTestDataBuilder().construir(),
      fecha: new Date(),
    };
  }

  conId(id: string): ComentarioTestDataBuilder {
    this.comentario.id = id;
    return this;
  }

  conPublicacionId(publicacionId: string): ComentarioTestDataBuilder {
    this.comentario.publicacionId = publicacionId;
    return this;
  }

  conTexto(texto: string): ComentarioTestDataBuilder {
    this.comentario.texto = texto;
    return this;
  }

  sinAutor(): ComentarioTestDataBuilder {
    this.comentario.autor = undefined;
    return this;
  }

  conAutorPersonalizado(nombre: string, uid: string): ComentarioTestDataBuilder {
    this.comentario.autor = new UsuarioTestDataBuilder().conNombre(nombre).conUuid(uid).construir();
    return this;
  }

  conFecha(fecha: Date): ComentarioTestDataBuilder {
    this.comentario.fecha = fecha;
    return this;
  }

  construir(): Comentario {
    return { ...this.comentario };
  }
}
