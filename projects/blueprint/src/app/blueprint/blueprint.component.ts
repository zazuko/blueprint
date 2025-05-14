import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingIndicatorComponent } from "../core/component/loading-indicator/loading-indicator.component";
import { NavigationComponent } from './layout/navigation/navigation.component';

/**
 * This is the main component of the application. Providing the theme selector and the router outlet.
 * It is the entry point of the application. Everything is loaded inside this component.
 * 
 */
@Component({
    selector: 'bp-blueprint',
    templateUrl: './blueprint.component.html',
    styleUrl: './blueprint.component.scss',
    imports: [
        RouterOutlet,
        NavigationComponent,
        LoadingIndicatorComponent
    ]
})
export class BlueprintComponent {

}
