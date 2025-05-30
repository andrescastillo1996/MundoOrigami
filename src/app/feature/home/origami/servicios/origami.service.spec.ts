import { TestBed } from '@angular/core/testing';
import { OrigamiService } from './origami.service';
import { of, throwError } from 'rxjs';
import { Origami } from '@core/models/origami';
import { OrigamiTestDataBuilder } from '@core/mocks/origami-test-data-builder'; // Asegúrate de que la ruta sea correcta
import { OrigamiFirestoreAdapter } from '@core/adapters/origami-firestore-adapter.service';

// Mock del OrigamiFirestoreAdapter
const mockOrigamiFirestoreAdapter = jasmine.createSpyObj(
  'OrigamiFirestoreAdapter',
  ['getAllOrigamis']
);

describe('OrigamiService', () => {
  let service: OrigamiService;

  beforeEach(() => {
    // Configurar el mock del adaptador para que devuelva una PROMESA que resuelve con un Observable
    // Esto simula el comportamiento de `firstValueFrom` dentro del adaptador real.
    // O mejor, simplemente que el adaptador mock devuelva directamente la Promise.
    mockOrigamiFirestoreAdapter.getAllOrigamis.and.returnValue(Promise.resolve([])); // Por defecto, retorna una promesa que resuelve con un array vacío

    TestBed.configureTestingModule({
      providers: [
        OrigamiService,
        {
          provide: OrigamiFirestoreAdapter,
          useValue: mockOrigamiFirestoreAdapter,
        },
      ],
    });
    service = TestBed.inject(OrigamiService);
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  describe('getOrigamis', () => {
    const primerOrigami = new OrigamiTestDataBuilder().construir();
    const segundoOrigami = new OrigamiTestDataBuilder()
      .conNombre('Grulla')
      .construir();
    const mockOrigamiList: Origami[] = [primerOrigami, segundoOrigami];

    it('debería llamar a origamiAdapter.getAllOrigamis', async () => {
      // Configuramos para que devuelva una promesa vacía para esta prueba
      mockOrigamiFirestoreAdapter.getAllOrigamis.and.returnValue(Promise.resolve([]));
      await service.getOrigamis();
      expect(mockOrigamiFirestoreAdapter.getAllOrigamis).toHaveBeenCalled();
    });

    it('debería retornar una lista de origamis en caso de éxito', async () => {
      // Configuramos para que devuelva una promesa que resuelve con la lista
      mockOrigamiFirestoreAdapter.getAllOrigamis.and.returnValue(
        Promise.resolve(mockOrigamiList)
      );

      const result = await service.getOrigamis();

      expect(result).toEqual(mockOrigamiList);
      expect(result.length).toBe(2);
    });

    it('debería retornar un array vacío si no se encuentran origamis', async () => {
      // Configuramos para que devuelva una promesa que resuelve con un array vacío
      mockOrigamiFirestoreAdapter.getAllOrigamis.and.returnValue(Promise.resolve([]));

      const result = await service.getOrigamis();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('debería manejar errores durante la obtención de datos', async () => {
      const errorMessage = 'Error al obtener origamis';
      // Configuramos para que devuelva una promesa que rechaza
      mockOrigamiFirestoreAdapter.getAllOrigamis.and.returnValue(
        Promise.reject(new Error(errorMessage))
      );

      await expectAsync(service.getOrigamis()).toBeRejectedWith(
        new Error(errorMessage)
      );
    });
  });
});