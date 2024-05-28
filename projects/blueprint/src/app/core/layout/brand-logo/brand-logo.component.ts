import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'bp-brand-logo',
  standalone: true,
  imports: [CommonModule, LogoComponent],
  templateUrl: './brand-logo.component.html',
  styleUrl: './brand-logo.component.scss'
})
export class BrandLogoComponent {

}
