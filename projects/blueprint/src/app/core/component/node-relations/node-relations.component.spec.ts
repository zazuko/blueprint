import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeRelationsComponent } from './node-relations.component';

describe('NodeRelationsComponent', () => {
  let component: NodeRelationsComponent;
  let fixture: ComponentFixture<NodeRelationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeRelationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeRelationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
