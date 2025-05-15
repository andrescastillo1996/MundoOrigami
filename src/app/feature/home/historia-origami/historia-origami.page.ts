import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons, IonButton, IonIcon } from '@ionic/angular/standalone';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { inject } from '@angular/core';

@Component({
  selector: 'app-historia-origami',
  templateUrl: './historia-origami.page.html',
  styleUrls: ['./historia-origami.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  CommonModule,
  FormsModule,
  RouterModule,
  ],
})
export class HistoriaOrigamiPage {
  private firestore: Firestore = inject(Firestore);
  ejemplos_practicos = signal<any[]>([]);

  constructor() {
    const ejemplosRef = collection(this.firestore, 'ejemplos_practicos');
    collectionData(ejemplosRef, { idField: 'id' }).subscribe((data) => {
      this.ejemplos_practicos.set(data);
    });
  }
}
