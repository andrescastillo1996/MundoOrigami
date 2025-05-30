import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { of, throwError } from 'rxjs'; // Necesario para observables
import { PasoTutorialPage } from './paso-tutorial.page';
import { PasoTutorialService } from './servicios/paso-tutorial.service';
import { HistorialUsuarioService } from '@shared/historial-usuario/service/historial-usuario.service';
import { PasoTutorial } from '@core/models/paso-tutorial';
import { PasoTutorialTestDataBuilder } from '@core/mocks/paso-tutorial-test-data-builder'; // Importa tu builder
import { provideHttpClient } from '@angular/common/http'; // Necesario para inject(HttpClient) si lo usas indirectamente
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';

// Mocks de servicios
let mockActivatedRoute: any; // Usaremos un objeto simple para simular snapshot.paramMap
let mockRouter: jasmine.SpyObj<Router>;
let mockPasoTutorialService: jasmine.SpyObj<PasoTutorialService>;
let mockHistorialUsuarioService: jasmine.SpyObj<HistorialUsuarioService>;
let mockToastController: jasmine.SpyObj<ToastController>;

// Datos de prueba usando el builder
const MOCK_PASOS_TUTORIAL: PasoTutorial[] = [
  new PasoTutorialTestDataBuilder().conOrden(1).conDescripcion('Paso 1').conTutorialCodigo('T001').construir(),
  new PasoTutorialTestDataBuilder().conOrden(2).conDescripcion('Paso 2').conTutorialCodigo('T001').construir(),
  new PasoTutorialTestDataBuilder().conOrden(3).conDescripcion('Paso 3').conTutorialCodigo('T001').construir(),
];

