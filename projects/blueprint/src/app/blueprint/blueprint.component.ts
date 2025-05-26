import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MessageService, ToastMessageOptions } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { LoadingIndicatorComponent } from "../core/component/loading-indicator/loading-indicator.component";
import { NavigationComponent } from './layout/navigation/navigation.component';
import { MessageChannelService } from '@blueprint/service/message-channel/message-channel.service';

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
        LoadingIndicatorComponent,
        ToastModule
    ],
    providers: [MessageService]

})
export class BlueprintComponent {
    readonly #messageService = inject(MessageService);
    readonly #messageChannelService = inject(MessageChannelService);
    constructor() {
        this.#messageChannelService.error$.subscribe(message => {
            const options: ToastMessageOptions = {
                severity: 'error',
                sticky: true,
                detail: message.message + ' ' + (message.details ? JSON.stringify(message.details, null, 2) : '') + ' What todo' + (message.suggestion ? ' - ' + message.suggestion : ''),
                summary: message.message,
                life: 2000,
                data: {
                    context: message.context,
                    details: message.details,
                    suggestion: message.suggestion
                }

            };
            this.#messageService.add(options);
        }
        );

        this.#messageChannelService.warn$.subscribe(message => {
            const options: ToastMessageOptions = {
                severity: 'warn',
                sticky: false,
                detail: message.message + ' ' + (message.details ? JSON.stringify(message.details, null, 2) : '') + (message.suggestion ? ' - ' + message.suggestion : ''),
                summary: message.message,
                life: 2000,

            };
            this.#messageService.add(options);
        }
        );
    }

}
