import { HistoriaOrigami } from "@core/models/historia-origami";

export class HistoriaOrigamiTestDataBuilder {
  private historia: HistoriaOrigami;

  constructor() {
    this.historia = {
      codigo: 1,
      nombre: 'Origami Grulla',
      url: 'https://example.com/grulla.jpg',
      descripcion: 'Un origami clásico en forma de grulla',
      id: 'abc123',
    };
  }

  conCodigo(codigo: number): HistoriaOrigamiTestDataBuilder {
    this.historia.codigo = codigo;
    return this;
  }

  conNombre(nombre: string): HistoriaOrigamiTestDataBuilder {
    this.historia.nombre = nombre;
    return this;
  }

  conUrl(url: string): HistoriaOrigamiTestDataBuilder {
    this.historia.url = url;
    return this;
  }

  conDescripcion(descripcion: string): HistoriaOrigamiTestDataBuilder {
    this.historia.descripcion = descripcion;
    return this;
  }

  conId(id: string): HistoriaOrigamiTestDataBuilder {
    this.historia.id = id;
    return this;
  }

  construir(): HistoriaOrigami {
    return { ...this.historia };
  }
}
