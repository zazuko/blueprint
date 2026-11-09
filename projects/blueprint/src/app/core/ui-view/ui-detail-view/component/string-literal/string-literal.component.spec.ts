import { rdfEnvironment } from 'projects/blueprint/src/app/core/rdf/rdf-environment';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StringLiteralComponent } from './string-literal.component';

describe('StringLiteralComponent', () => {
  let component: StringLiteralComponent;
  let fixture: ComponentFixture<StringLiteralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StringLiteralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StringLiteralComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Fixture label');
    fixture.componentRef.setInput('value', [rdfEnvironment.literal('Fixture value')]);
    fixture.componentRef.setInput('tbox', undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
