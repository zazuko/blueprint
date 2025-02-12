import { Component } from '@angular/core';
import { MindMapComponent } from "../../core/component/mermaid/mind-map/mind-map.component";
import { FlowchartComponent } from "../../core/component/mermaid/flowchart/flowchart.component";

@Component({
    selector: 'bp-playground',
    templateUrl: './playground.component.html',
    styleUrl: './playground.component.scss',
    imports: [MindMapComponent, FlowchartComponent]
})
export class PlaygroundComponent {

}
