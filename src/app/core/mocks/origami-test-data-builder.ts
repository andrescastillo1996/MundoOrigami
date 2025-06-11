import { Origami } from '@core/models/origami';

export class OrigamiTestDataBuilder {
  private origami: Origami;

  constructor() {
    this.origami = {
      codigo: 'ORIGAMI001',
      nombre: 'Grulla de papel',
      url: 'https://ejemplo.com/origami/grulla.jpg',
      descripcion: 'Un origami clásico de grulla de papel.',
      tipoOrigami: 'Ave',
      estado: 'activo',
      tipoRecurso: 'tutorial',
      estadoProceso: 'sin-empezar',
    };
  }

  conCodigo(codigo: string ): OrigamiTestDataBuilder {
    this.origami.codigo = codigo;
    return this;
  }

  conNombre(nombre: string): OrigamiTestDataBuilder {
    this.origami.nombre = nombre;
    return this;
  }

  conUrl(url: string): OrigamiTestDataBuilder {
    this.origami.url = url;
    return this;
  }

  conDescripcion(descripcion: string): OrigamiTestDataBuilder {
    this.origami.descripcion = descripcion;
    return this;
  }

  conTipoOrigami(tipo: string): OrigamiTestDataBuilder {
    this.origami.tipoOrigami = tipo;
    return this;
  }

  conEstado(estado: string): OrigamiTestDataBuilder {
    this.origami.estado = estado;
    return this;
  }

  conTipoRecurso(recurso: string): OrigamiTestDataBuilder {
    this.origami.tipoRecurso = recurso;
    return this;
  }

  conEstadoProceso(
    estado: 'sin-empezar' | 'en-ejecucion' | 'finalizado'
  ): OrigamiTestDataBuilder {
    this.origami.estadoProceso = estado;
    return this;
  }

  construir(): Origami {
    return { ...this.origami };
  }
}
