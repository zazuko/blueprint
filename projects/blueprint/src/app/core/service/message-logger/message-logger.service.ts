import { Injectable, inject } from '@angular/core';
import { Message, MessageChannelService, MessageType } from '../message-channel/message-channel.service';

@Injectable({
  providedIn: 'root'
})
export class MessageLoggerService {
  private readonly messageChannelService = inject(MessageChannelService);

  constructor() {
    this.messageChannelService.error$.subscribe(message => this.logMessage(message));
    this.messageChannelService.warn$.subscribe(message => this.logMessage(message));
    this.messageChannelService.debug$.subscribe(message => this.logMessage(message));
  }

  private logMessage(message: Message): void {
    let color: string;

    switch (message.type) {
      case MessageType.Error:
        color = 'red';
        break;
      case MessageType.Warn:
        color = 'orange';
        break;
      case MessageType.Debug:
        color = 'lightblue';
        break;
    }

    console.log(`%cType: ${message.type.toUpperCase()}\nMessage: ${message.message}${message.details ? `\nDetails: ${message.details}` : ''} ${message.suggestion ? `\nSuggestion: ${message.suggestion}` : ''}\nContext: ${message.context ? `${message.context}` : ''}`, `color: ${color}`);
  }
}

