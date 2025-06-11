import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PublicacionCardComponent } from './publicacion-card.component';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ForoService } from '../../servicios/foro.service';
import { Publicacion } from '../../modelos/publicacion.model';
import { PublicacionTestDataBuilder } from '@core/mocks/publicacion-test-data-builder';



describe('PublicacionCardComponent', () => {
  let component: PublicacionCardComponent;
  let fixture: ComponentFixture<PublicacionCardComponent>;
  let mockForoService: jasmine.SpyObj<ForoService>;
  let mockModalController: jasmine.SpyObj<ModalController>;

  // Mock de la instancia del modal que ModalController.create() devolverá
  let mockModalInstance: jasmine.SpyObj<HTMLIonModalElement>;

  // Datos de publicación de ejemplo usando el Test Data Builder
  const MOCK_PUBLICACION: Publicacion = new PublicacionTestDataBuilder()
    .conId('pub-test-id')
    .conTitulo('Título de prueba')
    .conDescripcion('Descripción de la publicación de prueba.')
    .construir();

  beforeEach(async () => {
    // Creamos los mocks de los servicios
    mockForoService = jasmine.createSpyObj('ForoService', ['toggleReaccion']);
    mockModalController = jasmine.createSpyObj('ModalController', ['create']);

    // Configuración del mock de la instancia del modal
    mockModalInstance = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
    // Aseguramos que ModalController.create siempre devuelva una promesa resuelta con nuestra instancia mock
    mockModalController.create.and.returnValue(Promise.resolve(mockModalInstance));

    await TestBed.configureTestingModule({
      imports: [
        PublicacionCardComponent, // Importamos el componente standalone
        IonicModule.forRoot(), // Necesario para ModalController y otros componentes Ionic
        CommonModule, // Para directivas como ngIf, ngFor
      ],
      providers: [
        { provide: ForoService, useValue: mockForoService },
        { provide: ModalController, useValue: mockModalController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicacionCardComponent);
    component = fixture.componentInstance;

    // Asignamos el @Input() publicacion antes de la primera detección de cambios
    component.publicacion = MOCK_PUBLICACION;

    fixture.detectChanges(); // Ejecuta ngOnInit y la carga inicial del componente
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // ---
  // Pruebas de Reacciones (Me gusta/No me gusta)
  // ---
  describe('toggleMegusta', () => {
    it('debería llamar a foroService.toggleReaccion con "meGusta" y el ID de la publicación', () => {
      component.toggleMegusta();
      expect(mockForoService.toggleReaccion).toHaveBeenCalledWith(MOCK_PUBLICACION.id, 'meGusta');
      expect(mockForoService.toggleReaccion).toHaveBeenCalledTimes(1);
    });
  });

  describe('toggleNoMegusta', () => {
    it('debería llamar a foroService.toggleReaccion con "noMeGusta" y el ID de la publicación', () => {
      component.toggleNoMegusta();
      expect(mockForoService.toggleReaccion).toHaveBeenCalledWith(MOCK_PUBLICACION.id, 'noMeGusta');
      expect(mockForoService.toggleReaccion).toHaveBeenCalledTimes(1);
    });
  });
});
