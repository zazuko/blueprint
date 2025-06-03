import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { MessageChannelService } from '../../../service/message-channel/message-channel.service';

@Injectable({
  providedIn: 'root'
})
export class LoadingIndicatorService {
  private readonly messageChannel = inject(MessageChannelService);

  public readonly isLoading = signal<boolean>(false);

  start(): void {
    if (this.isLoading()) {
      this.messageChannel.warn('LoadingIndicatorService: already loading. Check why you call it twice.');
    }
    this.isLoading.set(true);
  }

  done(): void {
    if (!this.isLoading()) {
      this.messageChannel.warn('LoadingIndicatorService: already done. Check why you call it twice.');
    }
    this.isLoading.set(false);
  }
}
