import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateArtisanProfile } from './update-artisan-profile';

describe('UpdateArtisanProfile', () => {
  let component: UpdateArtisanProfile;
  let fixture: ComponentFixture<UpdateArtisanProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateArtisanProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateArtisanProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
