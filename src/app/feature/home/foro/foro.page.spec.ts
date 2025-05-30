import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForoPage } from './foro.page';

xdescribe('ForoPage', () => {
  let component: ForoPage;
  let fixture: ComponentFixture<ForoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ForoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
