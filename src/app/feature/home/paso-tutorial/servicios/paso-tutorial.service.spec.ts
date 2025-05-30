import { TestBed } from '@angular/core/testing';
import { PasoTutorialService } from './paso-tutorial.service';
import { LoaderService } from '@core/loader/loader.service';
import { PasoTutorialFirestoreAdapter } from '@core/adapters/paso-tutorial-firestore-adapter.service';
import { PasoTutorial } from '@core/models/paso-tutorial';
import { PasoTutorialTestDataBuilder } from '@core/mocks/paso-tutorial-test-data-builder'; // Importa el builder

describe('PasoTutorialService', () => {
  let service: PasoTutorialService;
  let mockLoaderService: jasmine.SpyObj<LoaderService>;
  let mockPasoTutorialFirestoreAdapter: jasmine.SpyObj<PasoTutorialFirestoreAdapter>;

  // Creamos los mocks usando el Test Data Builder
  const mockPasos: PasoTutorial[] = [
    new PasoTutorialTestDataBuilder()
      .conOrden(1)
      .conTutorialCodigo('T001')
      .construir(),
    new PasoTutorialTestDataBuilder()
      .conOrden(2)
      .conTutorialCodigo('T001')
      .construir(),
  ];

  beforeEach(() => {
    mockLoaderService = jasmine.createSpyObj('LoaderService', [
      'showWhileLoading',
    ]);
    mockPasoTutorialFirestoreAdapter = jasmine.createSpyObj(
      'PasoTutorialFirestoreAdapter',
      ['getPasosPorCodigoTutorial']
    );

    TestBed.configureTestingModule({
      providers: [
        PasoTutorialService,
        { provide: LoaderService, useValue: mockLoaderService },
        {
          provide: PasoTutorialFirestoreAdapter,
          useValue: mockPasoTutorialFirestoreAdapter,
        },
      ],
    });

    service = TestBed.inject(PasoTutorialService);
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('getPasosPorCodigoTutorial', () => {
    it('debería llamar al adapter para obtener los pasos y usar el LoaderService', async () => {
      const codigoTutorial = 'T001';

      mockPasoTutorialFirestoreAdapter.getPasosPorCodigoTutorial.and.returnValue(
        Promise.resolve(mockPasos)
      );
      mockLoaderService.showWhileLoading.and.callFake(promise => promise); // Pasa la promesa directamente

      const result = await service.getPasosPorCodigoTutorial(codigoTutorial);

      // Verificaciones
      expect(
        mockPasoTutorialFirestoreAdapter.getPasosPorCodigoTutorial
      ).toHaveBeenCalledWith(codigoTutorial);
      expect(mockLoaderService.showWhileLoading).toHaveBeenCalledWith(
        jasmine.any(Promise),
        'Cargando pasos...'
      );
      expect(result).toEqual(mockPasos);
    });

    it('debería manejar errores de la obtención de pasos', async () => {
      const codigoTutorial = 'T002';
      const errorMessage = 'Error al obtener pasos del tutorial';

      mockPasoTutorialFirestoreAdapter.getPasosPorCodigoTutorial.and.returnValue(
        Promise.reject(new Error(errorMessage))
      );
      mockLoaderService.showWhileLoading.and.callFake(promise => promise);

      await expectAsync(
        service.getPasosPorCodigoTutorial(codigoTutorial)
      ).toBeRejectedWithError(errorMessage);

      // Verificaciones
      expect(
        mockPasoTutorialFirestoreAdapter.getPasosPorCodigoTutorial
      ).toHaveBeenCalledWith(codigoTutorial);
      expect(mockLoaderService.showWhileLoading).toHaveBeenCalledWith(
        jasmine.any(Promise),
        'Cargando pasos...'
      );
    });
  });
});
