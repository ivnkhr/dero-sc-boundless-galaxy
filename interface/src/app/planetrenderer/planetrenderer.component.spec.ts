import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanetrendererComponent } from './planetrenderer.component';

describe('PlanetrendererComponent', () => {
  let component: PlanetrendererComponent;
  let fixture: ComponentFixture<PlanetrendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanetrendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanetrendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
