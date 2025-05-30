import { UsuarioTestDataBuilder } from './usuario-test-data-builder';
import { ComentarioTestDataBuilder } from './comentario-test-data-builder';
import { Publicacion } from '@feature/home/foro/modelos/publicacion.model';

export class PublicacionTestDataBuilder {
  private publicacion: Publicacion;

  constructor() {
    this.publicacion = {
      id: 'pub001',
      titulo: 'Origami de grulla',
      descripcion: 'Aprende a hacer una grulla de papel paso a paso.',
      url: 'https://example.com/origami-grulla.jpg',
      autor: new UsuarioTestDataBuilder().construir(),
      fechaCreacion: new Date(),
      likes: ['user1', 'user2'],
      dislikes: ['user3'],
      comentarios: [new ComentarioTestDataBuilder().construir()],
    };
  }

  conId(id: string): PublicacionTestDataBuilder {
    this.publicacion.id = id;
    return this;
  }

  conTitulo(titulo: string): PublicacionTestDataBuilder {
    this.publicacion.titulo = titulo;
    return this;
  }

  conDescripcion(descripcion: string): PublicacionTestDataBuilder {
    this.publicacion.descripcion = descripcion;
    return this;
  }

  conUrl(url: string): PublicacionTestDataBuilder {
    this.publicacion.url = url;
    return this;
  }

  conAutor(autor: UsuarioTestDataBuilder): PublicacionTestDataBuilder {
    this.publicacion.autor = autor.construir();
    return this;
  }

  sinAutor(): PublicacionTestDataBuilder {
    this.publicacion.autor = undefined;
    return this;
  }

  conFecha(fecha: Date): PublicacionTestDataBuilder {
    this.publicacion.fechaCreacion = fecha;
    return this;
  }

  conLikes(likes: string[]): PublicacionTestDataBuilder {
    this.publicacion.likes = likes;
    return this;
  }

  conDislikes(dislikes: string[]): PublicacionTestDataBuilder {
    this.publicacion.dislikes = dislikes;
    return this;
  }

  conComentarios(comentarios: ComentarioTestDataBuilder[]): PublicacionTestDataBuilder {
    this.publicacion.comentarios = comentarios.map(c => c.construir());
    return this;
  }

  sinComentarios(): PublicacionTestDataBuilder {
    this.publicacion.comentarios = [];
    return this;
  }

  construir(): Publicacion {
    return { ...this.publicacion };
  }
}
