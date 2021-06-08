import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoaManagementComponent } from './soa-management.component';

describe('SoaManagementComponent', () => {
  let component: SoaManagementComponent;
  let fixture: ComponentFixture<SoaManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoaManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoaManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
