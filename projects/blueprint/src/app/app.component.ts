import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

import { ThemeManager } from '@blueprint/service/theme-manager/theme-manager.service';
import { MessageLoggerService } from '@blueprint/service/message-logger/message-logger.service';
import { UiAppearanceReasonerService } from './core/ui-appearance-reasoner/ui-appearance-reasoner.service';
@Component({
  standalone: true,
  selector: 'bp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterOutlet
  ]
})
export class AppComponent {
  private readonly domSanitizer = inject(DomSanitizer);
  private readonly themeManager = inject(ThemeManager);
  private readonly messageLogger = inject(MessageLoggerService);
  private readonly reasoner = inject(UiAppearanceReasonerService);

}
