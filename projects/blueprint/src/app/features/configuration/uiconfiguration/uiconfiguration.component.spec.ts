import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UIConfigurationComponent } from './uiconfiguration.component';

describe('UIConfigurationComponent', () => {
  let component: UIConfigurationComponent;
  let fixture: ComponentFixture<UIConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UIConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UIConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
