import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-historia-origami',
  templateUrl: './historia-origami.page.html',
  styleUrls: ['./historia-origami.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class HistoriaOrigamiPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
