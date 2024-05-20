import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindParkingComponent } from './find-parking.component';

describe('FindParkingComponent', () => {
  let component: FindParkingComponent;
  let fixture: ComponentFixture<FindParkingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FindParkingComponent]
    });
    fixture = TestBed.createComponent(FindParkingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
