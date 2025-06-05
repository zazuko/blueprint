import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkListItemComponent } from './link-list-item.component';

describe('ListItemComponent', () => {
  let component: LinkListItemComponent;
  let fixture: ComponentFixture<LinkListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkListItemComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LinkListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
