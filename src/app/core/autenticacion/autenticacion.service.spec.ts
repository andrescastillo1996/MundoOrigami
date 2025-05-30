// src/app/core/autenticacion/autenticacion.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { AutenticacionService } from './autenticacion.service';
import { Router } from '@angular/router';
import { SesionService } from './sesion.service';
import { LoaderService } from '@core/loader/loader.service';
import { COLECCIONES, ROLES, RUTAS } from '@core/constantes/constantes';
import { MENSAJES_ERROR } from '@core/constantes/mensajes-error';
import { Usuario } from '@core/models/usuario.model';
// Importamos el nuevo servicio adaptador
import { FirebaseAutenticacionServiceAdapterService } from '../adapters/firebase-autenticacion-service-adapter.service';

// Mock del FirebaseAutenticacionServiceAdapterService
const mockFirebaseAdapterService = {
  firebaseSignInWithEmailAndPassword: jasmine.createSpy(
    'firebaseSignInWithEmailAndPassword'
  ),
  firebaseGetUserDocument: jasmine.createSpy('firebaseGetUserDocument'),
  firebaseSignOut: jasmine
    .createSpy('firebaseSignOut')
    .and.returnValue(Promise.resolve()),
};

const mockRouter = {
  navigateByUrl: jasmine.createSpy('navigateByUrl'),
};

const mockSesionService = {
  guardar: jasmine.createSpy('guardar'),
  eliminar: jasmine.createSpy('eliminar'),
  obtener: jasmine.createSpy('obtener').and.returnValue(null),
};

const mockLoaderService = {
  showWhileLoading: jasmine
    .createSpy('showWhileLoading')
    .and.callFake((promise: Promise<any>, message: string) => {
      return promise;
    }),
};

