import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AutenticacionService } from '@core/autenticacion/autenticacion.service';
import { ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let mockAuthService: jasmine.SpyObj<AutenticacionService>;
  let mockToastController: jasmine.SpyObj<ToastController>;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AutenticacionService', [
      'iniciarSesion',
    ]);
    mockToastController = jasmine.createSpyObj('ToastController', ['create']);

    const mockToast = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    mockToastController.create.and.returnValue(Promise.resolve(mockToast));

    await TestBed.configureTestingModule({
      imports: [
        LoginPage,
        ReactiveFormsModule,
        IonicModule.forRoot(),
        CommonModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        FormBuilder,
        { provide: AutenticacionService, useValue: mockAuthService },
        { provide: ToastController, useValue: mockToastController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);

    fixture.detectChanges();
  });

  it('should create the LoginPage component', () => {
    expect(component).toBeTruthy();
  });

  // --- Form Initialization Tests ---
  describe('Form Initialization', () => {
    it('should initialize the form with empty values', () => {
      expect(component.formularioLogin).toBeDefined();
      expect(component.formularioLogin.get('correo')?.value).toBe('');
      expect(component.formularioLogin.get('contrasena')?.value).toBe('');
    });

    it('should have required and email validators for "correo"', () => {
      const correoControl = component.formularioLogin.get('correo');
      // Test the effect of the validator: mark as touched to trigger validation
      correoControl?.markAsTouched();
      expect(correoControl?.hasError('required')).toBeTrue();
      correoControl?.setValue('test@'); // Invalid email
      expect(correoControl?.hasError('email')).toBeTrue();
      correoControl?.setValue('test@example.com'); // Valid email
      expect(correoControl?.valid).toBeTrue();
    });

    // MODIFIED TEST: Check for the 'minlength' error directly
    it('should have required and minLength(6) validators for "contrasena"', () => {
      const contrasenaControl = component.formularioLogin.get('contrasena');
      // Test 'required' validator
      contrasenaControl?.markAsTouched();
      expect(contrasenaControl?.hasError('required')).toBeTrue();

      // Test 'minlength' validator
      contrasenaControl?.setValue('123'); // Less than 6 characters
      expect(contrasenaControl?.hasError('minlength')).toBeTrue();
      expect(contrasenaControl?.errors?.['minlength'].requiredLength).toBe(6); // Optionally check requiredLength

      contrasenaControl?.setValue('123456'); // 6 characters (valid)
      expect(contrasenaControl?.valid).toBeTrue();
    });

    it('should be invalid when the form is empty', () => {
      expect(component.formularioLogin.invalid).toBeTrue();
    });

    it('should be invalid with an invalid email format', () => {
      component.formularioLogin.controls['correo'].setValue('invalid-email');
      component.formularioLogin.controls['contrasena'].setValue('password123');
      expect(component.formularioLogin.invalid).toBeTrue();
      expect(
        component.formularioLogin.get('correo')?.errors?.['email']
      ).toBeTrue();
    });

    it('should be invalid if the password is less than 6 characters', () => {
      component.formularioLogin.controls['correo'].setValue('test@example.com');
      component.formularioLogin.controls['contrasena'].setValue('short');
      expect(component.formularioLogin.invalid).toBeTrue();
      expect(
        component.formularioLogin.get('contrasena')?.errors?.['minlength']
      ).toBeDefined();
    });

    it('should be valid with valid inputs', () => {
      component.formularioLogin.controls['correo'].setValue('test@example.com');
      component.formularioLogin.controls['contrasena'].setValue('password123');
      expect(component.formularioLogin.valid).toBeTrue();
    });
  });

  // --- Test Getters ---
  describe('Getters', () => {
    it('should return the "correo" control', () => {
      expect(component.correo).toBe(component.formularioLogin.get('correo'));
    });

    it('should return the "contrasena" control', () => {
      expect(component.contrasena).toBe(
        component.formularioLogin.get('contrasena')
      );
    });
  });

  // --- Test iniciarSesion method ---
  describe('iniciarSesion', () => {
    it('should mark all form controls as touched if the form is invalid', async () => {
      spyOn(component.formularioLogin, 'markAllAsTouched');
      component.formularioLogin.controls['correo'].setValue('');

      await component.iniciarSesion();

      expect(component.formularioLogin.markAllAsTouched).toHaveBeenCalled();
      expect(mockAuthService.iniciarSesion).not.toHaveBeenCalled();
      expect(mockToastController.create).not.toHaveBeenCalled();
    });

    it('should NOT call authService.iniciarSesion if the form is invalid', async () => {
      component.formularioLogin.controls['correo'].setValue('');
      await component.iniciarSesion();
      expect(mockAuthService.iniciarSesion).not.toHaveBeenCalled();
    });

    it('should call authService.iniciarSesion with form values if the form is valid', async () => {
      component.formularioLogin.controls['correo'].setValue(
        'valid@example.com'
      );
      component.formularioLogin.controls['contrasena'].setValue(
        'validpassword'
      );

      await component.iniciarSesion();

      expect(mockAuthService.iniciarSesion).toHaveBeenCalledWith(
        'valid@example.com',
        'validpassword'
      );
    });

    it('should show a success toast on successful login', async () => {
      component.formularioLogin.controls['correo'].setValue(
        'valid@example.com'
      );
      component.formularioLogin.controls['contrasena'].setValue(
        'validpassword'
      );
      mockAuthService.iniciarSesion.and.returnValue(Promise.resolve());

      await component.iniciarSesion();

      expect(mockToastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'Inicio de sesión exitoso',
          color: 'primary',
        })
      );
      const toastInstance = await mockToastController.create();
      expect(toastInstance.present).toHaveBeenCalled();
    });

    it('should show an error toast on failed login', async () => {
      const errorMessage = 'Credenciales inválidas';
      component.formularioLogin.controls['correo'].setValue(
        'invalid@example.com'
      );
      component.formularioLogin.controls['contrasena'].setValue(
        'wrongpassword'
      );
      mockAuthService.iniciarSesion.and.returnValue(
        Promise.reject(new Error(errorMessage))
      );

      await component.iniciarSesion();

      expect(mockToastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'Error: ' + errorMessage,
          color: 'danger',
        })
      );
      const toastInstance = await mockToastController.create();
      expect(toastInstance.present).toHaveBeenCalled();
    });
  });

  // --- `mostrarToast` Private Method Tests ---
  describe('mostrarToast private method', () => {
    it('should create and present a toast with default color', async () => {
      const testMessage = 'Test Message';
      await component['mostrarToast'](testMessage);

      expect(mockToastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: testMessage,
          duration: 3000,
          color: 'primary',
        })
      );
      const toastInstance = await mockToastController.create();
      expect(toastInstance.present).toHaveBeenCalled();
    });

    it('should create and present a toast with a specified color', async () => {
      const testMessage = 'Danger Message';
      const testColor = 'danger';
      await component['mostrarToast'](testMessage, testColor);

      expect(mockToastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: testMessage,
          duration: 3000,
          color: testColor,
        })
      );
      const toastInstance = await mockToastController.create();
      expect(toastInstance.present).toHaveBeenCalled();
    });
  });
});
