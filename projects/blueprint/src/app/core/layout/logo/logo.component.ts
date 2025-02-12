import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'bp-logo',
    imports: [CommonModule],
    templateUrl: './logo.component.html',
    styleUrl: './logo.component.scss',
    encapsulation: ViewEncapsulation.ShadowDom
})
export class LogoComponent {


}
