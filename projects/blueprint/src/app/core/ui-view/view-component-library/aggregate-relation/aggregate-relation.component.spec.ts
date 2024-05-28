import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregateRelationComponent } from './aggregate-relation.component';

describe('AggregateRelationComponent', () => {
  let component: AggregateRelationComponent;
  let fixture: ComponentFixture<AggregateRelationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AggregateRelationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AggregateRelationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
