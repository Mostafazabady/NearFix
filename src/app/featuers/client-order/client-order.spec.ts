import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientOrder } from './client-order';

describe('ClientOrder', () => {
  let component: ClientOrder;
  let fixture: ComponentFixture<ClientOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientOrder],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
