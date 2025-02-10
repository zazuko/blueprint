import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { RouterModule } from '@angular/router';

import { ThemeManager } from '@blueprint/service/theme-manager/theme-manager.service';
import { MessageLoggerService } from '@blueprint/service/message-logger/message-logger.service';
@Component({
    selector: 'bp-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterModule, ServiceWorkerModule]
})
export class AppComponent {
  private readonly domSanitizer = inject(DomSanitizer);
  private readonly themeManager = inject(ThemeManager);
  private readonly messageLogger = inject(MessageLoggerService);


}
