import { HistorialUsuario } from '@shared/historial-usuario/model/historial-usuario';

export class HistorialUsuarioTestDataBuilder {
  private historial: HistorialUsuario;

  constructor() {
    this.historial = {
      uid: 'user123',
      tutorialCodigo: 'ORIGAMI001',
      estadoProceso: 'en-ejecucion',
      fechaInicio: new Date().toISOString(),
      fechaFin: undefined,
    };
  }

  conUid(uid: string): HistorialUsuarioTestDataBuilder {
    this.historial.uid = uid;
    return this;
  }

  conTutorialCodigo(codigo: string): HistorialUsuarioTestDataBuilder {
    this.historial.tutorialCodigo = codigo;
    return this;
  }

  conEstadoProceso(
    estado: 'sin-empezar' | 'en-ejecucion' | 'finalizado'
  ): HistorialUsuarioTestDataBuilder {
    this.historial.estadoProceso = estado;
    return this;
  }

  conFechaInicio(fecha: string): HistorialUsuarioTestDataBuilder {
    this.historial.fechaInicio = fecha;
    return this;
  }

  conFechaFin(fecha: string): HistorialUsuarioTestDataBuilder {
    this.historial.fechaFin = fecha;
    return this;
  }

  construir(): HistorialUsuario {
    return { ...this.historial };
  }
}
