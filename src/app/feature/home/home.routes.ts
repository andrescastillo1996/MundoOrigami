import { Routes } from '@angular/router';
import { HistoriaOrigamiService } from './historia-origami/servicios/historia-origami.service';

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
    path: 'tutoriales',
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
];
