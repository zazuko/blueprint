import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Breadcrumb } from '../model/breadcrumb.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'bp-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {
  @Input({ required: true }) breadcrumb: Breadcrumb;
}
