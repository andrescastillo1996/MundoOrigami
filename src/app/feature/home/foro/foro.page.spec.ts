import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ForoPage } from './foro.page';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicacionCardComponent } from './components/publicacion-card/publicacion-card.component';
import { Publicacion } from './modelos/publicacion.model';
import { ForoService } from './servicios/foro.service';
import { CrearPublicacionModalComponent } from './components/crear-publicacion-modal/crear-publicacion-modal.component';
import { of } from 'rxjs';
import { PublicacionTestDataBuilder } from '@core/mocks/publicacion-test-data-builder';
import { UsuarioTestDataBuilder } from '@core/mocks/usuario-test-data-builder';



describe('ForoPage', () => {
  let component: ForoPage;
  let fixture: ComponentFixture<ForoPage>;
  let mockForoService: jasmine.SpyObj<ForoService>;
  let mockModalController: jasmine.SpyObj<ModalController>;

  let mockModalInstance: jasmine.SpyObj<HTMLIonModalElement>;

  beforeEach(async () => {
    mockForoService = jasmine.createSpyObj('ForoService', ['getPublicaciones']);
    mockModalController = jasmine.createSpyObj('ModalController', ['create']);

    mockModalInstance = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
    mockModalController.create.and.returnValue(Promise.resolve(mockModalInstance));

    await TestBed.configureTestingModule({
      imports: [
        ForoPage,
        IonicModule.forRoot(),
        CommonModule,
        FormsModule,
        PublicacionCardComponent
      ],
      providers: [
        { provide: ForoService, useValue: mockForoService },
        { provide: ModalController, useValue: mockModalController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForoPage);
    component = fixture.componentInstance;

    mockForoService.getPublicaciones.and.returnValue(of([]));

    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });


  describe('ngOnInit', () => {
    it('debería cargar las publicaciones desde el servicio y asignarlas al signal', fakeAsync(() => {
      // Usamos el Test Data Builder para crear las publicaciones de prueba
      const mockPublicaciones: Publicacion[] = [
        new PublicacionTestDataBuilder().conId('1').conAutor(new UsuarioTestDataBuilder().conNombre('diego')).conTitulo('Mi Primera Publicación').construir(),
        new PublicacionTestDataBuilder().conId('2').conUrl('url').conFecha(new Date()).conTitulo('Otra Publicación Interesante').sinComentarios().construir(),
      ];

      mockForoService.getPublicaciones.and.returnValue(of(mockPublicaciones));

      component.ngOnInit();
      tick();

      expect(mockForoService.getPublicaciones).toHaveBeenCalledTimes(2);
      expect(component.publicaciones()).toEqual(mockPublicaciones);
    }));

    it('debería cargar un array vacío si no hay publicaciones', fakeAsync(() => {
      mockForoService.getPublicaciones.and.returnValue(of([]));

      component.ngOnInit();
      tick();

      expect(component.publicaciones()).toEqual([]);
    }));
  });


});