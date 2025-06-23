import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeElementTableComponent } from './node-element-table.component';

describe('NodeElementTableComponent', () => {
  let component: NodeElementTableComponent;
  let fixture: ComponentFixture<NodeElementTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeElementTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeElementTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
