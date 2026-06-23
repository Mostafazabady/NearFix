import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingApproval } from './pending-approval';

describe('PendingApproval', () => {
  let component: PendingApproval;
  let fixture: ComponentFixture<PendingApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingApproval],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingApproval);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
