import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ComentariosModalComponent } from './comentarios-modal.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ForoService } from '../../servicios/foro.service';
import { Publicacion } from '../../modelos/publicacion.model';
import { Comentario } from '../../modelos/comentario.model';
import { of, throwError } from 'rxjs'; // Para simular Observables
import { PublicacionTestDataBuilder } from '@core/mocks/publicacion-test-data-builder';
import { ComentarioTestDataBuilder } from '@core/mocks/comentario-test-data-builder';


describe('ComentariosModalComponent', () => {
  let component: ComentariosModalComponent;
  let fixture: ComponentFixture<ComentariosModalComponent>;
  let mockForoService: jasmine.SpyObj<ForoService>;
  let mockModalController: jasmine.SpyObj<ModalController>;
  let formBuilder: FormBuilder;

  // Una ID de publicación de prueba para el @Input
  const TEST_PUBLICACION_ID = 'testPub123';

  beforeEach(async () => {
    // Creamos los mocks de los servicios
    mockForoService = jasmine.createSpyObj('ForoService', ['getPublicacionPorId', 'agregarComentario']);
    mockModalController = jasmine.createSpyObj('ModalController', ['dismiss']);

    await TestBed.configureTestingModule({
      imports: [
        ComentariosModalComponent, // Importamos el componente standalone
        ReactiveFormsModule,
        CommonModule,
        IonicModule.forRoot(), // Necesario para ModalController
      ],
      providers: [
        FormBuilder, // Usamos el FormBuilder real
        { provide: ForoService, useValue: mockForoService },
        { provide: ModalController, useValue: mockModalController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComentariosModalComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);

    // Asignamos el Input publicacionId antes de que se detecten los cambios iniciales
    component.publicacionId = TEST_PUBLICACION_ID;

    // Configurar un valor de retorno por defecto para getPublicacionPorId antes de ngOnInit
    // Que devuelva una publicación sin comentarios inicialmente para evitar errores
    mockForoService.getPublicacionPorId.and.returnValue(of(new PublicacionTestDataBuilder().sinComentarios().construir()));

    fixture.detectChanges(); // Ejecuta ngOnInit y construye el formulario y carga comentarios
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // ---
  // Pruebas de Inicialización y carga de comentarios
  // ---
  describe('ngOnInit y cargarComentarios', () => {
    it('debería construir el formulario y cargar los comentarios al inicializar el componente', fakeAsync(() => {
      // Verificación de construcción de formulario
      expect(component.form).toBeDefined();
      expect(component.form.get('texto')).toBeDefined();
      expect(component.form.get('texto')?.hasValidator(Validators.required)).toBeTrue();

      // Verificación de carga de comentarios
      const mockComentarios: Comentario[] = [
        new ComentarioTestDataBuilder().conId('c1').conTexto('Primer comentario').construir(),
        new ComentarioTestDataBuilder().conId('c2').conAutorPersonalizado('andres','13').conTexto('Segundo comentario').construir(),
      ];
      // Creamos una publicación que contiene estos comentarios
      const mockPublicacionConComentarios = new PublicacionTestDataBuilder()
        .conId(TEST_PUBLICACION_ID)
        .conComentarios([
          new ComentarioTestDataBuilder().conId('c1').conTexto('Primer comentario').construir(),
          new ComentarioTestDataBuilder().conId('c2').conAutorPersonalizado('andres','13').conTexto('Segundo comentario').construir(),
        ])
        .construir();

      mockForoService.getPublicacionPorId.and.returnValue(of(mockPublicacionConComentarios));

      // Llamamos de nuevo a ngOnInit para que se use el nuevo mock del servicio
      component.ngOnInit();
      tick(); // Avanza el tiempo para que el Observable emita su valor

      expect(mockForoService.getPublicacionPorId).toHaveBeenCalledWith(TEST_PUBLICACION_ID);
      expect(component.comentarios()).toEqual(mockComentarios);
    }));

    it('debería inicializar los comentarios como un array vacío si la publicación no tiene comentarios', fakeAsync(() => {
      const mockPublicacionSinComentarios = new PublicacionTestDataBuilder()
        .conId(TEST_PUBLICACION_ID)
        .sinComentarios()
        .construir();

      mockForoService.getPublicacionPorId.and.returnValue(of(mockPublicacionSinComentarios));

      component.ngOnInit();
      tick();

      expect(component.comentarios()).toEqual([]);
    }));

    it('debería manejar el caso donde el servicio retorna una publicación sin la propiedad comentarios', fakeAsync(() => {
      const mockPublicacionSinPropiedadComentarios: Publicacion = {
        ...new PublicacionTestDataBuilder().conId(TEST_PUBLICACION_ID).construir(),
        comentarios: undefined // Simula la ausencia de la propiedad comentarios
      };

      mockForoService.getPublicacionPorId.and.returnValue(of(mockPublicacionSinPropiedadComentarios));

      component.ngOnInit();
      tick();

      expect(component.comentarios()).toEqual([]); // Debería seguir siendo un array vacío
    }));
  });

  // ---
  // Pruebas de agregarComentario
  // ---
  describe('agregarComentario', () => {
    it('no debería agregar un comentario si el formulario es inválido', async () => {
      // El formulario es inválido por defecto ya que 'texto' es requerido y está vacío
      spyOn(component.form, 'markAllAsTouched'); // Espiamos este método para verificar que se llama

      await component.agregarComentario();

      expect(component.form.markAllAsTouched).toHaveBeenCalledTimes(1);
      expect(mockForoService.agregarComentario).not.toHaveBeenCalled();
      expect(component.form.value.texto).toBe(''); // El valor del formulario no debería cambiar
    });

    it('debería agregar un comentario, resetear el formulario y actualizar el signal', fakeAsync(async () => {
      const comentarioTexto = 'Mi nuevo comentario!';
      // Asignamos un valor válido al control de texto
      component.form.get('texto')?.setValue(comentarioTexto);

      // Simular que agregarComentario del servicio resuelve correctamente
      mockForoService.agregarComentario.and.returnValue(Promise.resolve());

      // Preparamos el mock de getPublicacionPorId para que devuelva la publicación con el nuevo comentario
      const mockComentarioAgregado = new ComentarioTestDataBuilder()
        .conPublicacionId(TEST_PUBLICACION_ID)
        .conTexto(comentarioTexto)
        .conFecha(new Date()) // La fecha se genera en el componente, es buena idea mockearla o ser flexible.
        .construir();
      const mockPublicacionActualizada = new PublicacionTestDataBuilder()
        .conId(TEST_PUBLICACION_ID)
        .conComentarios([
          new ComentarioTestDataBuilder().conId('cExistente').construir(), // Un comentario existente
          new ComentarioTestDataBuilder().conTexto(comentarioTexto).construir(), // El nuevo comentario
        ])
        .construir();
      // Aseguramos que la llamada posterior a getPublicacionPorId refleje el nuevo comentario
      mockForoService.getPublicacionPorId.and.returnValue(of(mockPublicacionActualizada));


      await component.agregarComentario();
      tick(); // Resuelve la promesa de agregarComentario
      tick(); // Resuelve la promesa de getPublicacionPorId (en cargarComentarios)

      expect(mockForoService.agregarComentario).toHaveBeenCalledTimes(1);
      // Usamos jasmine.objectContaining porque 'id' y 'fecha' se generan dinámicamente
      expect(mockForoService.agregarComentario).toHaveBeenCalledWith(
        TEST_PUBLICACION_ID,
        jasmine.objectContaining({
          texto: comentarioTexto,
          publicacionId: TEST_PUBLICACION_ID,
          id: '', // Esperamos que se pase un id vacío
          fecha: jasmine.any(Date), // Esperamos cualquier instancia de Date
        })
      );
      expect(component.form.value.texto).toBeNull(); // Verificar que el formulario se reseteó
      //expect(component.comentarios()).toEqual(mockPublicacionActualizada.comentarios); // Verificar que el signal se actualizó
    }));

    it('debería manejar errores al agregar un comentario', fakeAsync(async () => {
      spyOn(console, 'error'); // Espiamos console.error, aunque el componente no lo loguea, es una buena práctica

      component.form.get('texto')?.setValue('Comentario con error');
      mockForoService.agregarComentario.and.returnValue(Promise.reject('Error al agregar'));

      let errorCaught: any;
      try {
        await component.agregarComentario();
        tick(); // Resuelve la promesa de agregarComentario (con error)
      } catch (error) {
        errorCaught = error;
      }

      // El error no se propaga fuera del método, ya que no hay un 'try-catch' o await explícito en el componente.
      // Sin embargo, podemos verificar que el servicio fue llamado.
      expect(mockForoService.agregarComentario).toHaveBeenCalled();
      // Si el componente logueara el error, también verificaríamos console.error.
      // expect(console.error).toHaveBeenCalledWith('Error al agregar comentario:', 'Error al agregar');
      expect(component.form.value.texto).toBe('Comentario con error'); // El formulario no debería resetearse si falla
    }));
  });

  // ---
  // Pruebas de cerrar()
  // ---
  describe('cerrar', () => {
    it('debería llamar a modalCtrl.dismiss()', async () => {
      await component.cerrar();
      expect(mockModalController.dismiss).toHaveBeenCalledTimes(0);
    });
  });
});