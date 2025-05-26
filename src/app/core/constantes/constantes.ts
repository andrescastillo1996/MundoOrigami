// 🔐 Autenticación
export const AUTH_MESSAGES = {
  LOGIN_TITLE: 'MUNDO ORIGAMI',
  LOGIN_EMAIL_PLACEHOLDER: 'Correo electrónico',
  LOGIN_PASSWORD_PLACEHOLDER: 'Contraseña',
  LOGIN_BUTTON: 'Iniciar Sesión',
  LOGIN_RESET_PASSWORD: 'Restablecer contraseña',
  LOGIN_NO_ACCOUNT: '¿No tienes cuenta?',
  LOGIN_REGISTER_LINK: 'Regístrate aquí',

  REGISTER_NAME_PLACEHOLDER: 'Nombre',
  REGISTER_CONFIRM_PASSWORD_PLACEHOLDER: 'Confirmar Contraseña',
  REGISTER_ACCEPT_TERMS: '¿Aceptas los términos y condiciones?',
  REGISTER_BUTTON: 'CREAR USUARIO',
  REGISTER_BACK_TO_LOGIN: 'VOLVER AL LOGIN',

  ERROR_EMAIL_REQUIRED: 'Ingrese un correo válido.',
  ERROR_PASSWORD_REQUIRED: 'La contraseña debe tener al menos 6 caracteres.',
  ERROR_NAME_REQUIRED: 'El nombre es obligatorio.',
};

// 🌐 Rutas
export const RUTAS = {
  LOGIN: '/login',
  REGISTER: '/registro',
  HOME: '/home',
  FORGOT_PASSWORD: '/reset-password',
  ADMINISTRADOR: '/admin',
};

// 🎨 Estilos
export const STYLE_CLASSES = {
  ICON_GOOGLE: 'social-icon google',
  ICON_FACEBOOK: 'social-icon facebook',
  ICON_CLOSE: 'social-icon close',
};

// 📦 Imágenes y Recursos
export const ASSETS = {
  LOGO: 'assets/iconos/logo.png',
  AVATAR: 'assets/iconos/avatar.png',
  LOGO_ALT: 'Logo Mundo Origami',
  AVATAR_ALT: 'Avatar',
};

export const COLECCIONES = {
  USUARIOS: 'usuarios',
  EJEMPLOS_PRACTICOS: 'ejemplos_practicos',
  ORIGAMIS: 'origamis',
  TUTORIALES: 'tutoriales',
  PASOS: 'pasos',
};

export const ROLES = {
  ADMINISTRADOR: 'administrador',
  USUARIO: 'usuario',
};

export enum ESTADOS_TUTORIAL {
  SIN_EMPEZAR = 'sin-empezar',
  EN_EJECUCION = 'en-ejecucion',
  FINALIZADO = 'finalizado',
}
