import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InboxManagementComponent } from './inbox-management.component';

describe('InboxManagementComponent', () => {
  let component: InboxManagementComponent;
  let fixture: ComponentFixture<InboxManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboxManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboxManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
