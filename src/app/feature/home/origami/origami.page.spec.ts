import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router'; // Importar Router directamente
import { RouterTestingModule } from '@angular/router/testing'; // Importar RouterTestingModule
import { ToastController } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { OrigamiPage } from './origami.page';
import { OrigamiService } from './servicios/origami.service';
import { HistorialUsuarioService } from '@shared/historial-usuario/service/historial-usuario.service';

import { CommonModule } from '@angular/common';
import { TextoEstadoPipe } from './pipes/texto-estado.pipe';
import { ColorEstadoPipe } from './pipes/color-estado.pipe';
import { FormsModule } from '@angular/forms';
import { OrigamiFirestoreAdapter } from '@core/adapters/origami-firestore-adapter.service';
import { Origami } from '@core/models/origami';
import { OrigamiTestDataBuilder } from '@core/mocks/origami-test-data-builder';
import { ESTADOS_TUTORIAL } from '@core/constantes/constantes';
import { HistorialUsuarioTestDataBuilder } from '@core/mocks/historial-usuario-test-data-builder';
import { HistorialUsuario } from '@shared/historial-usuario/model/historial-usuario';

import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

let mockOrigamiService: jasmine.SpyObj<OrigamiService>;
let mockHistorialService: jasmine.SpyObj<HistorialUsuarioService>;
let mockToastController: jasmine.SpyObj<ToastController>;
let mockRouter: jasmine.SpyObj<Router>;

const mockFirestore = jasmine.createSpyObj('Firestore', [
  'collection',
  'doc',
  'collectionData',
]);
const mockLoaderService = jasmine.createSpyObj('LoaderService', [
  'showWhileLoading',
]);
const mockOrigamiFirestoreAdapter = jasmine.createSpyObj(
  'OrigamiFirestoreAdapter',
  ['getAllOrigamis']
);

