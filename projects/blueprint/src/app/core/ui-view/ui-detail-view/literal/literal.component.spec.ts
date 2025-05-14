import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiteralComponent } from './literal.component';

describe('LiteralComponent', () => {
  let component: LiteralComponent;
  let fixture: ComponentFixture<LiteralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiteralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiteralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
