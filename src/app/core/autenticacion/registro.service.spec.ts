import { TestBed } from '@angular/core/testing';
import { RegistroService } from './registro.service';
import { LoaderService } from '@core/loader/loader.service';
import { FirebaseRegistroServiceAdapterService } from '@core/adapters/firebase-registro-service-adapter.service';
import { UserCredential } from '@angular/fire/auth';

describe('RegistroService', () => {
  let service: RegistroService;
  let mockLoaderService: jasmine.SpyObj<LoaderService>;
  let mockFirebaseRegistroAdapterService: jasmine.SpyObj<FirebaseRegistroServiceAdapterService>;

  const mockUserCredential = {
    user: {
      uid: 'mockUid123',
      email: 'test@example.com',
      // Añade otras propiedades de `User` si se acceden en el servicio
    },

  };

  beforeEach(() => {
    // Crea un mock de LoaderService usando jasmine.createSpyObj
    mockLoaderService = jasmine.createSpyObj('LoaderService', ['showWhileLoading']);
    // Implementa showWhileLoading para simplemente pasar la promesa
    mockLoaderService.showWhileLoading.and.callFake((promise: Promise<any>) => promise);

    // Crea un mock de FirebaseRegistroServiceAdapterService
    mockFirebaseRegistroAdapterService = jasmine.createSpyObj('FirebaseRegistroServiceAdapterService', [
      'firebaseCreateUserWithEmailAndPassword',
      'firebaseSetUserDocument',
    ]);

    TestBed.configureTestingModule({
      providers: [
        RegistroService,
        { provide: LoaderService, useValue: mockLoaderService },
        { provide: FirebaseRegistroServiceAdapterService, useValue: mockFirebaseRegistroAdapterService },
      ],
    });
    service = TestBed.inject(RegistroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registrarUsuario', () => {
    const testEmail = 'newuser@example.com';
    const testPassword = 'newpassword123';
    const testNombre = 'Nuevo Usuario';

    beforeEach(() => {
      // Configura las respuestas por defecto de los mocks para un flujo exitoso
      mockFirebaseRegistroAdapterService.firebaseCreateUserWithEmailAndPassword.and.resolveTo(mockUserCredential as unknown as UserCredential); // Cast a any para evitar problemas de tipos
      mockFirebaseRegistroAdapterService.firebaseSetUserDocument.and.resolveTo(); // setDoc no devuelve nada, solo resuelve
    });

    it('should call showWhileLoading from LoaderService', async () => {
      await service.registrarUsuario(testEmail, testPassword, testNombre);
      expect(mockLoaderService.showWhileLoading).toHaveBeenCalledWith(
        jasmine.any(Promise),
        'Registrando usuario...'
      );
    });

    it('should call firebaseCreateUserWithEmailAndPassword with correct credentials', async () => {
      await service.registrarUsuario(testEmail, testPassword, testNombre);
      expect(mockFirebaseRegistroAdapterService.firebaseCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        testEmail,
        testPassword
      );
    });

    it('should call firebaseSetUserDocument with correct user data', async () => {
      // Ejecuta la función del servicio
      await service.registrarUsuario(testEmail, testPassword, testNombre);

      // Verifica que firebaseSetUserDocument fue llamado
      expect(mockFirebaseRegistroAdapterService.firebaseSetUserDocument).toHaveBeenCalledWith(
        mockUserCredential.user.uid,
        jasmine.objectContaining({ // Usa objectContaining para comparar solo las propiedades importantes
          uid: mockUserCredential.user.uid,
          nombre: testNombre,
          email: testEmail,
          rol: ['usuario'],
          fechaCreacion: jasmine.any(String), // Espera que sea cualquier string
        })
      );
    });

    it('should handle errors during user creation', async () => {
      const authError = new Error('auth/email-already-in-use');
      mockFirebaseRegistroAdapterService.firebaseCreateUserWithEmailAndPassword.and.rejectWith(authError);

      await expectAsync(service.registrarUsuario(testEmail, testPassword, testNombre)).toBeRejectedWith(authError);
      expect(mockFirebaseRegistroAdapterService.firebaseSetUserDocument).not.toHaveBeenCalled();
    });

    it('should handle errors during setting user document', async () => {
      const firestoreError = new Error('firestore/permission-denied');
      mockFirebaseRegistroAdapterService.firebaseSetUserDocument.and.rejectWith(firestoreError);

      await expectAsync(service.registrarUsuario(testEmail, testPassword, testNombre)).toBeRejectedWith(firestoreError);
      // create user should still have been called, but not setDoc
      expect(mockFirebaseRegistroAdapterService.firebaseCreateUserWithEmailAndPassword).toHaveBeenCalled();
    });
  });
});