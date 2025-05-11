import { Component, OnInit } from '@angular/core';

import { MainComponent } from '@core/components/main/main.component';

@Component({
  selector: 'app-root',
  imports: [MainComponent],
  template: `<app-main />`,
  standalone: true,
})
export class AppComponent {}
