import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeighborNodesListComponent } from './neighbor-nodes-list.component';

describe('NeighborNodesListComponent', () => {
  let component: NeighborNodesListComponent;
  let fixture: ComponentFixture<NeighborNodesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighborNodesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NeighborNodesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
