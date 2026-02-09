import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

export type ChatMessage = { username: string; message: string; ts: number };

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  private messages$ = new BehaviorSubject<ChatMessage[]>([]);
  public readonly messagesObs$ = this.messages$.asObservable();

  constructor() {
    this.socket = io(`http://${location.hostname}:3000`, { transports: ['websocket'] });

    this.socket.on('chat:init', (msgs: ChatMessage[]) => {
      this.messages$.next(msgs || []);
    });

    this.socket.on('chat:message', (msg: ChatMessage) => {
      this.messages$.next([...this.messages$.value, msg]);
    });
  }

  sendMessage(username: string, message: string) {
    this.socket.emit('chat:message', { username, message });
  }
}
