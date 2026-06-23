import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinUs } from './join-us';

describe('JoinUs', () => {
  let component: JoinUs;
  let fixture: ComponentFixture<JoinUs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinUs],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinUs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
