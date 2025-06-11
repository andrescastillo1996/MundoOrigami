import { TestBed } from '@angular/core/testing';
import { HistoriaOrigamiService } from './historia-origami.service';
import { HistoriaOrigamiFirestoreAdapter } from '@core/adapters/historia-origami-firestore-adapter.service';
import { HistoriaOrigamiTestDataBuilder } from '@core/mocks/historia-origami-test-data-builder';
import { HistoriaOrigami } from '@core/models/historia-origami';


const mockHistoriaOrigamiFirestoreAdapter = {
  getEjemplosPracticos: jasmine.createSpy('getEjemplosPracticos').and.returnValue(Promise.resolve([
    new HistoriaOrigamiTestDataBuilder().conId('1').conNombre('Mock Service Historia 1').construir(),
    new HistoriaOrigamiTestDataBuilder().conId('2').conNombre('Mock Service Historia 2').construir(),
  ])),
};

describe('HistoriaOrigamiService', () => {
  let service: HistoriaOrigamiService;
  let adapter: HistoriaOrigamiFirestoreAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HistoriaOrigamiService,
        { provide: HistoriaOrigamiFirestoreAdapter, useValue: mockHistoriaOrigamiFirestoreAdapter },
      ],
    });

    service = TestBed.inject(HistoriaOrigamiService);
    adapter = TestBed.inject(HistoriaOrigamiFirestoreAdapter);

    mockHistoriaOrigamiFirestoreAdapter.getEjemplosPracticos.calls.reset();
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('getEjemplosPracticos', () => {
    it('debería llamar al método getEjemplosPracticos del adapter', async () => {
      await service.getEjemplosPracticos();

      expect(adapter.getEjemplosPracticos).toHaveBeenCalledTimes(1);
    });

    it('debería devolver los ejemplos prácticos obtenidos del adapter', async () => {
      const expectedEjemplos: HistoriaOrigami[] = [
        new HistoriaOrigamiTestDataBuilder().conId('1').conNombre('Mock Service Historia 1').construir(),
        new HistoriaOrigamiTestDataBuilder().conId('2').conNombre('Mock Service Historia 2').construir(),
      ];
      mockHistoriaOrigamiFirestoreAdapter.getEjemplosPracticos.and.returnValue(Promise.resolve(expectedEjemplos));

      const result = await service.getEjemplosPracticos();

  
      expect(result.length).toBe(2);
    });

    it('debería manejar el caso en que el adapter devuelve un array vacío', async () => {
      mockHistoriaOrigamiFirestoreAdapter.getEjemplosPracticos.and.returnValue(Promise.resolve([]));

      const result = await service.getEjemplosPracticos();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('debería propagar errores si el adapter falla', async () => {
      mockHistoriaOrigamiFirestoreAdapter.getEjemplosPracticos.and.returnValue(Promise.reject('Error de conexión mockeado'));

      await expectAsync(service.getEjemplosPracticos()).toBeRejectedWith('Error de conexión mockeado');
    });
  });
});