describe('OrigamiPage', () => {
  let component: OrigamiPage;
  let fixture: ComponentFixture<OrigamiPage>;

  beforeAll(() => {
    addIcons({ arrowBackOutline });
  });

  beforeEach(async () => {
    mockOrigamiService = jasmine.createSpyObj('OrigamiService', [
      'getOrigamis',
    ]);
    mockHistorialService = jasmine.createSpyObj('HistorialUsuarioService', [
      'getHistorialDelUsuario',
      'getHistorialPorTutorial',
      'iniciarTutorial',
    ]);
    mockToastController = jasmine.createSpyObj('ToastController', ['create']);

    const mockToast = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    mockToastController.create.and.returnValue(Promise.resolve(mockToast));

    mockLoaderService.showWhileLoading.and.callFake(
      (promise: Promise<any>) => promise
    );
    mockOrigamiFirestoreAdapter.getAllOrigamis.and.returnValue(
      Promise.resolve([])
    );

    await TestBed.configureTestingModule({
      imports: [
        OrigamiPage,
        CommonModule,
        RouterTestingModule.withRoutes([
          { path: 'home/paso-tutorial/:codigo', component: OrigamiPage },
        ]),
        ColorEstadoPipe,
        TextoEstadoPipe,
        FormsModule,
      ],
      providers: [
        {
          provide: OrigamiFirestoreAdapter,
          useValue: mockOrigamiFirestoreAdapter,
        },
        { provide: OrigamiService, useValue: mockOrigamiService },
        { provide: HistorialUsuarioService, useValue: mockHistorialService },
        { provide: ToastController, useValue: mockToastController },
        { provide: 'Firestore', useValue: mockFirestore },
        { provide: 'LoaderService', useValue: mockLoaderService },
      ],
    }).compileComponents();

    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    spyOn(mockRouter, 'navigate').and.returnValue(Promise.resolve(true));

    mockOrigamiService.getOrigamis.and.returnValue(Promise.resolve([]));
    mockHistorialService.getHistorialDelUsuario.and.returnValue(
      Promise.resolve([])
    );
    mockHistorialService.getHistorialPorTutorial.and.returnValue(of(undefined)); // Por defecto, historial undefined
    mockHistorialService.iniciarTutorial.and.returnValue(Promise.resolve());

    fixture = TestBed.createComponent(OrigamiPage);
    component = fixture.componentInstance;
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debería llamar a obtenerOrigamisConEstado al inicializarse', () => {
      spyOn(component as any, 'obtenerOrigamisConEstado');
      fixture.detectChanges();
      expect((component as any).obtenerOrigamisConEstado).toHaveBeenCalled();
    });

    it('debería cargar y fusionar los origamis con el historial del usuario', async () => {
      const origami1 = new OrigamiTestDataBuilder()
        .conCodigo('O001')
        .conEstadoProceso('sin-empezar')
        .construir();
      const origami2 = new OrigamiTestDataBuilder()
        .conCodigo('O002')
        .conEstadoProceso('sin-empezar')
        .construir();
      const mockOrigamis: Origami[] = [origami1, origami2];

      const historial1 = new HistorialUsuarioTestDataBuilder()
        .conUid('11')
        .conFechaInicio('13131')
        .conTutorialCodigo('O001')
        .conEstadoProceso(ESTADOS_TUTORIAL.FINALIZADO)
        .construir();
      const historial2 = new HistorialUsuarioTestDataBuilder()
        .conFechaFin('131')
        .conTutorialCodigo('O003')
        .conEstadoProceso(ESTADOS_TUTORIAL.EN_EJECUCION)
        .construir();
      const mockHistorial: HistorialUsuario[] = [historial1, historial2];

      mockOrigamiService.getOrigamis.and.returnValue(
        Promise.resolve(mockOrigamis)
      );
      mockHistorialService.getHistorialDelUsuario.and.returnValue(
        Promise.resolve(mockHistorial)
      );

      fixture.detectChanges();
      await fixture.whenStable();

      const expectedOrigamis = [
        { ...origami1, estadoProceso: ESTADOS_TUTORIAL.FINALIZADO },
        { ...origami2, estadoProceso: ESTADOS_TUTORIAL.SIN_EMPEZAR },
      ];

      expect(component.origamis()).toEqual(expectedOrigamis);
    });

    it('debería establecer el estadoProceso por defecto a SIN_EMPEZAR si no hay historial', async () => {
      const origami1 = new OrigamiTestDataBuilder()
        .conCodigo('O001')
        .construir();
      mockOrigamiService.getOrigamis.and.returnValue(
        Promise.resolve([origami1])
      );
      mockHistorialService.getHistorialDelUsuario.and.returnValue(
        Promise.resolve([])
      );

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.origamis()[0].estadoProceso).toBe(
        ESTADOS_TUTORIAL.SIN_EMPEZAR
      );
    });
  });

  describe('filtroEstado y origamisFiltrados', () => {
    let mockData: Origami[];
    let mockHistorialParaFiltros: HistorialUsuario[];

    beforeEach(async () => {
      const origami1 = new OrigamiTestDataBuilder().conCodigo('A').construir();
      const origami2 = new OrigamiTestDataBuilder().conCodigo('B').construir();
      const origami3 = new OrigamiTestDataBuilder().conCodigo('C').construir();
      const origami4 = new OrigamiTestDataBuilder().conCodigo('D').construir();

      mockData = [origami1, origami2, origami3, origami4];

      mockHistorialParaFiltros = [
        new HistorialUsuarioTestDataBuilder()
          .conTutorialCodigo('B')
          .conEstadoProceso(ESTADOS_TUTORIAL.EN_EJECUCION)
          .construir(),
        new HistorialUsuarioTestDataBuilder()
          .conTutorialCodigo('C')
          .conEstadoProceso(ESTADOS_TUTORIAL.FINALIZADO)
          .construir(),
      ];

      mockOrigamiService.getOrigamis.and.returnValue(Promise.resolve(mockData));
      mockHistorialService.getHistorialDelUsuario.and.returnValue(
        Promise.resolve(mockHistorialParaFiltros)
      );

      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('debería retornar todos los origamis cuando el filtro es "todos"', () => {
      component.filtroEstado.set('todos');
      const data = component.origamisFiltrados();

      const expectedOrigamis = [
        { ...mockData[0], estadoProceso: ESTADOS_TUTORIAL.SIN_EMPEZAR },
        { ...mockData[1], estadoProceso: ESTADOS_TUTORIAL.EN_EJECUCION },
        { ...mockData[2], estadoProceso: ESTADOS_TUTORIAL.FINALIZADO },
        { ...mockData[3], estadoProceso: ESTADOS_TUTORIAL.SIN_EMPEZAR },
      ];

      expect(data.length).toEqual(mockData.length);
      expect(data).toEqual(expectedOrigamis);
    });

    it('debería filtrar origamis por "sin-empezar"', () => {
      component.filtroEstado.set('sin-empezar');
      const filteredData = component.origamisFiltrados();
      expect(filteredData.length).toBe(2);
      expect(filteredData).toEqual([
        { ...mockData[0], estadoProceso: ESTADOS_TUTORIAL.SIN_EMPEZAR },
        { ...mockData[3], estadoProceso: ESTADOS_TUTORIAL.SIN_EMPEZAR },
      ]);
    });

    it('debería filtrar origamis por "en-ejecucion"', () => {
      component.filtroEstado.set('en-ejecucion');
      const filteredData = component.origamisFiltrados();
      expect(filteredData.length).toBe(1);
      expect(filteredData).toEqual([
        { ...mockData[1], estadoProceso: ESTADOS_TUTORIAL.EN_EJECUCION },
      ]);
    });

    it('debería filtrar origamis por "finalizado"', () => {
      component.filtroEstado.set('finalizado');
      const filteredData = component.origamisFiltrados();
      expect(filteredData.length).toBe(1);
      expect(filteredData).toEqual([
        { ...mockData[2], estadoProceso: ESTADOS_TUTORIAL.FINALIZADO },
      ]);
    });
  });

  describe('irATutorialDeOrigami', () => {
    let codigoOrigami = 'O001';
    let iniciarTutorialSpy: jasmine.Spy;
    let comenzarTutorialSpy: jasmine.Spy;

    beforeEach(() => {
      iniciarTutorialSpy = mockHistorialService.iniciarTutorial;
      comenzarTutorialSpy = spyOn(
        component as any,
        'comenzarTutorial'
      ).and.callThrough();

      // **IMPORTANTE para este describe:**
      // Configura getHistorialPorTutorial para devolver un historial ya en progreso
      // cuando no se espera que iniciarTutorial sea llamado por comenzarTutorial.
      mockHistorialService.getHistorialPorTutorial.and.callFake(
        (code: string) => {
          const existingHistorial = new HistorialUsuarioTestDataBuilder()
            .conTutorialCodigo(code)
            .conEstadoProceso(ESTADOS_TUTORIAL.EN_EJECUCION) // Simula un estado ya iniciado
            .construir();
          return of(existingHistorial);
        }
      );

      // Limpia el spy de iniciarTutorial antes de cada test en este bloque
      iniciarTutorialSpy.calls.reset();
    });

    it('debería llamar a historialService.iniciarTutorial si el estado es SIN_EMPEZAR', async () => {
      // Para este test específico, queremos que comenzarTutorial sí llame a iniciarTutorial.
      // Por lo tanto, sobreescribimos el mock para este caso.
      mockHistorialService.getHistorialPorTutorial.and.returnValue(
        of(undefined)
      );
      await component.irATutorialDeOrigami(
        codigoOrigami,
        ESTADOS_TUTORIAL.SIN_EMPEZAR
      );
      expect(iniciarTutorialSpy).toHaveBeenCalledWith(codigoOrigami);
    });

    it('NO debería llamar a historialService.iniciarTutorial si el estado NO es SIN_EMPEZAR', async () => {
      // Gracias al mock en el beforeEach de este describe, cuando se llame a comenzarTutorial
      // no se debería activar la llamada a iniciarTutorial.
      await component.irATutorialDeOrigami(
        codigoOrigami,
        ESTADOS_TUTORIAL.EN_EJECUCION
      );
      expect(iniciarTutorialSpy).not.toHaveBeenCalled();

      await component.irATutorialDeOrigami(
        codigoOrigami,
        ESTADOS_TUTORIAL.FINALIZADO
      );
      expect(iniciarTutorialSpy).not.toHaveBeenCalled();
    });

    it('debería llamar siempre a comenzarTutorial', async () => {
      await component.irATutorialDeOrigami(
        codigoOrigami,
        ESTADOS_TUTORIAL.SIN_EMPEZAR
      );
      expect(comenzarTutorialSpy).toHaveBeenCalledWith(codigoOrigami);

      await component.irATutorialDeOrigami(
        codigoOrigami,
        ESTADOS_TUTORIAL.EN_EJECUCION
      );
      expect(comenzarTutorialSpy).toHaveBeenCalledWith(codigoOrigami);
    });
  });

  describe('comenzarTutorial (método privado)', () => {
    let codigo = 'TEST001';
    let mostrarToastSpy: jasmine.Spy;

    beforeEach(() => {
      mostrarToastSpy = spyOn(component as any, 'mostrarToast');
      mockRouter.navigate.and.returnValue(Promise.resolve(true));
    });

    it('debería iniciar el tutorial y mostrar toast si el historial es SIN_EMPEZAR', async () => {
      const historialSinEmpezar = new HistorialUsuarioTestDataBuilder()
        .conTutorialCodigo(codigo)
        .conEstadoProceso(ESTADOS_TUTORIAL.SIN_EMPEZAR)
        .construir();
      mockHistorialService.getHistorialPorTutorial.and.returnValue(
        of(historialSinEmpezar)
      );

      await (component as any).comenzarTutorial(codigo);

      expect(mockHistorialService.iniciarTutorial).toHaveBeenCalledWith(codigo);
      expect(mostrarToastSpy).toHaveBeenCalledWith('¡Tutorial iniciado!');
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/home/paso-tutorial',
        codigo,
      ]);
    });

    it('debería iniciar el tutorial y mostrar toast si NO hay historial (undefined)', async () => {
      mockHistorialService.getHistorialPorTutorial.and.returnValue(
        of(undefined)
      );

      await (component as any).comenzarTutorial(codigo);

      expect(mockHistorialService.iniciarTutorial).toHaveBeenCalledWith(codigo);
      expect(mostrarToastSpy).toHaveBeenCalledWith('¡Tutorial iniciado!');
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/home/paso-tutorial',
        codigo,
      ]);
    });

    it('NO debería iniciar el tutorial ni mostrar toast si el historial ya está EN_EJECUCION', async () => {
      const historialEnEjecucion = new HistorialUsuarioTestDataBuilder()
        .conTutorialCodigo(codigo)
        .conEstadoProceso(ESTADOS_TUTORIAL.EN_EJECUCION)
        .construir();
      mockHistorialService.getHistorialPorTutorial.and.returnValue(
        of(historialEnEjecucion)
      );

      await (component as any).comenzarTutorial(codigo);

      expect(mockHistorialService.iniciarTutorial).not.toHaveBeenCalled();
      expect(mostrarToastSpy).not.toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/home/paso-tutorial',
        codigo,
      ]);
    });

    it('NO debería iniciar el tutorial ni mostrar toast si el historial ya está FINALIZADO', async () => {
      const historialFinalizado = new HistorialUsuarioTestDataBuilder()
        .conTutorialCodigo(codigo)
        .conEstadoProceso(ESTADOS_TUTORIAL.FINALIZADO)
        .construir();
      mockHistorialService.getHistorialPorTutorial.and.returnValue(
        of(historialFinalizado)
      );

      await (component as any).comenzarTutorial(codigo);

      expect(mockHistorialService.iniciarTutorial).not.toHaveBeenCalled();
      expect(mostrarToastSpy).not.toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/home/paso-tutorial',
        codigo,
      ]);
    });

    it('debería manejar errores y mostrar toast de error', async () => {
      const errorMessage = 'Simulated error';
      mockHistorialService.getHistorialPorTutorial.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      const consoleErrorSpy = spyOn(console, 'error');

      await (component as any).comenzarTutorial(codigo);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error al comenzar tutorial:',
        jasmine.any(Error)
      );
      expect(mostrarToastSpy).toHaveBeenCalledWith(
        'Error al iniciar el tutorial'
      );
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('mostrarToast (método privado)', () => {
    it('debería crear y presentar un toast con el mensaje correcto', async () => {
      const mensaje = 'Mensaje de prueba';
      const mockToastInstance = jasmine.createSpyObj('HTMLIonToastElement', [
        'present',
      ]);
      mockToastController.create.and.returnValue(
        Promise.resolve(mockToastInstance)
      );

      await (component as any).mostrarToast(mensaje);

      expect(mockToastController.create).toHaveBeenCalledWith({
        message: mensaje,
        duration: 2000,
        color: 'primary',
      });
      expect(mockToastInstance.present).toHaveBeenCalledTimes(1);
    });
  });
});
