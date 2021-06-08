import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineSublineManagementComponent } from './line-subline-management.component';

describe('LineSublineManagementComponent', () => {
  let component: LineSublineManagementComponent;
  let fixture: ComponentFixture<LineSublineManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineSublineManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineSublineManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
