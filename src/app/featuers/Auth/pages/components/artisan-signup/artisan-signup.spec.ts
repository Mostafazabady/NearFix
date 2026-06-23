import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtisanSignup } from './artisan-signup';

describe('ArtisanSignup', () => {
  let component: ArtisanSignup;
  let fixture: ComponentFixture<ArtisanSignup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtisanSignup],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtisanSignup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
