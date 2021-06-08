import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskMotorComponent } from './risk-motor.component';

describe('RiskMotorComponent', () => {
  let component: RiskMotorComponent;
  let fixture: ComponentFixture<RiskMotorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskMotorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskMotorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
