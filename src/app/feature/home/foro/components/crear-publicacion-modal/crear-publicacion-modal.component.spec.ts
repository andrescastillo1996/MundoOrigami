/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearPublicacionModalComponent } from './crear-publicacion-modal.component';

xdescribe('CrearPublicacionModalComponent', () => {
  let component: CrearPublicacionModalComponent;
  let fixture: ComponentFixture<CrearPublicacionModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrearPublicacionModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearPublicacionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
