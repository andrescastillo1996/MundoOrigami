import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HistorialUsuarioService } from './historial-usuario.service';
import { LoaderService } from '@core/loader/loader.service';
import { Auth, User } from '@angular/fire/auth';
import { HistorialUsuarioFirestoreAdapter } from '@core/adapters/historial-usuario-firestore-adapter.service';
import { HistorialUsuario } from '../model/historial-usuario';
import { ESTADOS_TUTORIAL } from '@core/constantes/constantes';
import { of, BehaviorSubject } from 'rxjs';
import { HistorialUsuarioTestDataBuilder } from '@core/mocks/historial-usuario-test-data-builder';

describe('HistorialUsuarioService', () => {
  let service: HistorialUsuarioService;
  let mockLoaderService: jasmine.SpyObj<LoaderService>;
  let mockAuth: jasmine.SpyObj<Auth>;
  let mockHistorialAdapter: jasmine.SpyObj<HistorialUsuarioFirestoreAdapter>;

  const MOCK_UID = 'test_user_uid_123';
  const MOCK_TUTORIAL_CODE = 'tutorial_alpha';

  beforeEach(() => {
    mockLoaderService = jasmine.createSpyObj('LoaderService', ['showWhileLoading']);
    mockLoaderService.showWhileLoading.and.callFake((promise: Promise<any>, message: string) => promise);

    // CORRECCIÓN CLAVE AQUÍ:
    // Añadimos al menos un nombre de método (ej. 'signOut') para satisfacer a createSpyObj.
    // Aunque el servicio no lo use directamente, es necesario para que createSpyObj funcione.
    mockAuth = jasmine.createSpyObj('Auth', ['signOut'], {
      // currentUser será configurado por Object.defineProperty
    });

    // Simulamos la propiedad currentUser del objeto Auth
    Object.defineProperty(mockAuth, 'currentUser', {
      configurable: true, // Esto es importante para poder re-definir la propiedad
      writable: true,     // Para poder asignar diferentes usuarios o null
      value: null,        // Valor inicial: no hay usuario logueado
    });

    mockHistorialAdapter = jasmine.createSpyObj('HistorialUsuarioFirestoreAdapter', [
      'getHistorialDoc',
      'getHistorialPorTutorialObservable',
      'setHistorial',
      'updateHistorial',
      'getHistorialByUid',
    ]);

    TestBed.configureTestingModule({
      providers: [
        HistorialUsuarioService,
        { provide: LoaderService, useValue: mockLoaderService },
        { provide: Auth, useValue: mockAuth },
        { provide: HistorialUsuarioFirestoreAdapter, useValue: mockHistorialAdapter },
      ],
    });

    service = TestBed.inject(HistorialUsuarioService);
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  // ---
  // Pruebas para getHistorialPorTutorial
  // ---
  describe('getHistorialPorTutorial', () => {
    it('debería retornar undefined si no hay usuario logueado', fakeAsync(() => {
      // mockAuth.currentUser ya es null por defecto en beforeEach
      let result: HistorialUsuario | undefined;
      service.getHistorialPorTutorial(MOCK_TUTORIAL_CODE).subscribe(data => {
        result = data;
      });
      tick(); // Asegura que el observable completo emita

      expect(result).toBeUndefined();
      expect(mockHistorialAdapter.getHistorialPorTutorialObservable).not.toHaveBeenCalled();
    }));

    it('debería obtener el historial del adapter si hay usuario logueado', fakeAsync(() => {
      // Simular un usuario logueado
      (mockAuth.currentUser as any) = { uid: MOCK_UID };
      const mockHistorial = new HistorialUsuarioTestDataBuilder().conUid(MOCK_UID).conTutorialCodigo(MOCK_TUTORIAL_CODE).construir();
      mockHistorialAdapter.getHistorialPorTutorialObservable.and.returnValue(of(mockHistorial));

      let result: HistorialUsuario | undefined;
      service.getHistorialPorTutorial(MOCK_TUTORIAL_CODE).subscribe(data => {
        result = data;
      });
      tick();

      expect(mockHistorialAdapter.getHistorialPorTutorialObservable).toHaveBeenCalledWith(MOCK_UID, MOCK_TUTORIAL_CODE);
      expect(result).toEqual(mockHistorial);
    }));

    it('debería retornar undefined del adapter si no hay historial para el tutorial', fakeAsync(() => {
      (mockAuth.currentUser as any) = { uid: MOCK_UID };
      mockHistorialAdapter.getHistorialPorTutorialObservable.and.returnValue(of(undefined));

      let result: HistorialUsuario | undefined;
      service.getHistorialPorTutorial(MOCK_TUTORIAL_CODE).subscribe(data => {
        result = data;
      });
      tick();

      expect(mockHistorialAdapter.getHistorialPorTutorialObservable).toHaveBeenCalledWith(MOCK_UID, MOCK_TUTORIAL_CODE);
      expect(result).toBeUndefined();
    }));
  });

  // ---
  // Pruebas para iniciarTutorial
  // ---
  describe('iniciarTutorial', () => {
    const docId = `${MOCK_UID}_${MOCK_TUTORIAL_CODE}`;

    beforeEach(() => {
      (mockAuth.currentUser as any) = { uid: MOCK_UID }; // Siempre hay usuario para esta suite
      mockLoaderService.showWhileLoading.and.callFake((promise: Promise<any>, message: string) => promise);
      mockHistorialAdapter.setHistorial.and.returnValue(Promise.resolve()); // Por defecto setHistorial funciona
      mockHistorialAdapter.getHistorialDoc.and.returnValue(Promise.resolve(undefined)); // Por defecto no existe historial
    });

    it('no debería hacer nada si no hay usuario logueado', async () => {
      (mockAuth.currentUser as any) = null;
      await service.iniciarTutorial(MOCK_TUTORIAL_CODE);
      expect(mockHistorialAdapter.getHistorialDoc).not.toHaveBeenCalled();
      expect(mockHistorialAdapter.setHistorial).not.toHaveBeenCalled();
    });

    it('debería iniciar el tutorial a EN_EJECUCION si no existe historial previo', fakeAsync(async () => {
      await service.iniciarTutorial(MOCK_TUTORIAL_CODE);
      tick(); // Resuelve getHistorialDoc
      tick(); // Resuelve setHistorial

      expect(mockLoaderService.showWhileLoading).toHaveBeenCalledWith(jasmine.any(Promise), 'Iniciando tutorial...');
      expect(mockHistorialAdapter.getHistorialDoc).toHaveBeenCalledWith(docId);
      expect(mockHistorialAdapter.setHistorial).toHaveBeenCalledWith(
        docId,
        jasmine.objectContaining({
          uid: MOCK_UID,
          tutorialCodigo: MOCK_TUTORIAL_CODE,
          estadoProceso: ESTADOS_TUTORIAL.EN_EJECUCION,
          fechaInicio: jasmine.any(String), // Verificar que es un string (ISO)
        })
      );
    }));

    it('debería iniciar el tutorial a EN_EJECUCION si existe y está SIN_EMPEZAR', fakeAsync(async () => {
      const historialSinEmpezar = new HistorialUsuarioTestDataBuilder()
        .conUid(MOCK_UID)
        .conTutorialCodigo(MOCK_TUTORIAL_CODE)
        .conEstadoProceso(ESTADOS_TUTORIAL.SIN_EMPEZAR)
        .construir();
      mockHistorialAdapter.getHistorialDoc.and.returnValue(Promise.resolve(historialSinEmpezar));

      await service.iniciarTutorial(MOCK_TUTORIAL_CODE);
      tick();
      tick();

      expect(mockHistorialAdapter.getHistorialDoc).toHaveBeenCalledWith(docId);
      expect(mockHistorialAdapter.setHistorial).toHaveBeenCalledWith(
        docId,
        jasmine.objectContaining({
          uid: MOCK_UID,
          tutorialCodigo: MOCK_TUTORIAL_CODE,
          estadoProceso: ESTADOS_TUTORIAL.EN_EJECUCION,
        })
      );
    }));

    it('no debería iniciar el tutorial si existe y está EN_EJECUCION', fakeAsync(async () => {
      const historialEnEjecucion = new HistorialUsuarioTestDataBuilder()
        .conUid(MOCK_UID)
        .conTutorialCodigo(MOCK_TUTORIAL_CODE)
        .conEstadoProceso(ESTADOS_TUTORIAL.EN_EJECUCION)
        .construir();
      mockHistorialAdapter.getHistorialDoc.and.returnValue(Promise.resolve(historialEnEjecucion));

      await service.iniciarTutorial(MOCK_TUTORIAL_CODE);
      tick(); // Resuelve getHistorialDoc

      expect(mockHistorialAdapter.getHistorialDoc).toHaveBeenCalledWith(docId);
      expect(mockHistorialAdapter.setHistorial).not.toHaveBeenCalled(); // No debería llamar a setDoc
    }));

    it('no debería iniciar el tutorial si existe y está FINALIZADO', fakeAsync(async () => {
      const historialFinalizado = new HistorialUsuarioTestDataBuilder()
        .conUid(MOCK_UID)
        .conTutorialCodigo(MOCK_TUTORIAL_CODE)
        .conEstadoProceso(ESTADOS_TUTORIAL.FINALIZADO)
        .construir();
      mockHistorialAdapter.getHistorialDoc.and.returnValue(Promise.resolve(historialFinalizado));

      await service.iniciarTutorial(MOCK_TUTORIAL_CODE);
      tick(); // Resuelve getHistorialDoc

      expect(mockHistorialAdapter.getHistorialDoc).toHaveBeenCalledWith(docId);
      expect(mockHistorialAdapter.setHistorial).not.toHaveBeenCalled(); // No debería llamar a setDoc
    }));

    it('debería manejar errores en el proceso de inicio de tutorial', fakeAsync(async () => {
      mockHistorialAdapter.getHistorialDoc.and.returnValue(Promise.reject('Error de obtención de historial'));

      let errorCaught: any;
      try {
        await service.iniciarTutorial(MOCK_TUTORIAL_CODE);
        tick();
      } catch (error) {
        errorCaught = error;
      }

      expect(errorCaught).toBe('Error de obtención de historial');
      expect(mockLoaderService.showWhileLoading).toHaveBeenCalled();
    }));
  });

  // ---
  // Pruebas para finalizarTutorial
  // ---
  describe('finalizarTutorial', () => {
    const docId = `${MOCK_UID}_${MOCK_TUTORIAL_CODE}`;

    beforeEach(() => {
      (mockAuth.currentUser as any) = { uid: MOCK_UID };
      mockLoaderService.showWhileLoading.and.callFake((promise: Promise<any>, message: string) => promise);
      mockHistorialAdapter.updateHistorial.and.returnValue(Promise.resolve());
    });

    it('no debería hacer nada si no hay usuario logueado', async () => {
      (mockAuth.currentUser as any) = null;
      await service.finalizarTutorial(MOCK_TUTORIAL_CODE);
      expect(mockHistorialAdapter.updateHistorial).not.toHaveBeenCalled();
    });

    it('debería actualizar el estado del tutorial a FINALIZADO y mostrar el loader', fakeAsync(async () => {
      await service.finalizarTutorial(MOCK_TUTORIAL_CODE);
      tick(); // Resuelve updateHistorial

      expect(mockLoaderService.showWhileLoading).toHaveBeenCalledWith(jasmine.any(Promise), 'Finalizando tutorial...');
      expect(mockHistorialAdapter.updateHistorial).toHaveBeenCalledWith(
        docId,
        jasmine.objectContaining({
          estadoProceso: ESTADOS_TUTORIAL.FINALIZADO,
          fechaFin: jasmine.any(String), // Verificar que es un string (ISO)
        })
      );
    }));

    it('debería manejar errores en la finalización de tutorial', fakeAsync(async () => {
      mockHistorialAdapter.updateHistorial.and.returnValue(Promise.reject('Error de actualización de historial'));

      let errorCaught: any;
      try {
        await service.finalizarTutorial(MOCK_TUTORIAL_CODE);
        tick();
      } catch (error) {
        errorCaught = error;
      }

      expect(errorCaught).toBe('Error de actualización de historial');
      expect(mockLoaderService.showWhileLoading).toHaveBeenCalled();
      expect(mockHistorialAdapter.updateHistorial).toHaveBeenCalled();
    }));
  });

  // ---
  // Pruebas para getHistorialDelUsuario
  // ---
  describe('getHistorialDelUsuario', () => {
    beforeEach(() => {
      (mockAuth.currentUser as any) = { uid: MOCK_UID };
      mockLoaderService.showWhileLoading.and.callFake((promise: Promise<any>, message: string) => promise);
    });

    it('debería retornar un array vacío si no hay usuario logueado', async () => {
      (mockAuth.currentUser as any) = null;
      const result = await service.getHistorialDelUsuario();
      expect(result).toEqual([]);
      expect(mockLoaderService.showWhileLoading).toHaveBeenCalled();
    });

    it('debería obtener el historial completo del usuario desde el adapter y mostrar el loader', fakeAsync(async () => {
      const mockHistoriales = [
        new HistorialUsuarioTestDataBuilder().conUid(MOCK_UID).conTutorialCodigo('tut1').construir(),
        new HistorialUsuarioTestDataBuilder().conUid(MOCK_UID).conTutorialCodigo('tut2').construir(),
      ];
      mockHistorialAdapter.getHistorialByUid.and.returnValue(Promise.resolve(mockHistoriales));

      const result = await service.getHistorialDelUsuario();
      tick();

      expect(mockLoaderService.showWhileLoading).toHaveBeenCalledWith(jasmine.any(Promise), 'Cargando historial...');
      expect(mockHistorialAdapter.getHistorialByUid).toHaveBeenCalledWith(MOCK_UID);
      expect(result).toEqual(mockHistoriales);
    }));

    it('debería retornar un array vacío si el adapter no devuelve historial para el usuario', fakeAsync(async () => {
      mockHistorialAdapter.getHistorialByUid.and.returnValue(Promise.resolve([]));

      const result = await service.getHistorialDelUsuario();
      tick();

      expect(mockHistorialAdapter.getHistorialByUid).toHaveBeenCalledWith(MOCK_UID);
      expect(result).toEqual([]);
    }));

    it('debería manejar errores en la obtención del historial del usuario', fakeAsync(async () => {
      mockHistorialAdapter.getHistorialByUid.and.returnValue(Promise.reject('Error al obtener historial completo'));

      let errorCaught: any;
      try {
        await service.getHistorialDelUsuario();
        tick();
      } catch (error) {
        errorCaught = error;
      }

      expect(errorCaught).toBe('Error al obtener historial completo');
      expect(mockLoaderService.showWhileLoading).toHaveBeenCalled();
      expect(mockHistorialAdapter.getHistorialByUid).toHaveBeenCalled();
    }));
  });
});
