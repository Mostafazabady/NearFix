import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtisanProfile } from './artisan-profile';

describe('ArtisanProfile', () => {
  let component: ArtisanProfile;
  let fixture: ComponentFixture<ArtisanProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtisanProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtisanProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
