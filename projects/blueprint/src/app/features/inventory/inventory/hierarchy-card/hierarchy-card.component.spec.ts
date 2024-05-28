import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchyCardComponent } from './hierarchy-card.component';

describe('HierarchyCardComponent', () => {
  let component: HierarchyCardComponent;
  let fixture: ComponentFixture<HierarchyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HierarchyCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HierarchyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
