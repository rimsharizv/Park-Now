import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportParkingComponent } from './report-parking.component';

describe('ReportParkingComponent', () => {
  let component: ReportParkingComponent;
  let fixture: ComponentFixture<ReportParkingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportParkingComponent]
    });
    fixture = TestBed.createComponent(ReportParkingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
