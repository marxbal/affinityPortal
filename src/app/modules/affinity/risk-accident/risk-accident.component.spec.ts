import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskAccidentComponent } from './risk-accident.component';

describe('RiskAccidentComponent', () => {
  let component: RiskAccidentComponent;
  let fixture: ComponentFixture<RiskAccidentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskAccidentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskAccidentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
