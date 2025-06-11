import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HomePage } from './home.page';
import { AlertController, IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AutenticacionService } from '@core/autenticacion/autenticacion.service';
import { provideRouter } from '@angular/router';

describe('HomePage', () => { // fdescribe es útil para enfocarse solo en estas pruebas
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let mockAlertController: jasmine.SpyObj<AlertController>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAutenticacionService: jasmine.SpyObj<AutenticacionService>;

  // Creamos un mock de la instancia del alert para poder espiar su método present()
  let mockAlertInstance: jasmine.SpyObj<HTMLIonAlertElement>;

  beforeEach(async () => {
    mockAlertController = jasmine.createSpyObj('AlertController', ['create']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAutenticacionService = jasmine.createSpyObj('AutenticacionService', ['cerrarSesion']);

    // --- CAMBIO CLAVE AQUÍ ---
    // Preparamos el mock de la instancia de la alerta
    mockAlertInstance = jasmine.createSpyObj('HTMLIonAlertElement', ['present', 'onDidDismiss']);
    // Aseguramos que mockAlertInstance.present() siempre retorne una promesa resuelta.
    // Esto es crucial para que `await alert.present()` dentro del componente se complete.
    mockAlertInstance.present.and.returnValue(Promise.resolve());
    mockAlertInstance.onDidDismiss.and.returnValue(Promise.resolve({role: 'backdrop'})); // Por si se usa didDismiss

    // Aseguramos que create siempre retorne esta instancia mock
    mockAlertController.create.and.returnValue(Promise.resolve(mockAlertInstance));

    await TestBed.configureTestingModule({
      imports: [HomePage, IonicModule],
      providers: [
        { provide: AlertController, useValue: mockAlertController },
        { provide: Router, useValue: mockRouter },
        { provide: AutenticacionService, useValue: mockAutenticacionService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('navegarA', () => {
    it('debería navegar a la ruta especificada', () => {
      const path = 'profile';
      component.navegarA(path);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home', path]);
    });
  });

});