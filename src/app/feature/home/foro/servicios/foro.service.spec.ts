import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ForoService } from './foro.service';
import { LoaderService } from '@core/loader/loader.service';
import { SesionService } from '@core/autenticacion/sesion.service';
import { ForoFirestoreAdapter } from '@core/adapters/foro-firestore-adapter.service';
import { Publicacion } from '../modelos/publicacion.model';
import { Comentario } from '../modelos/comentario.model';

import { Observable, of, throwError } from 'rxjs';
import { UsuarioTestDataBuilder } from '@core/mocks/usuario-test-data-builder';
import { PublicacionTestDataBuilder } from '@core/mocks/publicacion-test-data-builder';
import { ComentarioTestDataBuilder } from '@core/mocks/comentario-test-data-builder';

describe('ForoService', () => {
  let service: ForoService;
  let mockLoaderService: jasmine.SpyObj<LoaderService>;
  let mockSesionService: jasmine.SpyObj<SesionService>;
  let mockForoFirestoreAdapter: jasmine.SpyObj<ForoFirestoreAdapter>;

  // Mock de usuario para la sesión
  const MOCK_USER_UID = 'user123';
  const MOCK_USUARIO = new UsuarioTestDataBuilder().conUuid(MOCK_USER_UID).construir();



  beforeEach(() => {
    mockLoaderService = jasmine.createSpyObj('LoaderService', ['showWhileLoading']);
    // showWhileLoading simplemente pasa la promesa o el observable sin envolver
    mockLoaderService.showWhileLoading.and.callFake((promise: Promise<any>, message: string) => promise);
    mockSesionService = jasmine.createSpyObj('SesionService', ['obtener']);
    mockSesionService.obtener.and.returnValue(MOCK_USUARIO); // Por defecto, hay un usuario logueado

    mockForoFirestoreAdapter = jasmine.createSpyObj('ForoFirestoreAdapter', [
      'getPublicaciones',
      'getPublicacionPorId',
      'crearPublicacion',
      'actualizarPublicacion',
      'eliminarPublicacion',
      'getComentarios',
      'agregarComentarioToArray',
      'eliminarComentarioFromArray',
      'updateReacciones',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ForoService,
        { provide: LoaderService, useValue: mockLoaderService },
        { provide: SesionService, useValue: mockSesionService },
        { provide: ForoFirestoreAdapter, useValue: mockForoFirestoreAdapter },
      ],
    });

    service = TestBed.inject(ForoService);
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  // ---
  // Pruebas para getPublicaciones
  // ---
  describe('getPublicaciones', () => {
    it('debería obtener todas las publicaciones del adapter', () => {
      const mockPublicaciones = [new PublicacionTestDataBuilder().construir()];
      mockForoFirestoreAdapter.getPublicaciones.and.returnValue(of(mockPublicaciones));

      service.getPublicaciones().subscribe(publicaciones => {
        expect(publicaciones).toEqual(mockPublicaciones);
      });

      expect(mockForoFirestoreAdapter.getPublicaciones).toHaveBeenCalledTimes(1);
    });
  });

  // ---
  // Pruebas para getPublicacionPorId
  // ---
  describe('getPublicacionPorId', () => {
    it('debería obtener una publicación por su ID del adapter', () => {
      const mockPublicacion = new PublicacionTestDataBuilder().conId('pub1').construir();
      mockForoFirestoreAdapter.getPublicacionPorId.and.returnValue(of(mockPublicacion));

      service.getPublicacionPorId('pub1').subscribe(publicacion => {
        expect(publicacion).toEqual(mockPublicacion);
      });

      expect(mockForoFirestoreAdapter.getPublicacionPorId).toHaveBeenCalledWith('pub1');
    });
  });

  // ---
  // Pruebas para crearPublicacion
  // ---
  describe('crearPublicacion', () => {
    it('debería crear una publicación con el autor de la sesión y mostrar el loader', fakeAsync(async () => {
      const newPublicacionData: Publicacion = new PublicacionTestDataBuilder().sinAutor().construir();
      mockForoFirestoreAdapter.crearPublicacion.and.returnValue(Promise.resolve());

      await service.crearPublicacion(newPublicacionData);
      tick(); // Resuelve la promesa de crearPublicacion

      expect(mockLoaderService.showWhileLoading).toHaveBeenCalledWith(
        jasmine.any(Promise),
        'Guardando publicación...'
      );
      expect(mockSesionService.obtener).toHaveBeenCalledTimes(1);
      expect(mockForoFirestoreAdapter.crearPublicacion).toHaveBeenCalledWith(
        jasmine.objectContaining({
          ...newPublicacionData,
          autor: MOCK_USUARIO, // Verifica que el autor se asignó correctamente
        })
      );
    }));

    it('debería lanzar un error si no se puede obtener el usuario de la sesión', async () => {
      mockSesionService.obtener.and.returnValue(null); // Simula que no hay usuario

      let errorCaught: any;
      try {
        await service.crearPublicacion(new PublicacionTestDataBuilder().construir());
      } catch (error) {
        errorCaught = error;
      }
      expect(errorCaught instanceof Error).toBeTrue();
      expect(errorCaught.message).toBe('No se pudo obtener el usuario de la sesión.');
      expect(mockForoFirestoreAdapter.crearPublicacion).not.toHaveBeenCalled();
      expect(mockLoaderService.showWhileLoading).not.toHaveBeenCalled();
    });
  });

  // ---
  // Pruebas para actualizarPublicacion
  // ---
  describe('actualizarPublicacion', () => {
    it('debería actualizar una publicación y mostrar el loader', fakeAsync(async () => {
      const publicacionId = 'pub123';
      const updatedData: Partial<Publicacion> = { titulo: 'Nuevo Título' };
      mockForoFirestoreAdapter.actualizarPublicacion.and.returnValue(Promise.resolve());

      await service.actualizarPublicacion(publicacionId, updatedData);
      tick();

      expect(mockLoaderService.showWhileLoading).toHaveBeenCalledWith(
        jasmine.any(Promise),
        'Actualizando publicación...'
      );
      expect(mockForoFirestoreAdapter.actualizarPublicacion).toHaveBeenCalledWith(publicacionId, updatedData);
    }));
  });

  // ---
  // Pruebas para eliminarPublicacion
  // ---
  describe('eliminarPublicacion', () => {
    it('debería eliminar una publicación y mostrar el loader', fakeAsync(async () => {
      const publicacionId = 'pubToDelete';
      mockForoFirestoreAdapter.eliminarPublicacion.and.returnValue(Promise.resolve());

      await service.eliminarPublicacion(publicacionId);
      tick();

      expect(mockLoaderService.showWhileLoading).toHaveBeenCalledWith(
        jasmine.any(Promise),
        'Eliminando publicación...'
      );
      expect(mockForoFirestoreAdapter.eliminarPublicacion).toHaveBeenCalledWith(publicacionId);
    }));
  });

  // ---
  // Pruebas para getComentarios
  // ---
  describe('getComentarios', () => {
    it('debería obtener los comentarios de una publicación y mostrar el loader', fakeAsync(async () => {
      const publicacionId = 'pubWithComments';
      const mockComentarios = [new ComentarioTestDataBuilder().construir()];
      mockForoFirestoreAdapter.getComentarios.and.returnValue(Promise.resolve(mockComentarios));

      const result = await service.getComentarios(publicacionId);
      tick();

      expect(mockLoaderService.showWhileLoading).toHaveBeenCalledWith(
        jasmine.any(Promise),
        'Cargando comentarios...'
      );
      expect(mockForoFirestoreAdapter.getComentarios).toHaveBeenCalledWith(publicacionId);
      expect(result).toEqual(mockComentarios);
    }));
  });

  // ---
  // Pruebas para agregarComentario
  // ---
  describe('agregarComentario', () => {
    it('debería agregar un comentario con el autor de la sesión a la publicación y mostrar el loader', fakeAsync(async () => {
      const publicacionId = 'pubAddComment';
      const newComentario: Comentario = new ComentarioTestDataBuilder().conPublicacionId(publicacionId).sinAutor().construir();
      mockForoFirestoreAdapter.agregarComentarioToArray.and.returnValue(Promise.resolve());

      await service.agregarComentario(publicacionId, newComentario);
      tick();

      expect(mockLoaderService.showWhileLoading).toHaveBeenCalledWith(
        jasmine.any(Promise),
        'Agregando comentario...'
      );
      expect(mockSesionService.obtener).toHaveBeenCalledTimes(1);
      expect(mockForoFirestoreAdapter.agregarComentarioToArray).toHaveBeenCalledWith(
        publicacionId,
        jasmine.objectContaining({
          ...newComentario,
          autor: MOCK_USUARIO, // Verifica que el autor se asignó correctamente
        })
      );
    }));

    it('debería lanzar un error si no se puede obtener el usuario de la sesión al agregar comentario', async () => {
      mockSesionService.obtener.and.returnValue(null);

      let errorCaught: any;
      try {
        await service.agregarComentario('someId', new ComentarioTestDataBuilder().construir());
      } catch (error) {
        errorCaught = error;
      }
      expect(errorCaught instanceof Error).toBeTrue();
      expect(errorCaught.message).toBe('No se pudo obtener el usuario de la sesión.');
      expect(mockForoFirestoreAdapter.agregarComentarioToArray).not.toHaveBeenCalled();
    });
  });

  // ---
  // Pruebas para eliminarComentario
  // ---
  describe('eliminarComentario', () => {
    it('debería eliminar un comentario de la publicación y mostrar el loader', fakeAsync(async () => {
      const publicacionId = 'pubRemoveComment';
      const comentarioToDelete: Comentario = new ComentarioTestDataBuilder().conPublicacionId(publicacionId).construir();
      mockForoFirestoreAdapter.eliminarComentarioFromArray.and.returnValue(Promise.resolve());

      await service.eliminarComentario(publicacionId, comentarioToDelete);
      tick();

      expect(mockLoaderService.showWhileLoading).toHaveBeenCalledWith(
        jasmine.any(Promise),
        'Eliminando comentario...'
      );
      expect(mockForoFirestoreAdapter.eliminarComentarioFromArray).toHaveBeenCalledWith(publicacionId, comentarioToDelete);
    }));
  });

  // ---
  // Pruebas para toggleReaccion
  // ---
  describe('toggleReaccion', () => {
    let publicacionExistente: Publicacion;

    beforeEach(() => {
      // Configuramos el mock de getPublicacionPorId para que devuelva una publicación con likes/dislikes
      publicacionExistente = new PublicacionTestDataBuilder()
        .conId('pubReacciones')
        .conLikes([MOCK_USER_UID, 'otroUser1'])
        .conDislikes(['otroUser2'])
        .construir();
      mockForoFirestoreAdapter.getPublicacionPorId.and.returnValue(of(publicacionExistente));
      mockForoFirestoreAdapter.updateReacciones.and.returnValue(Promise.resolve());
      mockSesionService.obtener.and.returnValue(MOCK_USUARIO); // Aseguramos que siempre haya un usuario logueado
    });

    it('debería agregar un like si el usuario no lo tenía y no tenía dislike', fakeAsync(async () => {
      // Usuario no tiene like ni dislike inicialmente en esta simulación
      publicacionExistente.likes = ['otroUser1'];
      publicacionExistente.dislikes = ['otroUser2'];
      mockForoFirestoreAdapter.getPublicacionPorId.and.returnValue(of(publicacionExistente));

      await service.toggleReaccion('pubReacciones', 'meGusta');
      tick(); // getPublicacionPorId
      tick(); // updateReacciones

      expect(mockForoFirestoreAdapter.updateReacciones).toHaveBeenCalledWith(
        'pubReacciones',
        jasmine.arrayContaining([MOCK_USER_UID, 'otroUser1']), // Debe tener el nuevo like
        ['otroUser2'] // Dislikes sin cambios
      );
    }));

    it('debería quitar un like si el usuario ya lo tenía', fakeAsync(async () => {
      // Usuario ya tiene like
      publicacionExistente.likes = ['otroUser1', MOCK_USER_UID];
      publicacionExistente.dislikes = ['otroUser2'];
      mockForoFirestoreAdapter.getPublicacionPorId.and.returnValue(of(publicacionExistente));

      await service.toggleReaccion('pubReacciones', 'meGusta');
      tick();
      tick();

      expect(mockForoFirestoreAdapter.updateReacciones).toHaveBeenCalledWith(
        'pubReacciones',
        ['otroUser1'], // El like del usuario debe haber sido eliminado
        ['otroUser2']
      );
    }));

    it('debería agregar un like y quitar un dislike si el usuario tenía dislike', fakeAsync(async () => {
      // Usuario tiene dislike
      publicacionExistente.likes = ['otroUser1'];
      publicacionExistente.dislikes = ['otroUser2', MOCK_USER_UID];
      mockForoFirestoreAdapter.getPublicacionPorId.and.returnValue(of(publicacionExistente));

      await service.toggleReaccion('pubReacciones', 'meGusta');
      tick();
      tick();

      expect(mockForoFirestoreAdapter.updateReacciones).toHaveBeenCalledWith(
        'pubReacciones',
        jasmine.arrayContaining([MOCK_USER_UID, 'otroUser1']), // Debe tener el nuevo like
        ['otroUser2'] // El dislike del usuario debe haber sido eliminado
      );
    }));

    it('debería agregar un dislike si el usuario no lo tenía y no tenía like', fakeAsync(async () => {
      // Usuario no tiene like ni dislike inicialmente
      publicacionExistente.likes = ['otroUser1'];
      publicacionExistente.dislikes = ['otroUser2'];
      mockForoFirestoreAdapter.getPublicacionPorId.and.returnValue(of(publicacionExistente));

      await service.toggleReaccion('pubReacciones', 'noMeGusta');
      tick();
      tick();

      expect(mockForoFirestoreAdapter.updateReacciones).toHaveBeenCalledWith(
        'pubReacciones',
        ['otroUser1'], // Likes sin cambios
        jasmine.arrayContaining([MOCK_USER_UID, 'otroUser2']) // Debe tener el nuevo dislike
      );
    }));

    it('debería quitar un dislike si el usuario ya lo tenía', fakeAsync(async () => {
      // Usuario ya tiene dislike
      publicacionExistente.likes = ['otroUser1'];
      publicacionExistente.dislikes = ['otroUser2', MOCK_USER_UID];
      mockForoFirestoreAdapter.getPublicacionPorId.and.returnValue(of(publicacionExistente));

      await service.toggleReaccion('pubReacciones', 'noMeGusta');
      tick();
      tick();

      expect(mockForoFirestoreAdapter.updateReacciones).toHaveBeenCalledWith(
        'pubReacciones',
        ['otroUser1'],
        ['otroUser2'] // El dislike del usuario debe haber sido eliminado
      );
    }));

    it('debería agregar un dislike y quitar un like si el usuario tenía like', fakeAsync(async () => {
      // Usuario tiene like
      publicacionExistente.likes = ['otroUser1', MOCK_USER_UID];
      publicacionExistente.dislikes = ['otroUser2'];
      mockForoFirestoreAdapter.getPublicacionPorId.and.returnValue(of(publicacionExistente));

      await service.toggleReaccion('pubReacciones', 'noMeGusta');
      tick();
      tick();

      expect(mockForoFirestoreAdapter.updateReacciones).toHaveBeenCalledWith(
        'pubReacciones',
        ['otroUser1'], // El like del usuario debe haber sido eliminado
        jasmine.arrayContaining([MOCK_USER_UID, 'otroUser2']) // Debe tener el nuevo dislike
      );
    }));

    it('debería manejar el caso donde la publicación no tiene likes ni dislikes', fakeAsync(async () => {
      publicacionExistente.likes = [];
      publicacionExistente.dislikes = [];
      mockForoFirestoreAdapter.getPublicacionPorId.and.returnValue(of(publicacionExistente));

      await service.toggleReaccion('pubReacciones', 'meGusta');
      tick();
      tick();

      expect(mockForoFirestoreAdapter.updateReacciones).toHaveBeenCalledWith(
        'pubReacciones',
        [MOCK_USER_UID],
        []
      );
    }));

    
    it('debería manejar errores al obtener la publicación en toggleReaccion', fakeAsync(async () => {
      mockForoFirestoreAdapter.getPublicacionPorId.and.returnValue(throwError(() => new Error('Error de obtención de publicación')));

      let errorCaught: any;
      try {
        await service.toggleReaccion('pubReacciones', 'meGusta');
        tick();
      } catch (error) {
        errorCaught = error;
      }
      expect(errorCaught instanceof Error).toBeTrue();
      expect(errorCaught.message).toBe('Error de obtención de publicación');
      expect(mockForoFirestoreAdapter.updateReacciones).not.toHaveBeenCalled();
    }));
  });
});
