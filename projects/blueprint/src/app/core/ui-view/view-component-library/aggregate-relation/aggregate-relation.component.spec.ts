import { nodeFixture } from 'projects/blueprint/src/app/testing/rdf-fixtures';
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
    fixture.componentRef.setInput('relation', []);
    fixture.componentRef.setInput('subject', nodeFixture());
    fixture.componentRef.setInput('label', 'Fixture relation');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
