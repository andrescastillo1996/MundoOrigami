/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PublicacionCardComponent } from './publicacion-card.component';

describe('PublicacionCardComponent', () => {
  let component: PublicacionCardComponent;
  let fixture: ComponentFixture<PublicacionCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PublicacionCardComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicacionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
