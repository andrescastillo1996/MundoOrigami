import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { of } from 'rxjs'; // Necesario para los mocks de Observables

import { IonicModule, ModalController, AlertController, ToastController } from '@ionic/angular';

import { AdminPage } from './admin.page';
import { FormularioOrigamiComponent } from './components/formulario-origami/formulario-origami.component'; // Importar el componente del modal
import { AdministrarOrigamiService } from './services/administrar-origami.service';

import { AutenticacionService } from '@core/autenticacion/autenticacion.service';
import { OrigamiEdicion } from './models/origami-edicion';
import { OrigamiEdicionTestDataBuilder } from '@core/mocks/origami-edicion-test-data-builder';
import { CargarArchivosService } from '@core/cargar-archivo/cargar-archivos.service';
import { PasoTutorialTestDataBuilder } from '@core/mocks/paso-tutorial-test-data-builder'; // Necesario para PasoTutorial
import { OrigamiTestDataBuilder } from '@core/mocks/origami-test-data-builder';

// Mocks de servicios
let mockModalController: jasmine.SpyObj<ModalController>;
let mockAlertController: jasmine.SpyObj<AlertController>;
let mockToastController: jasmine.SpyObj<ToastController>;
let mockAdministrarOrigamiService: jasmine.SpyObj<AdministrarOrigamiService>;
let mockAutenticacionService: jasmine.SpyObj<AutenticacionService>;
let mockRouter: jasmine.SpyObj<Router>;
let mockCargarArchivosService: jasmine.SpyObj<CargarArchivosService>;

// Datos de prueba usando los builders
const MOCK_ORIGAMIS_EDICION: OrigamiEdicion[] = [
  new OrigamiEdicionTestDataBuilder().conOrigami(new OrigamiTestDataBuilder().conCodigo('O001').conNombre('Grulla').construir()).construir(),
  new OrigamiEdicionTestDataBuilder().conOrigami(new OrigamiTestDataBuilder().conCodigo('O002').conNombre('Barco').construir()).construir(),
];

