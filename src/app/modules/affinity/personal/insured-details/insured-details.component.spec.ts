import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuredDetailsComponent } from './insured-details.component';

describe('InsuredDetailsComponent', () => {
  let component: InsuredDetailsComponent;
  let fixture: ComponentFixture<InsuredDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsuredDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuredDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
