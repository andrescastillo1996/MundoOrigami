import { PasoTutorial } from '@core/models/paso-tutorial';

export class PasoTutorialTestDataBuilder {
  private paso: PasoTutorial;

  constructor() {
    this.paso = {
      orden: 1,
      descripcion: 'Dobla la hoja por la mitad en forma diagonal.',
      imagen: 'https://ejemplo.com/pasos/paso1.jpg',
      tutorialCodigo: 'ORIGAMI001',
    };
  }

  conOrden(orden: number): PasoTutorialTestDataBuilder {
    this.paso.orden = orden;
    return this;
  }

  conDescripcion(descripcion: string): PasoTutorialTestDataBuilder {
    this.paso.descripcion = descripcion;
    return this;
  }

  conImagen(imagen: string): PasoTutorialTestDataBuilder {
    this.paso.imagen = imagen;
    return this;
  }

  conTutorialCodigo(codigo: string): PasoTutorialTestDataBuilder {
    this.paso.tutorialCodigo = codigo;
    return this;
  }

  construir(): PasoTutorial {
    return { ...this.paso };
  }
}
