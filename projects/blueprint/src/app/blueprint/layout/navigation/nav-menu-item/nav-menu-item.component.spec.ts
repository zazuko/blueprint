import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavMenuItemComponent } from './nav-menu-item.component';

describe('NavMenuItemComponent', () => {
  let component: NavMenuItemComponent;
  let fixture: ComponentFixture<NavMenuItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavMenuItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NavMenuItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
