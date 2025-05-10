// src/app/pages/admin/admin.page.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AdminPage {
  constructor() {}
}