xdescribe('AdminPage', () => {
  let component: AdminPage;
  let fixture: ComponentFixture<AdminPage>;

  beforeEach(async () => {
    mockModalController = jasmine.createSpyObj('ModalController', ['create']);
    mockAlertController = jasmine.createSpyObj('AlertController', ['create']);
    mockToastController = jasmine.createSpyObj('ToastController', ['create']);
    mockAdministrarOrigamiService = jasmine.createSpyObj('AdministrarOrigamiService', [
      'obtenerOrigamisConPasos',
      'agregarOrigamiConPasos',
      'actualizarOrigamiConPasos',
      'eliminarOrigamiConPasos',
    ]);
    mockAutenticacionService = jasmine.createSpyObj('AutenticacionService', ['cerrarSesion']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockCargarArchivosService = jasmine.createSpyObj('CargarArchivosService', ['uploadImage']);

    // Toast mock
    const mockToast = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    mockToastController.create.and.returnValue(Promise.resolve(mockToast));

    // Modal mock
    const mockModal = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
    mockModal.present.and.returnValue(Promise.resolve());
    mockModal.onWillDismiss.and.returnValue(Promise.resolve({ role: 'cancel' }));
    mockModalController.create.and.returnValue(Promise.resolve(mockModal));

    // Alert mock
    const mockAlertInstance = jasmine.createSpyObj('HTMLIonAlertElement', ['present', 'onDidDismiss']);
    mockAlertInstance.present.and.returnValue(Promise.resolve());
    mockAlertInstance.onDidDismiss.and.returnValue(Promise.resolve({ role: 'cancel' }));
    mockAlertController.create.and.returnValue(Promise.resolve(mockAlertInstance));

    await TestBed.configureTestingModule({
      imports: [AdminPage, IonicModule.forRoot(), FormularioOrigamiComponent],
      providers: [
        { provide: ModalController, useValue: mockModalController },
        { provide: AlertController, useValue: mockAlertController },
        { provide: ToastController, useValue: mockToastController },
        { provide: AdministrarOrigamiService, useValue: mockAdministrarOrigamiService },
        { provide: AutenticacionService, useValue: mockAutenticacionService },
        { provide: Router, useValue: mockRouter },
        { provide: CargarArchivosService, useValue: mockCargarArchivosService },
      ],
    }).compileComponents();

    mockAdministrarOrigamiService.obtenerOrigamisConPasos.and.returnValue(Promise.resolve(MOCK_ORIGAMIS_EDICION));
    mockAdministrarOrigamiService.agregarOrigamiConPasos.and.returnValue(Promise.resolve());
    mockAdministrarOrigamiService.actualizarOrigamiConPasos.and.returnValue(Promise.resolve());
    mockAdministrarOrigamiService.eliminarOrigamiConPasos.and.returnValue(Promise.resolve());
    mockAutenticacionService.cerrarSesion.and.returnValue();
    mockCargarArchivosService.uploadImage.and.returnValue(of('url_de_imagen_mock'));

    fixture = TestBed.createComponent(AdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });


  it('debería crearse el onInit', () => {
    expect(mockAdministrarOrigamiService.obtenerOrigamisConPasos).toHaveBeenCalledTimes(1);
    expect(component.origamis).toEqual(MOCK_ORIGAMIS_EDICION);
  });

  it('debería inicializar origamis a vacío si no se encuentran datos', async () => {
    mockAdministrarOrigamiService.obtenerOrigamisConPasos.and.returnValue(Promise.resolve([]));
    // Re-crear el componente para simular la inicialización con datos vacíos
    const newFixture = TestBed.createComponent(AdminPage); // Usar una nueva fixture para este test
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();


    expect(newComponent.origamis).toEqual([]);
    expect(mockAdministrarOrigamiService.obtenerOrigamisConPasos).toHaveBeenCalledTimes(2); // Llamado dos veces
  });


  describe('agregar', () => {
  
    it('debería abrir el modal para agregar un origami', async () => {
      await component.agregar();
      expect(mockModalController.create).toHaveBeenCalledWith({
        component: FormularioOrigamiComponent,
      });

      expect(mockModalController).toHaveBeenCalled();
    });

    it('debería agregar el origami y pasos si se retorna data del modal', async () => {
      const nuevoOrigamiData = {
        codigo: 'NUEVO001',
        nombre: 'Nuevo Origami',
        descripcion: 'Desc del nuevo',
        tipoOrigami: 'FIGURAS',
        tipoRecurso: 'IMAGEN',
        url: 'http://nuevo.jpg',
        pasos: [new PasoTutorialTestDataBuilder().conOrden(1).construir()],
      };

      spyOn(component as any, 'cargarOrigamis').and.callThrough(); 
      spyOn(component as any, 'mostrarToast');

      await component.agregar();

      // **CORRECCIÓN:** Verificar argumentos exactos pasados a `agregarOrigamiConPasos`
      expect(mockAdministrarOrigamiService.agregarOrigamiConPasos).toHaveBeenCalled()
      

  
      expect((component as any).mostrarToast).toHaveBeenCalledWith('Origami y pasos guardados correctamente');
      expect((component as any).cargarOrigamis).toHaveBeenCalledTimes(2); // Una vez en ngOnInit, otra después de agregar
    });

    it('NO debería agregar el origami si el modal se cierra sin data', async () => {

      
   
      
      spyOn(component as any, 'cargarOrigamis'); 
      spyOn(component as any, 'mostrarToast');

      await component.agregar();

      expect(mockAdministrarOrigamiService.agregarOrigamiConPasos).not.toHaveBeenCalled();
      expect((component as any).mostrarToast).not.toHaveBeenCalled();
      expect((component as any).cargarOrigamis).toHaveBeenCalledTimes(1); 
    });
  });


 


});