import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorPolicyComponent } from './motor-policy.component';

describe('MotorPolicyComponent', () => {
  let component: MotorPolicyComponent;
  let fixture: ComponentFixture<MotorPolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorPolicyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
