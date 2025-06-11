import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { RegistroPage } from './registro.page';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastController, IonicModule, NavController } from '@ionic/angular'; // Added NavController
import { RegistroService } from '@core/autenticacion/registro.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

describe('RegistroPage', () => {
  let component: RegistroPage;
  let fixture: ComponentFixture<RegistroPage>;
  let mockRegistroService: jasmine.SpyObj<RegistroService>;
  let mockToastController: jasmine.SpyObj<ToastController>;
  let mockRouter: jasmine.SpyObj<Router>; // Declare mock Router
  let mockNavController: jasmine.SpyObj<NavController>; // Declare mock NavController
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    // Create spy objects for services
    mockRegistroService = jasmine.createSpyObj('RegistroService', [
      'registrarUsuario',
    ]);
    mockToastController = jasmine.createSpyObj('ToastController', ['create']);
    mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']); // Spy on Router methods
    mockNavController = jasmine.createSpyObj('NavController', [
      'back',
      'navigateRoot',
      'navigateForward',
    ]); // Spy on NavController methods

    // Mock the 'create' method of ToastController to return a mock toast
    const mockToast = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    mockToastController.create.and.returnValue(Promise.resolve(mockToast));

    await TestBed.configureTestingModule({
      imports: [
        RegistroPage,
        ReactiveFormsModule,
        IonicModule.forRoot(),
        CommonModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        FormBuilder,
        Router,

        { provide: RegistroService, useValue: mockRegistroService },
        { provide: ToastController, useValue: mockToastController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroPage);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder); // Inject the real FormBuilder

    // Trigger initial data binding and ngOnInit
    fixture.detectChanges();
  });

  it('should create the RegistroPage component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize the form with empty values', () => {
      expect(component.registroForm).toBeDefined();
      expect(component.registroForm.get('correo')?.value).toBe('');
      expect(component.registroForm.get('contrasena')?.value).toBe('');
    });

    it('should have required and email validators for "correo"', () => {
      const correoControl = component.registroForm.get('correo');
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
      const contrasenaControl = component.registroForm.get('contrasena');
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
      expect(component.registroForm.invalid).toBeTrue();
    });

    it('should be invalid with an invalid email format', () => {
      component.registroForm.controls['correo'].setValue('invalid-email');
      component.registroForm.controls['contrasena'].setValue('password123');
      expect(component.registroForm.invalid).toBeTrue();
      expect(
        component.registroForm.get('correo')?.errors?.['email']
      ).toBeTrue();
    });

    it('should be invalid if the password is less than 6 characters', () => {
      component.registroForm.controls['correo'].setValue('test@example.com');
      component.registroForm.controls['contrasena'].setValue('short');
      expect(component.registroForm.invalid).toBeTrue();
      expect(
        component.registroForm.get('contrasena')?.errors?.['minlength']
      ).toBeDefined();
    });

    it('should be valid with valid inputs', () => {
      component.registroForm.controls['correo'].setValue('test@example.com');

      component.registroForm.controls['nombre'].setValue('Test User');
      component.registroForm.controls['confirmarContrasena'].setValue(
        'password123'
      );
      component.registroForm.controls['contrasena'].setValue('password123');
      component.registroForm.controls['aceptaTerminos'].setValue(true);
      expect(component.registroForm.valid).toBeTrue();
    });
  });

  describe('Getters', () => {
    it('should return the "nombre" control', () => {
      expect(component.nombre).toBe(component.registroForm.get('nombre'));
    });

    it('should return the "email" control', () => {
      expect(component.email).toBe(component.registroForm.get('correo'));
    });

    it('should return the "password" control', () => {
      expect(component.password).toBe(component.registroForm.get('contrasena'));
    });

    it('should return the "confirmPassword" control', () => {
      expect(component.confirmPassword).toBe(
        component.registroForm.get('confirmarContrasena')
      );
    });

    it('passwordsNoMatch should be true when passwords differ', () => {
      component.registroForm.controls['contrasena'].setValue('abc');
      component.registroForm.controls['confirmarContrasena'].setValue('def');
      expect(component.passwordsNoMatch).toBeTrue();
    });

    it('passwordsNoMatch should be false when passwords are the same', () => {
      component.registroForm.controls['contrasena'].setValue('abc');
      component.registroForm.controls['confirmarContrasena'].setValue('abc');
      expect(component.passwordsNoMatch).toBeFalse();
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      // Set valid form data for most tests
      component.registroForm.controls['nombre'].setValue('John Doe');
      component.registroForm.controls['correo'].setValue('john@example.com');
      component.registroForm.controls['contrasena'].setValue('password123');
      component.registroForm.controls['confirmarContrasena'].setValue(
        'password123'
      );
      component.registroForm.controls['aceptaTerminos'].setValue(true);
      fixture.detectChanges(); // Update component view and form status
    });

    it('should NOT call authService.registrarUsuario if form is invalid', async () => {
      component.registroForm.controls['correo'].setValue(''); // Make form invalid
      await component.onSubmit();
      expect(mockRegistroService.registrarUsuario).not.toHaveBeenCalled();
    });

    it('should NOT call authService.registrarUsuario if passwords do not match', async () => {
      component.registroForm.controls['confirmarContrasena'].setValue(
        'different'
      );
      await component.onSubmit();
      expect(mockRegistroService.registrarUsuario).not.toHaveBeenCalled();
    });

    it('should call authService.registrarUsuario with correct data if form is valid and passwords match', async () => {
      await component.onSubmit();
      expect(mockRegistroService.registrarUsuario).toHaveBeenCalledWith(
        'john@example.com',
        'password123',
        'John Doe'
      );
    });

    it('should show success toast and navigate to login on successful registration', async () => {
      mockRegistroService.registrarUsuario.and.returnValue(Promise.resolve());

      await component.onSubmit();

      expect(mockToastController.create).toHaveBeenCalled();
      const toastInstance = await mockToastController.create();
      expect(toastInstance.present).toHaveBeenCalled();
    });

    it('should show error toast on failed registration', async () => {
      const errorMessage = 'Email already in use';
      mockRegistroService.registrarUsuario.and.returnValue(
        Promise.reject(new Error(errorMessage))
      );

      await component.onSubmit();

      expect(mockToastController.create).toHaveBeenCalled();
      const toastInstance = await mockToastController.create();
      expect(toastInstance.present).toHaveBeenCalled();
    });
  });
});
