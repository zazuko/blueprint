import { relationFixture, resourceFixture } from 'projects/blueprint/src/app/testing/rdf-fixtures';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationComponent } from './relation.component';

describe('RelationComponent', () => {
  let component: RelationComponent;
  let fixture: ComponentFixture<RelationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('relation', relationFixture());
    fixture.componentRef.setInput('exploredResource', resourceFixture());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
