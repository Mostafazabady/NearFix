import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhoUs } from './who-us';

describe('WhoUs', () => {
  let component: WhoUs;
  let fixture: ComponentFixture<WhoUs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhoUs],
    }).compileComponents();

    fixture = TestBed.createComponent(WhoUs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
