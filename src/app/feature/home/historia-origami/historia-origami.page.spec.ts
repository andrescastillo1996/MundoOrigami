// src/app/historia-origami/historia-origami.page.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing'; // Removido waitForAsync, ya que lo manejamos con async/await
import { IonicModule } from '@ionic/angular';
import { HistoriaOrigamiPage } from './historia-origami.page';
import { HistoriaOrigamiService } from './servicios/historia-origami.service';
import { of, throwError } from 'rxjs'; // 'of' no es necesario si el servicio devuelve una Promise
import { NoopAnimationsModule } from '@angular/platform-browser/animations'; // Importación necesaria para evitar errores si el componente usa animaciones de Angular Material o similares
import { HistoriaOrigamiTestDataBuilder } from '@core/mocks/historia-origami-test-data-builder'; // Asegúrate de que la ruta sea correcta
import { RouterModule } from '@angular/router';

describe('HistoriaOrigamiPage', () => {
  let component: HistoriaOrigamiPage;
  let fixture: ComponentFixture<HistoriaOrigamiPage>;
  let mockHistoriaService: jasmine.SpyObj<HistoriaOrigamiService>; // Usamos jasmine.SpyObj para un mejor tipado

  // Datos de prueba generados usando el Test Data Builder
  const mockEjemplosPracticos = [
    new HistoriaOrigamiTestDataBuilder()
      .conId('1')
      .conNombre('Avión de papel')
      .conDescripcion('Un clásico avión de papel simple.')
      .conUrl('assets/avion.jpg')
      .construir(),
    new HistoriaOrigamiTestDataBuilder()
      .conId('2')
      .conNombre('Barco de papel')
      .conDescripcion('Un barco básico de origami.')
      .conUrl('assets/barco.jpg')
      .construir(),
    new HistoriaOrigamiTestDataBuilder()
      .conId('3')
      .conNombre('Grulla de papel')
      .conDescripcion('El origami más icónico.')
      .conUrl('assets/grulla.jpg')
      .construir(),
  ];

  beforeEach(async () => { // Usamos async para el setup asíncrono de TestBed
    // Creamos un spyObj para el servicio.
    // getEjemplosPracticos ahora se espera que devuelva una Promise.
    mockHistoriaService = jasmine.createSpyObj('HistoriaOrigamiService', ['getEjemplosPracticos']);

    await TestBed.configureTestingModule({
 
      imports: [
        RouterModule.forRoot([]), // Necesario si el componente usa routerLink
        IonicModule, // Importa IonicModule ya que es un componente Ionic
        NoopAnimationsModule, // Para componentes Angular/Ionic que pueden usar animaciones
        HistoriaOrigamiPage, // Importa el componente standalone directamente
      ],
      providers: [
        { provide: HistoriaOrigamiService, useValue: mockHistoriaService },
      ],
    }).compileComponents(); 

    
    mockHistoriaService.getEjemplosPracticos.and.returnValue(Promise.resolve(mockEjemplosPracticos));

    fixture = TestBed.createComponent(HistoriaOrigamiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {

    it('debería llamar a obtenerEjemplosPracticos y establecer ejemplos_practicos con los datos del servicio', async () => {

      expect(mockHistoriaService.getEjemplosPracticos).toHaveBeenCalledTimes(1);


      await fixture.whenStable(); 
      fixture.detectChanges(); 

      expect(component.ejemplos_practicos()).toEqual(mockEjemplosPracticos);
    });

  
  });
});