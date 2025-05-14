import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemePickerMenuItemComponent } from './theme-picker-menu-item.component';

describe('ThemePickerMenuItemComponent', () => {
  let component: ThemePickerMenuItemComponent;
  let fixture: ComponentFixture<ThemePickerMenuItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemePickerMenuItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThemePickerMenuItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
