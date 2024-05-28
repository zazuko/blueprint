import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from '../core/layout/navigation/navigation.component';
import { LoadingIndicatorComponent } from "../core/component/loading-indicator/loading-indicator.component";

@Component({
  selector: 'bp-blueprint',
  standalone: true,
  templateUrl: './blueprint.component.html',
  styleUrl: './blueprint.component.scss',
  imports: [RouterOutlet, NavigationComponent, LoadingIndicatorComponent]
})
export class BlueprintComponent {

}
