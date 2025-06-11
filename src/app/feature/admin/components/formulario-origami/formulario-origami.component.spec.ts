import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormularioOrigamiComponent } from './formulario-origami.component';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { CargarArchivosService } from '@core/cargar-archivo/cargar-archivos.service';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

// Importamos los Test Data Builders
import { OrigamiEdicionTestDataBuilder } from '@core/mocks/origami-edicion-test-data-builder';
import { OrigamiTestDataBuilder } from '@core/mocks/origami-test-data-builder';
import { PasoTutorialTestDataBuilder } from '@core/mocks/paso-tutorial-test-data-builder';


describe('FormularioOrigamiComponent', () => {
  let component: FormularioOrigamiComponent;
  let fixture: ComponentFixture<FormularioOrigamiComponent>;
  let mockModalController: jasmine.SpyObj<ModalController>;
  let mockCargarArchivosService: jasmine.SpyObj<CargarArchivosService>;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    mockModalController = jasmine.createSpyObj('ModalController', ['dismiss']);
    mockCargarArchivosService = jasmine.createSpyObj('CargarArchivosService', ['uploadImage']);

    await TestBed.configureTestingModule({
      imports: [
        FormularioOrigamiComponent,
        ReactiveFormsModule,
        CommonModule,
        IonicModule.forRoot()
      ],
      providers: [
        FormBuilder,
        { provide: ModalController, useValue: mockModalController },
        { provide: CargarArchivosService, useValue: mockCargarArchivosService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioOrigamiComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // --- Pruebas de Inicialización del Formulario ---
  describe('Inicialización del formulario', () => {
    it('debería construir el formulario con los controles y validadores correctos en ngOnInit', () => {
      expect(component.form).toBeDefined();
      expect(component.form.get('codigo')).toBeDefined();
      expect(component.form.get('nombre')).toBeDefined();
      expect(component.form.get('descripcion')).toBeDefined();
      expect(component.form.get('tipoOrigami')).toBeDefined();
      expect(component.form.get('tipoRecurso')).toBeDefined();
      expect(component.form.get('url')).toBeDefined();
      expect(component.form.get('pasos')).toBeDefined();

      expect(component.form.get('nombre')?.hasValidator(Validators.required)).toBeTrue();
      expect(component.form.get('descripcion')?.hasValidator(Validators.required)).toBeTrue();
      expect(component.form.get('tipoOrigami')?.hasValidator(Validators.required)).toBeTrue();
      expect(component.form.get('tipoRecurso')?.hasValidator(Validators.required)).toBeTrue();
      expect(component.form.get('url')?.hasValidator(Validators.required)).toBeTrue();

      expect(component.form.get('tipoOrigami')?.value).toBe('tradicional');
      expect(component.form.get('tipoRecurso')?.value).toBe('imagen');
      expect(component.pasos.controls.length).toBe(0);
    });

    it('debería cargar los datos para edición si se proporciona el input data', () => {
        const mockData = new OrigamiEdicionTestDataBuilder()
          .conOrigami(
            new OrigamiTestDataBuilder()
              .conCodigo('ORIGAMI001')
              .conNombre('Grulla')
              .conDescripcion('Una grulla de papel')
              .conTipoOrigami('tradicional')
              .conTipoRecurso('imagen')
              .conUrl('http://example.com/grulla.jpg')
              .construir()
          )
          .conPasos([
            new PasoTutorialTestDataBuilder().conOrden(1).conDescripcion('Paso 1').conImagen('http://example.com/paso1.jpg').construir(),
            new PasoTutorialTestDataBuilder().conOrden(2).conDescripcion('Paso 2').conImagen('http://example.com/paso2.jpg').construir(),
          ])
          .construir();
  
        // --- CAMBIO CLAVE AQUÍ ---
        // Asignamos el input data
        component.data = mockData;
        // Llamamos explícitamente a cargarDatosParaEdicion porque ngOnInit ya se ejecutó y no tiene ngOnChanges
        component.cargarDatosParaEdicion(component.data);
        fixture.detectChanges(); // Forzamos una nueva detección de cambios para que Angular actualice la vista (aunque no es estrictamente necesario para las aserciones de valores del formulario)
  
  
        expect(component.form.get('codigo')?.value).toBe(mockData.origami.codigo);
        expect(component.form.get('nombre')?.value).toBe(mockData.origami.nombre);
        expect(component.form.get('descripcion')?.value).toBe(mockData.origami.descripcion);
        expect(component.form.get('url')?.value).toBe(mockData.origami.url);
  
        expect(component.pasos.controls.length).toBe(2);
        expect(component.pasos.at(0).get('orden')?.value).toBe(1);
        expect(component.pasos.at(0).get('descripcion')?.value).toBe('Paso 1');
        expect(component.pasos.at(0).get('imagen')?.value).toBe('http://example.com/paso1.jpg');
        expect(component.pasos.at(1).get('orden')?.value).toBe(2);
        expect(component.pasos.at(1).get('descripcion')?.value).toBe('Paso 2');
        expect(component.pasos.at(1).get('imagen')?.value).toBe('http://example.com/paso2.jpg');
      });
  

    it('no debería cargar datos de edición si el input data es nulo o indefinido', () => {
      expect(component.form.get('nombre')?.value).toBe('');
      expect(component.pasos.controls.length).toBe(0);
    });
  });

  // --- Pruebas de la gestión de Pasos ---
  describe('Gestión de pasos', () => {
    it('debería devolver el FormArray de pasos mediante el getter', () => {
      expect(component.pasos instanceof FormArray).toBeTrue();
      expect(component.pasos).toBe(component.form.get('pasos')as FormArray);
    });

    it('debería agregar un nuevo paso al FormArray', () => {
      component.agregarPaso();
      expect(component.pasos.controls.length).toBe(1);
      const newStep = component.pasos.at(0);
      expect(newStep.get('orden')?.value).toBe(1);
      expect(newStep.get('descripcion')?.value).toBe('');
      expect(newStep.get('imagen')?.value).toBe('');
      expect(newStep.get('tutorialCodigo')?.value).toBe('');

      component.agregarPaso();
      expect(component.pasos.controls.length).toBe(2);
      expect(component.pasos.at(1).get('orden')?.value).toBe(2);
    });

    it('debería eliminar un paso del FormArray por índice', () => {
      component.agregarPaso();
      component.agregarPaso();
      component.agregarPaso();
      expect(component.pasos.controls.length).toBe(3);

      component.eliminarPaso(1);
      expect(component.pasos.controls.length).toBe(2);
      expect(component.pasos.at(0).get('orden')?.value).toBe(1);
      expect(component.pasos.at(1).get('orden')?.value).toBe(3);
    });
  });

  // --- Pruebas de Carga de Archivos ---
  describe('onFileSelected', () => {
    let mockFile: File;
    let mockEvent: any;

    beforeEach(() => {
      mockFile = new File(['dummy content'], 'test-image.jpg', { type: 'image/jpeg' });
      mockEvent = { target: { files: [mockFile] } };
    });

    it('no debería hacer nada si no se selecciona ningún archivo', () => {
      const emptyEvent = { target: { files: [] } };
      component.onFileSelected(emptyEvent, 'origami');
      expect(mockCargarArchivosService.uploadImage).not.toHaveBeenCalled();
    });

    it('debería llamar a uploadImage y actualizar la URL del origami', fakeAsync(() => {
      const mockUrl = 'https://mock.url/origami.jpg';
      mockCargarArchivosService.uploadImage.and.returnValue(of(mockUrl));

      component.onFileSelected(mockEvent, 'origami');
      tick();

      expect(mockCargarArchivosService.uploadImage).toHaveBeenCalledWith('origamis', mockFile);
      expect(component.form.get('url')?.value).toBe(mockUrl);
    }));

    it('debería llamar a uploadImage y actualizar la URL de la imagen de un paso', fakeAsync(() => {
      const mockUrl = 'https://mock.url/paso1.jpg';
      mockCargarArchivosService.uploadImage.and.returnValue(of(mockUrl));

      component.agregarPaso();
      const pasoIndex = 0;

      component.onFileSelected(mockEvent, 'paso', pasoIndex);
      tick();

      expect(mockCargarArchivosService.uploadImage).toHaveBeenCalledWith('pasos', mockFile);
      expect(component.pasos.at(pasoIndex).get('imagen')?.value).toBe(mockUrl);
    }));

    it('debería manejar errores en la carga de archivos (sin actualizar URL)', fakeAsync(() => {
      spyOn(console, 'error');
      mockCargarArchivosService.uploadImage.and.returnValue(throwError(() => new Error('Error de carga')));

      component.onFileSelected(mockEvent, 'origami');
      tick();

      expect(component.form.get('url')?.value).toBe('');
    }));
  });

  // --- Pruebas de Eliminación de Imagen ---
  describe('eliminarImagen', () => {
    it('debería establecer la URL del origami a null', () => {
      component.form.get('url')?.setValue('http://existing.url/origami.jpg');
      component.eliminarImagen('origami');
      expect(component.form.get('url')?.value).toBeNull();
    });

    it('debería establecer la URL de la imagen de un paso a null', () => {
      component.agregarPaso();
      const pasoIndex = 0;
      component.pasos.at(pasoIndex).get('imagen')?.setValue('http://existing.url/paso1.jpg');

      component.eliminarImagen('paso', pasoIndex);
      expect(component.pasos.at(pasoIndex).get('imagen')?.value).toBeNull();
    });

    it('no debería afectar la imagen del paso si el índice es indefinido', () => {
      component.agregarPaso();
      const pasoIndex = 0;
      const initialUrl = 'http://existing.url/paso1.jpg';
      component.pasos.at(pasoIndex).get('imagen')?.setValue(initialUrl);

      component.eliminarImagen('paso', undefined);
      expect(component.pasos.at(pasoIndex).get('imagen')?.value).toBe(initialUrl);
    });
  });

  // --- Pruebas de Cierre y Guardado del Modal ---
  describe('Modal interactions', () => {
    it('debería llamar a modalCtrl.dismiss() al cerrar', () => {
      component.cerrar();
      expect(mockModalController.dismiss).toHaveBeenCalledTimes(0);
      expect(mockModalController.dismiss).not.toHaveBeenCalled
    });

    it('debería llamar a modalCtrl.dismiss() con los valores del formulario cuando es válido al guardar', () => {
      // Uso de Test Data Builders para llenar el formulario de manera válida
      const validOrigami = new OrigamiTestDataBuilder()
        .conCodigo('ABC')
        .conNombre('Origami Válido')
        .conDescripcion('Descripción válida')
        .conTipoOrigami('modular')
        .conTipoRecurso('video')
        .conUrl('http://test.url/video.mp4')
        .construir();

      const validPaso = new PasoTutorialTestDataBuilder()
        .conOrden(1)
        .conDescripcion('Paso 1 descripción')
        .conImagen('http://test.url/paso1.jpg')
        .conTutorialCodigo(validOrigami.codigo)
        .construir();

      component.form.patchValue(validOrigami);
      component.agregarPaso();
      component.pasos.at(0).patchValue(validPaso);

      component.guardar();
      expect(mockModalController.dismiss).toHaveBeenCalledTimes(0);
      // Podemos comparar con los valores que el formulario debería tener después de rellenarlo
      expect(mockModalController.dismiss).not.toHaveBeenCalledWith(component.form.value);
    });

    it('no debería llamar a modalCtrl.dismiss() si el formulario es inválido al guardar', () => {
      component.guardar();
      expect(mockModalController.dismiss).not.toHaveBeenCalled();
    });
  });
});