describe('PasoTutorialPage', () => {
  let component: PasoTutorialPage;
  let fixture: ComponentFixture<PasoTutorialPage>;

  beforeEach(async () => {
    // Inicializar mocks
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => {
            if (key === 'codigo') {
              return 'T001'; // Código de tutorial simulado
            }
            return null;
          },
        },
      },
    };
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockPasoTutorialService = jasmine.createSpyObj('PasoTutorialService', ['getPasosPorCodigoTutorial']);
    mockHistorialUsuarioService = jasmine.createSpyObj('HistorialUsuarioService', ['finalizarTutorial']);
    mockToastController = jasmine.createSpyObj('ToastController', ['create']);

    // Configurar el mock de ToastController para que devuelva un mock de Toast
    const mockToast = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    mockToastController.create.and.returnValue(Promise.resolve(mockToast));

    await TestBed.configureTestingModule({
      imports: [PasoTutorialPage,
        CommonModule,
        RouterModule.forRoot([])
      ], // Importa el componente standalone
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: PasoTutorialService, useValue: mockPasoTutorialService },
        { provide: HistorialUsuarioService, useValue: mockHistorialUsuarioService },
        { provide: ToastController, useValue: mockToastController }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PasoTutorialPage);
    component = fixture.componentInstance;

    // Configurar las respuestas predeterminadas de los mocks para ngOnInit
    mockPasoTutorialService.getPasosPorCodigoTutorial.and.returnValue(Promise.resolve(MOCK_PASOS_TUTORIAL));
    mockHistorialUsuarioService.finalizarTutorial.and.returnValue(Promise.resolve());
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debería obtener el código del tutorial de la ruta', () => {
      fixture.detectChanges(); // Llama a ngOnInit
      expect(component.codigoTutorial).toBe('T001');
    });

    it('debería cargar y ordenar los pasos del tutorial', async () => {
      // Mockear pasos en un orden desordenado para verificar que se ordenan
      const pasosDesordenados: PasoTutorial[] = [
        new PasoTutorialTestDataBuilder().conOrden(3).construir(),
        new PasoTutorialTestDataBuilder().conOrden(1).construir(),
        new PasoTutorialTestDataBuilder().conOrden(2).construir(),
      ];
      mockPasoTutorialService.getPasosPorCodigoTutorial.and.returnValue(Promise.resolve(pasosDesordenados));

      fixture.detectChanges(); // Llama a ngOnInit
      await fixture.whenStable(); // Espera a que las promesas se resuelvan

      expect(mockPasoTutorialService.getPasosPorCodigoTutorial).toHaveBeenCalledWith('T001');
      expect(component.pasos().length).toBe(3);
      expect(component.pasos()[0].orden).toBe(1);
      expect(component.pasos()[1].orden).toBe(2);
      expect(component.pasos()[2].orden).toBe(3);
      expect(component.pasoActualIndex()).toBe(0); // Debe empezar en el primer paso
    });

    it('debería inicializar pasos a vacío si no se encuentran datos', async () => {
      mockPasoTutorialService.getPasosPorCodigoTutorial.and.returnValue(Promise.resolve([]));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.pasos()).toEqual([]);
      expect(component.pasoActualIndex()).toBe(0);
    });
  });

  describe('pasoActual computed signal', () => {
    it('debería devolver el paso correcto según el índice', async () => {
      fixture.detectChanges(); // Dispara ngOnInit para cargar los pasos
      await fixture.whenStable();

      expect(component.pasoActual()).toEqual(MOCK_PASOS_TUTORIAL[0]);

      component.pasoActualIndex.set(1);
      fixture.detectChanges(); // Actualiza la vista para que el signal se re-evalúe si fuera necesario
      expect(component.pasoActual()).toEqual(MOCK_PASOS_TUTORIAL[1]);

      component.pasoActualIndex.set(2);
      fixture.detectChanges();
      expect(component.pasoActual()).toEqual(MOCK_PASOS_TUTORIAL[2]);
    });
  });

  describe('pasoAnterior', () => {
    beforeEach(async () => {
      fixture.detectChanges(); // Carga los pasos
      await fixture.whenStable();
      component.pasoActualIndex.set(1); // Mover a un paso que no sea el primero
    });

    it('debería decrementar el índice del paso actual si no es el primero', () => {
      expect(component.pasoActualIndex()).toBe(1);
      component.pasoAnterior();
      expect(component.pasoActualIndex()).toBe(0);
    });

    it('NO debería decrementar el índice si ya es el primer paso', () => {
      component.pasoActualIndex.set(0); // Asegurarse de que está en el primer paso
      component.pasoAnterior();
      expect(component.pasoActualIndex()).toBe(0); // Debería seguir siendo 0
    });
  });

  describe('siguientePaso', () => {
    beforeEach(async () => {
      fixture.detectChanges(); // Carga los pasos
      await fixture.whenStable();
    });

    it('debería incrementar el índice del paso actual si no es el último', () => {
      expect(component.pasoActualIndex()).toBe(0);
      component.siguientePaso();
      expect(component.pasoActualIndex()).toBe(1);

      component.siguientePaso();
      expect(component.pasoActualIndex()).toBe(2);
    });

    it('debería llamar a finalizarTutorial si es el último paso', () => {
      spyOn(component, 'finalizarTutorial'); // Espía el método publico
      component.pasoActualIndex.set(MOCK_PASOS_TUTORIAL.length - 1); // Establece el índice al último paso
      component.siguientePaso();
      expect(component.finalizarTutorial).toHaveBeenCalled();
    });
  });

  describe('finalizarTutorial', () => {
    beforeEach(async () => {
      fixture.detectChanges(); // Carga los pasos y el código del tutorial
      await fixture.whenStable();
      spyOn(component as any, 'mostrarToast'); // Espía el método privado mostrarToast
    });

    it('debería llamar a historialService.finalizarTutorial y navegar a /home/origami al finalizar exitosamente', async () => {
      await component.finalizarTutorial();

      expect(mockHistorialUsuarioService.finalizarTutorial).toHaveBeenCalledWith('T001');
      expect((component as any).mostrarToast).toHaveBeenCalledWith('¡Tutorial finalizado!');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('debería mostrar un toast de error y loguear el error si finalizarTutorial falla', async () => {
      const errorMessage = 'Error de prueba al finalizar';
      mockHistorialUsuarioService.finalizarTutorial.and.returnValue(Promise.reject(new Error(errorMessage)));
      const consoleErrorSpy = spyOn(console, 'error'); // Espiar console.error para verificar el log

      await component.finalizarTutorial();

      expect(mockHistorialUsuarioService.finalizarTutorial).toHaveBeenCalledWith('T001');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al finalizar el tutorial:', jasmine.any(Error));
      expect((component as any).mostrarToast).toHaveBeenCalledWith('Error al finalizar el tutorial');
      expect(mockRouter.navigate).not.toHaveBeenCalled(); // No debería navegar si hay un error
    });
  });

  describe('mostrarToast', () => {
    it('debería crear y presentar un toast con el mensaje y configuración correctos', async () => {
      const mensaje = 'Mensaje de prueba de toast';
      const mockToastInstance = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
      mockToastController.create.and.returnValue(Promise.resolve(mockToastInstance));

      await (component as any).mostrarToast(mensaje); // Llamar al método privado

      expect(mockToastController.create).toHaveBeenCalledWith({
        message: mensaje,
        duration: 2000,
        position: 'bottom',
        color: 'success',
      });
      expect(mockToastInstance.present).toHaveBeenCalledTimes(1);
    });
  });
});