import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageChannelService {

  // channels for sending messages to the message channel that can be subscribed to
  public error$ = new Subject<Message>();
  public warn$ = new Subject<Message>();
  public debug$ = new Subject<Message>();

  error(message: string, error?: any, suggestion?: string): void {
    this.error$.next({ type: MessageType.Error, message, details: error, suggestion, context: this.getContext() });
  }

  warn(message: string, warning?: any, suggestion?: string): void {
    this.warn$.next({ type: MessageType.Warn, message, details: warning, suggestion, context: this.getContext() });
  }

  debug(message: string, debugInfo?: any, suggestion?: string): void {
    this.debug$.next({ type: MessageType.Debug, message, details: debugInfo, suggestion, context: this.getContext() });
  }

  getContext(): string {
    const err = new Error();
    const stack = err.stack.split('\n');
    // stack[0] is the error message
    // stack[1] is the getContext function
    // stack[2] is the function that called getContext
    const context = stack[3] ? stack[3].trim() : 'unknown';
    return context;
  }
}

export enum MessageType {
  Error = 'error',
  Warn = 'warn',
  Debug = 'debug'
}

export interface Message {
  type: MessageType;
  message: string;
  context?: string;
  details?: any;
  suggestion?: string;
}
