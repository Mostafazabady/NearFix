import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtisanAvailableJobs } from './artisan-available-jobs';

describe('ArtisanAvailableJobs', () => {
  let component: ArtisanAvailableJobs;
  let fixture: ComponentFixture<ArtisanAvailableJobs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtisanAvailableJobs],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtisanAvailableJobs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
