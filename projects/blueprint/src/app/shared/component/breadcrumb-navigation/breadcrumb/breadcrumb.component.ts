import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Breadcrumb } from '../model/breadcrumb.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'bp-breadcrumb',
  imports: [CommonModule, RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {
  readonly breadcrumb = input.required<Breadcrumb>();
}
