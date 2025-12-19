import { Component } from '@angular/core';

import { LogoComponent } from '../logo/logo.component';

@Component({
    selector: 'bp-brand-logo',
    imports: [LogoComponent],
    templateUrl: './brand-logo.component.html',
    styleUrl: './brand-logo.component.scss'
})
export class BrandLogoComponent {

}
