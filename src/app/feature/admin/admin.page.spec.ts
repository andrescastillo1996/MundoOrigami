import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AdminPage } from './admin.page';
import {
  ModalController,
  AlertController,
  ToastController,
  IonicModule,
} from '@ionic/angular';
import { AdministrarOrigamiService } from './services/administrar-origami.service';
import { AutenticacionService } from '@core/autenticacion/autenticacion.service';
import { FormularioOrigamiComponent } from './components/formulario-origami/formulario-origami.component';
import { OrigamiEdicion } from './models/origami-edicion';
import { OrigamiEdicionTestDataBuilder } from '@core/mocks/origami-edicion-test-data-builder';
import { OrigamiTestDataBuilder } from '@core/mocks/origami-test-data-builder';
import { PasoTutorialTestDataBuilder } from '@core/mocks/paso-tutorial-test-data-builder';
import { of } from 'rxjs'; // Para simular observables
import { CargarArchivosService } from '@core/cargar-archivo/cargar-archivos.service';

describe('AdminPage', () => {
  let component: AdminPage;
  let fixture: ComponentFixture<AdminPage>;
  let mockModalController: jasmine.SpyObj<ModalController>;
  let mockAlertController: jasmine.SpyObj<AlertController>;
  let mockToastController: jasmine.SpyObj<ToastController>;
  let mockAdministrarOrigamiService: jasmine.SpyObj<AdministrarOrigamiService>;
  let mockAutenticacionService: jasmine.SpyObj<AutenticacionService>;
  let mockCargarArchivosService: jasmine.SpyObj<CargarArchivosService>;

  // Mocks de instancias de Ionic para simular su comportamiento
  let mockModalInstance: jasmine.SpyObj<HTMLIonModalElement>;
  let mockAlertInstance: jasmine.SpyObj<HTMLIonAlertElement>;
  let mockToastInstance: jasmine.SpyObj<HTMLIonToastElement>;

  beforeEach(async () => {
    // Inicializar SpyObjs para los servicios
    mockModalController = jasmine.createSpyObj('ModalController', ['create']);
    mockAlertController = jasmine.createSpyObj('AlertController', ['create']);
    mockToastController = jasmine.createSpyObj('ToastController', ['create']);
    mockAdministrarOrigamiService = jasmine.createSpyObj(
      'AdministrarOrigamiService',
      ['obtenerOrigamisConPasos', 'agregarOrigamiConPasos', 'actualizarOrigamiConPasos', 'eliminarOrigamiConPasos']
    );
    mockAutenticacionService = jasmine.createSpyObj('AutenticacionService', ['cerrarSesion']);
    mockCargarArchivosService = jasmine.createSpyObj('CargarArchivosService', ['uploadImage']);

    // Configurar mocks de instancias de Ionic
    mockModalInstance = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
    mockAlertInstance = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
    mockToastInstance = jasmine.createSpyObj('HTMLIonToastElement', ['present']);


    // Asegurarse de que create() de los controllers devuelva las instancias mock
    mockModalController.create.and.returnValue(Promise.resolve(mockModalInstance));
    mockAlertController.create.and.returnValue(Promise.resolve(mockAlertInstance));
    mockToastController.create.and.returnValue(Promise.resolve(mockToastInstance));

    await TestBed.configureTestingModule({
      imports: [AdminPage, IonicModule.forRoot()], // Importamos el componente standalone y IonicModule
      providers: [
        { provide: ModalController, useValue: mockModalController },
        { provide: AlertController, useValue: mockAlertController },
        { provide: ToastController, useValue: mockToastController },
        { provide: AdministrarOrigamiService, useValue: mockAdministrarOrigamiService },
        { provide: AutenticacionService, useValue: mockAutenticacionService },
        { provide: CargarArchivosService, useValue: mockCargarArchivosService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPage);
    component = fixture.componentInstance;

    // Configurar un valor de retorno por defecto para cargarOrigamis en ngOnInit
    mockAdministrarOrigamiService.obtenerOrigamisConPasos.and.returnValue(Promise.resolve([]));

    fixture.detectChanges(); // Llama a ngOnInit, que a su vez llama a cargarOrigamis()
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // ---
  // Pruebas de ngOnInit y Carga Inicial
  // ---
  describe('ngOnInit y cargarOrigamis', () => {
    it('debería cargar los origamis al inicializar el componente', fakeAsync(() => {
      const mockOrigamis = [
        new OrigamiEdicionTestDataBuilder().construir(),
        new OrigamiEdicionTestDataBuilder().conOrigami(new OrigamiTestDataBuilder().conCodigo('O2').construir()).construir(),
      ];
      mockAdministrarOrigamiService.obtenerOrigamisConPasos.and.returnValue(Promise.resolve(mockOrigamis));

      // Re-inicializar el componente para que ngOnInit se ejecute con el nuevo mock
      component.ngOnInit();
      tick(); // Resuelve la promesa de obtenerOrigamisConPasos

      expect(mockAdministrarOrigamiService.obtenerOrigamisConPasos).toHaveBeenCalledTimes(2);
      expect(component.origamis).toEqual(mockOrigamis);
    }));
  });



  describe('mostrarToast()', () => {
    it('debería crear y presentar un toast con el mensaje correcto', async () => {
      const testMessage = 'Mensaje de prueba del toast';
      await component['mostrarToast'](testMessage); // Accedemos al método privado

      expect(mockToastController.create).toHaveBeenCalledWith({
        message: testMessage,
        duration: 2000,
        position: 'bottom',
        color: 'success',
      });
      expect(mockToastInstance.present).toHaveBeenCalled();
    });
  });


  describe('construirOrigami()', () => {
    it('debería construir un objeto Origami correctamente desde los datos del formulario', () => {
      const mockFormData = {
        codigo: 'ABC',
        nombre: 'Test Origami',
        descripcion: 'Descripción de prueba',
        tipoOrigami: 'tradicional',
        tipoRecurso: 'imagen',
        url: 'http://test.url/img.jpg',
        // 'pasos' no es parte del objeto Origami final, solo del formulario
        pasos: [],
      };
      const expectedOrigami = {
        codigo: 'ABC',
        nombre: 'Test Origami',
        descripcion: 'Descripción de prueba',
        tipoOrigami: 'tradicional',
        estado: 'ACTIVO', // Este es un valor hardcodeado en el componente
        tipoRecurso: 'imagen',
        url: 'http://test.url/img.jpg',
      };

      const result = component['construirOrigami'](mockFormData); // Accedemos al método privado
      expect(result).toEqual(expectedOrigami);
    });


  });
});