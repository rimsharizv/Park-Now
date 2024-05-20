import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingFinderComponent } from './parking-finder.component';

describe('ParkingFinderComponent', () => {
  let component: ParkingFinderComponent;
  let fixture: ComponentFixture<ParkingFinderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ParkingFinderComponent]
    });
    fixture = TestBed.createComponent(ParkingFinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
