import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-main',
  imports: [IonApp, IonContent, IonRouterOutlet],
  template: `<ion-app>
    <ion-content [fullscreen]="true"> <ion-router-outlet /></ion-content>
  </ion-app> `,
  standalone: true,
})
export class MainComponent {}
