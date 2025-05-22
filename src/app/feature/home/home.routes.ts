import { Routes } from '@angular/router';
import { HistoriaOrigamiService } from './historia-origami/servicios/historia-origami.service';
import { TutorialService } from './tutorial/servicios/tutorial.service';
import { HistorialUsuarioService } from './shared/historial/historial-usuario.service';
import { PasoTutorialService } from './paso-tutorial/servicios/paso-tutorial.service';
import { OrigamiService } from './origami/servicios/origami.service';

export default <Routes>[
  {
    path: '',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
  },
  {
    path: 'historia',
    providers: [HistoriaOrigamiService],
    loadComponent: () =>
      import('./historia-origami/historia-origami.page').then(
        m => m.HistoriaOrigamiPage
      ),
  },
  {
    path: 'tutorial/:codigo',
    providers: [TutorialService, HistorialUsuarioService],
    loadComponent: () =>
      import('./tutorial/tutorial.page').then(m => m.TutorialPage),
  },
  {
    path: 'foro',
    loadComponent: () => import('./foro/foro.page').then(m => m.ForoPage),
  },
  {
    path: 'perfil',
    loadComponent: () => import('./perfil/perfil.page').then(m => m.PerfilPage),
  },

  {
    path: 'origami',
    providers: [HistorialUsuarioService, OrigamiService],
    loadComponent: () =>
      import('./origami/origami.page').then(m => m.OrigamiPage),
  },
  {
    path: 'paso-tutorial/:codigo',
    providers: [HistorialUsuarioService, PasoTutorialService],
    loadComponent: () =>
      import('./paso-tutorial/paso-tutorial.page').then(
        m => m.PasoTutorialPage
      ),
  },
];
