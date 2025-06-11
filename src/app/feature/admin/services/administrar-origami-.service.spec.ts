import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AdministrarOrigamiService } from './administrar-origami.service';
import { LoaderService } from '@core/loader/loader.service';
import { OrigamiFirestoreAdapter } from '@core/adapters/origami-firestore-adapter.service';
import { PasoTutorialFirestoreAdapter } from '@core/adapters/paso-tutorial-firestore-adapter.service';
import { Origami } from '@core/models/origami';
import { PasoTutorial } from '@core/models/paso-tutorial';
import { OrigamiEdicion } from '../models/origami-edicion';
import { OrigamiTestDataBuilder } from '@core/mocks/origami-test-data-builder';
import { PasoTutorialTestDataBuilder } from '@core/mocks/paso-tutorial-test-data-builder';
import { OrigamiEdicionTestDataBuilder } from '@core/mocks/origami-edicion-test-data-builder';

describe('AdministrarOrigamiService', () => {
  let service: AdministrarOrigamiService;
  let mockLoaderService: jasmine.SpyObj<LoaderService>;
  let mockOrigamiAdapter: jasmine.SpyObj<OrigamiFirestoreAdapter>;
  let mockPasoTutorialAdapter: jasmine.SpyObj<PasoTutorialFirestoreAdapter>;

  beforeEach(() => {
    mockLoaderService = jasmine.createSpyObj('LoaderService', ['showWhileLoading']);
    // El método showWhileLoading toma una promesa y un mensaje, y la retorna.
    // Para las pruebas, simplemente pasamos la promesa sin envolverla.
    mockLoaderService.showWhileLoading.and.callFake((promiseFn: Promise<any>, message: string) => promiseFn);

    mockOrigamiAdapter = jasmine.createSpyObj('OrigamiFirestoreAdapter', [
      'getAllOrigamis',
      'addOrigami',
      'updateOrigami',
      'deleteOrigami',
    ]);
    mockPasoTutorialAdapter = jasmine.createSpyObj('PasoTutorialFirestoreAdapter', [
      'getPasosPorCodigoTutorial',
      'addPaso',        // Añadido para el nuevo método
      'deletePasosByTutorialCodigo', // Añadido para el nuevo método
    ]);

    TestBed.configureTestingModule({
      providers: [
        AdministrarOrigamiService,
        { provide: LoaderService, useValue: mockLoaderService },
        { provide: OrigamiFirestoreAdapter, useValue: mockOrigamiAdapter },
        { provide: PasoTutorialFirestoreAdapter, useValue: mockPasoTutorialAdapter },
      ],
    });

    service = TestBed.inject(AdministrarOrigamiService);
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  // ---
  // Pruebas para agregarOrigamiConPasos
  // ---
  describe('agregarOrigamiConPasos', () => {
    it('debería agregar un origami y sus pasos, y mostrar el loader', fakeAsync(async () => {
      const newOrigamiData = new OrigamiTestDataBuilder().construir();
      const newPasosData = [
        new PasoTutorialTestDataBuilder().conOrden(1).conDescripcion('Paso 1').construir(),
        new PasoTutorialTestDataBuilder().conOrden(2).conDescripcion('Paso 2').construir(),
      ];
      const generatedOrigamiId = 'newOrigamiId123';

      mockOrigamiAdapter.addOrigami.and.returnValue(Promise.resolve(generatedOrigamiId));
      mockOrigamiAdapter.updateOrigami.and.returnValue(Promise.resolve());
      // Mock para addPaso del adapter de pasos
      mockPasoTutorialAdapter.addPaso.and.returnValue(Promise.resolve());

      const promise = service.agregarOrigamiConPasos(newOrigamiData, newPasosData);
      tick(); // Resuelve la promesa de addOrigami
      tick(); // Resuelve la promesa de updateOrigami
      tick(); // Resuelve todas las promesas de addPaso para los pasos

      await promise;

      expect(mockLoaderService.showWhileLoading).toHaveBeenCalledWith(
        jasmine.any(Promise),
        'Guardando origami...'
      );
      expect(mockOrigamiAdapter.addOrigami).toHaveBeenCalledWith(newOrigamiData);
      expect(mockOrigamiAdapter.updateOrigami).toHaveBeenCalled();
      expect(mockPasoTutorialAdapter.addPaso).toHaveBeenCalledTimes(newPasosData.length);
      expect(mockPasoTutorialAdapter.addPaso).toHaveBeenCalledWith(jasmine.objectContaining({
        ...newPasosData[0],
        tutorialCodigo: generatedOrigamiId,
      }));
      expect(mockPasoTutorialAdapter.addPaso).toHaveBeenCalledWith(jasmine.objectContaining({
        ...newPasosData[1],
        tutorialCodigo: generatedOrigamiId,
      }));
    }));

    it('debería manejar errores en la adición de origami o pasos', fakeAsync(async () => {
      const newOrigamiData = new OrigamiTestDataBuilder().construir();
      const newPasosData: PasoTutorial[] = [];

      mockOrigamiAdapter.addOrigami.and.returnValue(Promise.reject('Error al añadir origami'));

      let errorCaught: any;
      try {
        await service.agregarOrigamiConPasos(newOrigamiData, newPasosData);
        tick();
      } catch (error) {
        errorCaught = error;
      }

      expect(errorCaught).toBe('Error al añadir origami');
      expect(mockLoaderService.showWhileLoading).toHaveBeenCalled();
      expect(mockOrigamiAdapter.addOrigami).toHaveBeenCalled();
      expect(mockOrigamiAdapter.updateOrigami).not.toHaveBeenCalled();
    }));
  });

  // ---
  // Pruebas para obtenerOrigamisConPasos
  // ---
  describe('obtenerOrigamisConPasos', () => {
    it('debería retornar todos los origamis con sus pasos asociados y mostrar el loader', fakeAsync(async () => {
      const mockOrigami1 = new OrigamiTestDataBuilder().conCodigo('O1').construir();
      const mockOrigami2 = new OrigamiTestDataBuilder().conCodigo('O2').construir();
      const mockOrigamis: Origami[] = [mockOrigami1, mockOrigami2];

      const mockPasosO1 = [new PasoTutorialTestDataBuilder().conOrden(1).conTutorialCodigo('O1').construir()];
      const mockPasosO2 = [new PasoTutorialTestDataBuilder().conOrden(1).conTutorialCodigo('O2').construir()];

      mockOrigamiAdapter.getAllOrigamis.and.returnValue(Promise.resolve(mockOrigamis));
      mockPasoTutorialAdapter.getPasosPorCodigoTutorial.and.callFake((codigo: string) => {
        if (codigo === 'O1') {
          return Promise.resolve(mockPasosO1);
        }
        if (codigo === 'O2') {
          return Promise.resolve(mockPasosO2);
        }
        return Promise.resolve([]);
      });

      const resultPromise = service.obtenerOrigamisConPasos();
      tick(); // Resuelve la promesa de getAllOrigamis
      tick(); // Resuelve la primera promesa de getPasosPorCodigoTutorial
      tick(); // Resuelve la segunda promesa de getPasosPorCodigoTutorial

      const result = await resultPromise;

      expect(mockLoaderService.showWhileLoading).toHaveBeenCalledWith(
        jasmine.any(Promise),
        'Cargando origamis...'
      );
      expect(mockOrigamiAdapter.getAllOrigamis).toHaveBeenCalledTimes(1);
      expect(mockPasoTutorialAdapter.getPasosPorCodigoTutorial).toHaveBeenCalledTimes(2);
      expect(mockPasoTutorialAdapter.getPasosPorCodigoTutorial).toHaveBeenCalledWith('O1');
      expect(mockPasoTutorialAdapter.getPasosPorCodigoTutorial).toHaveBeenCalledWith('O2');

      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ origami: mockOrigami1, pasos: mockPasosO1 });
      expect(result[1]).toEqual({ origami: mockOrigami2, pasos: mockPasosO2 });
    }));

    it('debería retornar un array vacío si no hay origamis', fakeAsync(async () => {
      mockOrigamiAdapter.getAllOrigamis.and.returnValue(Promise.resolve([]));

      const resultPromise = service.obtenerOrigamisConPasos();
      tick();

      const result = await resultPromise;

      expect(result).toEqual([]);
      expect(mockPasoTutorialAdapter.getPasosPorCodigoTutorial).not.toHaveBeenCalled();
    }));

    it('debería manejar errores en la obtención de origamis', fakeAsync(async () => {
      mockOrigamiAdapter.getAllOrigamis.and.returnValue(Promise.reject('Error de carga de origamis'));

      let errorCaught: any;
      try {
        await service.obtenerOrigamisConPasos();
        tick();
      } catch (error) {
        errorCaught = error;
      }

      expect(errorCaught).toBe('Error de carga de origamis');
      expect(mockLoaderService.showWhileLoading).toHaveBeenCalled();
    }));
  });

  // ---
  // Pruebas para actualizarOrigamiConPasos
  // ---
  describe('actualizarOrigamiConPasos', () => {
    it('debería actualizar un origami y reemplazar sus pasos, y mostrar el loader', fakeAsync(async () => {
      const existingOrigami = new OrigamiTestDataBuilder().conCodigo('O123').construir();
      const updatedPasos = [
        new PasoTutorialTestDataBuilder().conOrden(1).conDescripcion('Updated Paso 1').construir(),
      ];

      mockOrigamiAdapter.updateOrigami.and.returnValue(Promise.resolve());
      // Mock para deletePasosByTutorialCodigo del adapter de pasos
      mockPasoTutorialAdapter.deletePasosByTutorialCodigo.and.returnValue(Promise.resolve());
      // Mock para addPaso del adapter de pasos
      mockPasoTutorialAdapter.addPaso.and.returnValue(Promise.resolve());

      const promise = service.actualizarOrigamiConPasos(existingOrigami, updatedPasos);
      tick(); // Resuelve updateOrigami
      tick(); // Resuelve deletePasosByTutorialCodigo
      tick(); // Resuelve todas las promesas de addPaso para los nuevos pasos

      await promise;

      expect(mockLoaderService.showWhileLoading).toHaveBeenCalledWith(
        jasmine.any(Promise),
        'Actualizando origami...'
      );
      expect(mockOrigamiAdapter.updateOrigami).toHaveBeenCalledWith(existingOrigami.codigo, existingOrigami);
      expect(mockPasoTutorialAdapter.deletePasosByTutorialCodigo).toHaveBeenCalledWith(existingOrigami.codigo);
      expect(mockPasoTutorialAdapter.addPaso).toHaveBeenCalledTimes(updatedPasos.length);
      expect(mockPasoTutorialAdapter.addPaso).toHaveBeenCalledWith(jasmine.objectContaining({
        ...updatedPasos[0],
        tutorialCodigo: existingOrigami.codigo,
      }));
    }));

    it('debería manejar errores en la actualización de origami o pasos', fakeAsync(async () => {
      const existingOrigami = new OrigamiTestDataBuilder().construir();
      const updatedPasos: PasoTutorial[] = [];

      mockOrigamiAdapter.updateOrigami.and.returnValue(Promise.reject('Error al actualizar origami'));

      let errorCaught: any;
      try {
        await service.actualizarOrigamiConPasos(existingOrigami, updatedPasos);
        tick();
      } catch (error) {
        errorCaught = error;
      }

      expect(errorCaught).toBe('Error al actualizar origami');
      expect(mockLoaderService.showWhileLoading).toHaveBeenCalled();
      expect(mockOrigamiAdapter.updateOrigami).toHaveBeenCalled();
      expect(mockPasoTutorialAdapter.deletePasosByTutorialCodigo).not.toHaveBeenCalled(); // No debería intentar eliminar pasos si el origami falla
    }));
  });

  // ---
  // Pruebas para eliminarOrigamiConPasos
  // ---
  describe('eliminarOrigamiConPasos', () => {
    it('debería eliminar un origami y sus pasos relacionados, y mostrar el loader', fakeAsync(async () => {
      const origamiCodigo = 'O_TO_DELETE';

      mockOrigamiAdapter.deleteOrigami.and.returnValue(Promise.resolve());
      // Mock para deletePasosByTutorialCodigo del adapter de pasos
      mockPasoTutorialAdapter.deletePasosByTutorialCodigo.and.returnValue(Promise.resolve());

      const promise = service.eliminarOrigamiConPasos(origamiCodigo);
      tick(); // Resuelve deleteOrigami
      tick(); // Resuelve deletePasosByTutorialCodigo

      await promise;

      expect(mockLoaderService.showWhileLoading).toHaveBeenCalledWith(
        jasmine.any(Promise),
        'Eliminando origami...'
      );
      expect(mockOrigamiAdapter.deleteOrigami).toHaveBeenCalledWith(origamiCodigo);
      expect(mockPasoTutorialAdapter.deletePasosByTutorialCodigo).toHaveBeenCalledWith(origamiCodigo);
    }));

    it('debería manejar errores en la eliminación de origami o pasos', fakeAsync(async () => {
      const origamiCodigo = 'O_FAIL_DELETE';

      mockOrigamiAdapter.deleteOrigami.and.returnValue(Promise.reject('Error al eliminar origami'));

      let errorCaught: any;
      try {
        await service.eliminarOrigamiConPasos(origamiCodigo);
        tick();
      } catch (error) {
        errorCaught = error;
      }

      expect(errorCaught).toBe('Error al eliminar origami');
      expect(mockLoaderService.showWhileLoading).toHaveBeenCalled();
      expect(mockOrigamiAdapter.deleteOrigami).toHaveBeenCalled();
      expect(mockPasoTutorialAdapter.deletePasosByTutorialCodigo).not.toHaveBeenCalled(); // No debería intentar eliminar pasos si el origami falla
    }));
  });
});
