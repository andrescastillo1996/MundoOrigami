import { TextoEstadoPipe } from './texto-estado.pipe'; // Ajusta la ruta si es necesario
import { ESTADOS_TUTORIAL } from '@core/constantes/constantes'; // Ajusta la ruta si es necesario
import { OrigamiTestDataBuilder } from '@core/mocks/origami-test-data-builder'; // Ajusta la ruta si es necesario

describe('TextoEstadoPipe', () => {
  let pipe: TextoEstadoPipe;

  beforeEach(() => {
    pipe = new TextoEstadoPipe();
  });

  it('debería crearse una instancia', () => {
    expect(pipe).toBeTruthy();
  });

  it('debería retornar "Sin empezar" para el estado "sin-empezar"', () => {
    const estado = new OrigamiTestDataBuilder().conEstadoProceso(ESTADOS_TUTORIAL.SIN_EMPEZAR).construir().estadoProceso;
    expect(pipe.transform(estado)).toBe('Sin empezar');
  });

  it('debería retornar "En ejecución" para el estado "en-ejecucion"', () => {
    const estado = new OrigamiTestDataBuilder().conEstadoProceso(ESTADOS_TUTORIAL.EN_EJECUCION).construir().estadoProceso;
    expect(pipe.transform(estado)).toBe('En ejecución');
  });

  it('debería retornar "Finalizado" para el estado "finalizado"', () => {
    const estado = new OrigamiTestDataBuilder().conEstadoProceso(ESTADOS_TUTORIAL.FINALIZADO).construir().estadoProceso;
    expect(pipe.transform(estado)).toBe('Finalizado');
  });

  it('debería retornar "Desconocido" para un estado indefinido (undefined)', () => {
    expect(pipe.transform(undefined)).toBe('Desconocido');
  });

  it('debería retornar "Desconocido" para un estado nulo (null)', () => {
    // Para simular un estado nulo, puedes castear explícitamente a string | undefined
    expect(pipe.transform(null as any)).toBe('Desconocido');
  });

  it('debería retornar "Desconocido" para un estado desconocido o inválido', () => {
    expect(pipe.transform('estado-invalido')).toBe('Desconocido');
  });

  it('debería manejar mayúsculas y minúsculas correctamente (e.g., "SIN-EMPEZAR")', () => {
    expect(pipe.transform('SIN-EMPEZAR')).toBe('Sin empezar');
  });

  it('debería manejar mayúsculas y minúsculas correctamente (e.g., "EN-EJECUCION")', () => {
    expect(pipe.transform('EN-EJECUCION')).toBe('En ejecución');
  });
});