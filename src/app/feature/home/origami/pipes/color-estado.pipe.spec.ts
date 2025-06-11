import { ColorEstadoPipe } from './color-estado.pipe'; // Ajusta la ruta si es necesario
import { ESTADOS_TUTORIAL } from '@core/constantes/constantes'; // Ajusta la ruta si es necesario
import { OrigamiTestDataBuilder } from '@core/mocks/origami-test-data-builder'; // Ajusta la ruta si es necesario

describe('ColorEstadoPipe', () => {
  let pipe: ColorEstadoPipe;

  beforeEach(() => {
    pipe = new ColorEstadoPipe();
  });

  it('debería crearse una instancia', () => {
    expect(pipe).toBeTruthy();
  });

  it('debería retornar "medium" para el estado "sin-empezar"', () => {
    const estado = new OrigamiTestDataBuilder()
      .conUrl('mi-url')
      .conEstadoProceso(ESTADOS_TUTORIAL.SIN_EMPEZAR)
      .construir().estadoProceso;
    expect(pipe.transform(estado)).toBe('medium');
  });

  it('debería retornar "warning" para el estado "en-ejecucion"', () => {
    const estado = new OrigamiTestDataBuilder()
      .conDescripcion('hola')
      .conEstado('estado')
      .conEstadoProceso(ESTADOS_TUTORIAL.EN_EJECUCION)
      .construir().estadoProceso;
    expect(pipe.transform(estado)).toBe('warning');
  });

  it('debería retornar "success" para el estado "finalizado"', () => {
    const estado = new OrigamiTestDataBuilder()
      .conTipoOrigami('tipo')
      .conTipoRecurso('gola')
      .conEstadoProceso(ESTADOS_TUTORIAL.FINALIZADO)
      .construir().estadoProceso;
    expect(pipe.transform(estado)).toBe('success');
  });

  it('debería retornar "medium" para un estado indefinido (undefined)', () => {
    expect(pipe.transform(undefined)).toBe('medium');
  });

  it('debería retornar "medium" para un estado nulo (null)', () => {
    // Para simular un estado nulo, puedes castear explícitamente a string | undefined
    expect(pipe.transform(null as any)).toBe('medium');
  });

  it('debería retornar "medium" para un estado desconocido o inválido', () => {
    expect(pipe.transform('estado-desconocido')).toBe('medium');
  });

  it('debería manejar mayúsculas y minúsculas correctamente (e.g., "SIN-EMPEZAR")', () => {
    expect(pipe.transform('SIN-EMPEZAR')).toBe('medium');
  });

  it('debería manejar mayúsculas y minúsculas correctamente (e.g., "EN-EJECUCION")', () => {
    expect(pipe.transform('EN-EJECUCION')).toBe('warning');
  });
});