describe('AutenticacionService', () => {
  let service: AutenticacionService;

  const mockUser: Usuario = {
    uid: 'testUid',
    correo: 'test@example.com',
    nombre: 'Test User',
    rol: [ROLES.USUARIO],
  };

  const mockAdminUser: Usuario = {
    uid: 'adminUid',
    correo: 'admin@example.com',
    nombre: 'Admin User',
    rol: [ROLES.ADMINISTRADOR],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AutenticacionService,
        {
          provide: FirebaseAutenticacionServiceAdapterService,
          useValue: mockFirebaseAdapterService,
        }, // Proveemos el mock del adaptador
        { provide: Router, useValue: mockRouter },
        { provide: SesionService, useValue: mockSesionService },
        { provide: LoaderService, useValue: mockLoaderService },
      ],
    });
    service = TestBed.inject(AutenticacionService);

    // Resetear spies antes de cada prueba
    mockFirebaseAdapterService.firebaseSignInWithEmailAndPassword.calls.reset();
    mockFirebaseAdapterService.firebaseGetUserDocument.calls.reset();
    mockFirebaseAdapterService.firebaseSignOut.calls.reset();
    mockRouter.navigateByUrl.calls.reset();
    mockSesionService.guardar.calls.reset();
    mockSesionService.eliminar.calls.reset();
    mockSesionService.obtener.calls.reset();
    mockLoaderService.showWhileLoading.calls.reset();
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  // --- Pruebas para iniciarSesion ---
  describe('iniciarSesion', () => {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    const mockCredenciales = { user: { uid: mockUser.uid } };

    beforeEach(() => {
      // Configuramos las respuestas del adaptador
      mockFirebaseAdapterService.firebaseSignInWithEmailAndPassword.and.resolveTo(
        mockCredenciales
      );
      mockFirebaseAdapterService.firebaseGetUserDocument.and.resolveTo({
        exists: () => true,
        data: () => mockUser,
      });
    });

    it('debe llamar a showWhileLoading del LoaderService', async () => {
      await service.iniciarSesion(testEmail, testPassword);
      expect(mockLoaderService.showWhileLoading).toHaveBeenCalledWith(
        jasmine.any(Promise),
        'Iniciando sesión...'
      );
    });

    it('debe llamar a firebaseSignInWithEmailAndPassword con las credenciales correctas', async () => {
      await service.iniciarSesion(testEmail, testPassword);
      expect(
        mockFirebaseAdapterService.firebaseSignInWithEmailAndPassword
      ).toHaveBeenCalledWith(testEmail, testPassword);
    });

    it('debe llamar a firebaseGetUserDocument para obtener el documento del usuario', async () => {
      await service.iniciarSesion(testEmail, testPassword);
      expect(
        mockFirebaseAdapterService.firebaseGetUserDocument
      ).toHaveBeenCalledWith(mockUser.uid);
    });

    it('debe lanzar un error si el documento del usuario no existe', async () => {
      mockFirebaseAdapterService.firebaseGetUserDocument.and.resolveTo({
        exists: () => false,
      });

      await expectAsync(
        service.iniciarSesion(testEmail, testPassword)
      ).toBeRejectedWithError(MENSAJES_ERROR.NO_SE_ENCONTRO_USUARIO);
      expect(mockSesionService.guardar).not.toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('debe guardar el usuario en SesionService si la autenticación y obtención de documento son exitosas', async () => {
      await service.iniciarSesion(testEmail, testPassword);
      expect(mockSesionService.guardar).toHaveBeenCalledWith(mockUser);
    });

    it('debe navegar a la ruta de administrador si el usuario tiene rol de administrador', async () => {
      mockFirebaseAdapterService.firebaseGetUserDocument.and.resolveTo({
        exists: () => true,
        data: () => mockAdminUser,
      });

      await service.iniciarSesion(testEmail, testPassword);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(
        RUTAS.ADMINISTRADOR
      );
    });

    it('debe navegar a la ruta de inicio si el usuario NO tiene rol de administrador', async () => {
      mockFirebaseAdapterService.firebaseGetUserDocument.and.resolveTo({
        exists: () => true,
        data: () => mockUser,
      });

      await service.iniciarSesion(testEmail, testPassword);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(RUTAS.HOME);
    });

    it('debe manejar errores de autenticación', async () => {
      const authError = new Error('auth/wrong-password');
      mockFirebaseAdapterService.firebaseSignInWithEmailAndPassword.and.rejectWith(
        authError
      );

      await expectAsync(
        service.iniciarSesion(testEmail, testPassword)
      ).toBeRejectedWith(authError);
      expect(mockSesionService.guardar).not.toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
      expect(
        mockFirebaseAdapterService.firebaseGetUserDocument
      ).not.toHaveBeenCalled();
    });

    it('debe manejar errores al obtener el documento del usuario', async () => {
      const firestoreError = new Error('firestore/permission-denied');
      mockFirebaseAdapterService.firebaseGetUserDocument.and.rejectWith(
        firestoreError
      );

      await expectAsync(
        service.iniciarSesion(testEmail, testPassword)
      ).toBeRejectedWith(firestoreError);
      expect(mockSesionService.guardar).not.toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  // --- Pruebas para cerrarSesion ---
  describe('cerrarSesion', () => {
    it('debe llamar a firebaseSignOut del adaptador', () => {
      service.cerrarSesion();
      expect(mockFirebaseAdapterService.firebaseSignOut).toHaveBeenCalled();
    });

    it('debe llamar a eliminar de SesionService', () => {
      service.cerrarSesion();
      expect(mockSesionService.eliminar).toHaveBeenCalled();
    });

    it('debe navegar a la ruta de login', () => {
      service.cerrarSesion();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(RUTAS.LOGIN);
    });
  });

  // --- Pruebas para obtenerUsuario ---
  describe('obtenerUsuario', () => {
    it('debe llamar a obtener de SesionService', () => {
      service.obtenerUsuario();
      expect(mockSesionService.obtener).toHaveBeenCalled();
    });

    it('debe devolver el usuario obtenido de SesionService', () => {
      const usuarioRetornado: Usuario = {
        uid: 'someUid',
        correo: 'user@example.com',
        nombre: 'Some User',
        rol: [ROLES.USUARIO],
      };
      mockSesionService.obtener.and.returnValue(usuarioRetornado);
      const result = service.obtenerUsuario();
      expect(result).toEqual(usuarioRetornado);
    });

    it('debe devolver null si SesionService.obtener devuelve null', () => {
      mockSesionService.obtener.and.returnValue(null);
      const result = service.obtenerUsuario();
      expect(result).toBeNull();
    });
  });
});
