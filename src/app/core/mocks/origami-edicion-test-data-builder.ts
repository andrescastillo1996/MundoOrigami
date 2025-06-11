import { OrigamiTestDataBuilder } from '@core/mocks/origami-test-data-builder';
import { PasoTutorialTestDataBuilder } from '@core/mocks/paso-tutorial-test-data-builder';
import { Origami } from '@core/models/origami';
import { PasoTutorial } from '@core/models/paso-tutorial';
import { OrigamiEdicion } from '@feature/admin/models/origami-edicion';

export class OrigamiEdicionTestDataBuilder {
  private origamiEdicion: OrigamiEdicion;

  constructor() {
    const origami = new OrigamiTestDataBuilder().construir();
    const pasos = [
      new PasoTutorialTestDataBuilder()
        .conOrden(1)
        .conTutorialCodigo(origami.codigo)
        .construir(),
      new PasoTutorialTestDataBuilder()
        .conOrden(2)
        .conTutorialCodigo(origami.codigo)
        .construir(),
    ];
    this.origamiEdicion = {
      origami: origami,
      pasos: pasos,
    };
  }

  conOrigami(origami: Origami): OrigamiEdicionTestDataBuilder {
    this.origamiEdicion.origami = origami;
    return this;
  }

  conPasos(pasos: PasoTutorial[]): OrigamiEdicionTestDataBuilder {
    this.origamiEdicion.pasos = pasos;
    return this;
  }

  construir(): OrigamiEdicion {
    return {
      ...this.origamiEdicion,
      origami: { ...this.origamiEdicion.origami },
      pasos: [...this.origamiEdicion.pasos],
    };
  }
}
