import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoriaOrigamiPage } from './historia-origami.page';

describe('HistoriaOrigamiPage', () => {
  let component: HistoriaOrigamiPage;
  let fixture: ComponentFixture<HistoriaOrigamiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoriaOrigamiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
