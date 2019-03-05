import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabposessionsPage } from './tabposessions.page';

describe('TabposessionsPage', () => {
  let component: TabposessionsPage;
  let fixture: ComponentFixture<TabposessionsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Tab1Page],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabposessionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
