import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TxsPage } from './txs.page';

describe('TxsPage', () => {
  let component: TxsPage;
  let fixture: ComponentFixture<TxsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TxsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TxsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
