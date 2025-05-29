import { TestBed } from '@angular/core/testing';
import { SesionService } from './sesion.service';
import { Usuario } from '@core/models/usuario.model'; // Asegúrate de que la ruta sea correcta para tu modelo de Usuario

fdescribe('SesionService', () => {
  let service: SesionService;
  const CLAVE_SESION = 'usuario'; // Define la clave aquí para consistencia

  // Mock de sessionStorage
  let sessionStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    // Configura el mock para sessionStorage antes de cada prueba
    // Reemplaza los métodos de sessionStorage globalmente solo para estas pruebas
    spyOn(sessionStorage, 'setItem').and.callFake((key: string, value: string) => {
      sessionStorageMock[key] = value;
    });
    spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
      return sessionStorageMock[key] || null;
    });
    spyOn(sessionStorage, 'removeItem').and.callFake((key: string) => {
      delete sessionStorageMock[key];
    });
    spyOn(sessionStorage, 'clear').and.callFake(() => {
      sessionStorageMock = {};
    });

    TestBed.configureTestingModule({
      providers: [SesionService],
    });
    service = TestBed.inject(SesionService);

    // Limpia el mock de sessionStorage antes de cada prueba
    sessionStorageMock = {};
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('guardar', () => {
    it('debe guardar el objeto Usuario en sessionStorage como una cadena JSON', () => {
      const testUser: Usuario = {
        uid: '123',
        correo: 'test@example.com',
        nombre: 'Test User',
        rol: ['usuario'],
        fechaCreacion: '2023-01-01',
      };
      service.guardar(testUser);
      expect(sessionStorage.setItem).toHaveBeenCalledWith(CLAVE_SESION, JSON.stringify(testUser));
      expect(sessionStorageMock[CLAVE_SESION]).toEqual(JSON.stringify(testUser));
    });
  });

  describe('obtener', () => {
    it('debe devolver el objeto Usuario de sessionStorage si existe', () => {
      const storedUser: Usuario = {
        uid: '456',
        correo: 'stored@example.com',
        nombre: 'Stored User',
        rol: ['administrador'],
        fechaCreacion: '2023-02-01',
      };
      sessionStorageMock[CLAVE_SESION] = JSON.stringify(storedUser); // Simula que ya hay algo guardado

      const result = service.obtener();
      expect(sessionStorage.getItem).toHaveBeenCalledWith(CLAVE_SESION);
      expect(result).toEqual(storedUser);
    });

    it('debe devolver null si no hay un usuario guardado en sessionStorage', () => {
      // sessionStorageMock ya estará vacío debido al beforeEach
      const result = service.obtener();
      expect(sessionStorage.getItem).toHaveBeenCalledWith(CLAVE_SESION);
      expect(result).toBeNull();
    });

    it('debe devolver null si la data en sessionStorage no es un JSON válido', () => {
      sessionStorageMock[CLAVE_SESION] = 'invalid json';
      const result = service.obtener();
      // Esto probará si tu servicio maneja el error de JSON.parse o simplemente devuelve null.
      // Si JSON.parse lanza un error, la prueba fallará a menos que el servicio lo capture.
      // Asumiendo que `JSON.parse(data)` lanzaría un error y esto afectaría la prueba.
      // Para un escenario más robusto, podrías mockear JSON.parse o asegurar que el servicio maneja el error.
      // Por simplicidad, si la implementación original no maneja el error de JSON.parse, esta prueba lo expondrá.
      expect(sessionStorage.getItem).toHaveBeenCalledWith(CLAVE_SESION);
      expect(result).toBeNull(); // Esto esperaría que devuelva null incluso con JSON inválido. Si lanza error, la prueba fallará.
    });
  });

  describe('eliminar', () => {
    it('debe eliminar el usuario de sessionStorage', () => {
      // Primero, guardamos algo para asegurarnos de que hay algo que eliminar
      sessionStorageMock[CLAVE_SESION] = JSON.stringify({ uid: '789' });

      service.eliminar();
      expect(sessionStorage.removeItem).toHaveBeenCalledWith(CLAVE_SESION);
      expect(sessionStorageMock[CLAVE_SESION]).toBeUndefined();
    });
  });

  describe('existe', () => {
    it('debe devolver true si hay un usuario guardado', () => {
      sessionStorageMock[CLAVE_SESION] = JSON.stringify({ uid: 'exists' });
      const result = service.existe();
      expect(sessionStorage.getItem).toHaveBeenCalledWith(CLAVE_SESION);
      expect(result).toBeTrue();
    });

    it('debe devolver false si no hay un usuario guardado', () => {
      const result = service.existe();
      expect(sessionStorage.getItem).toHaveBeenCalledWith(CLAVE_SESION);
      expect(result).toBeFalse();
    });
  });
});