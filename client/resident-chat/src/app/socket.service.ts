import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

export type ChatItem =
  | { kind: 'chat'; username: string; text: string; ts: number }
  | { kind: 'system'; text: string; ts: number };

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  private items$ = new BehaviorSubject<ChatItem[]>([]);
  public readonly itemsObs$ = this.items$.asObservable();
  private joined = false;

  constructor() {
    const socketUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
    this.socket = io(socketUrl, { transports: ['websocket'] });

    this.socket.on('chat:init', (items: any[]) => {
      this.items$.next((items || []).map(normalizeItem));
    });

    this.socket.on('chat:message', (item: any) => {
      this.items$.next([...this.items$.value, normalizeItem(item)]);
    });

    this.socket.on('chat:system', (item: any) => {
      this.items$.next([...this.items$.value, normalizeItem(item)]);
    });
  }

  join(username: string) {
    const u = username.trim();
    if (!u || this.joined) return;
    this.joined = true;
    this.socket.emit('user:join', { username: u });
  }

  sendMessage(username: string, message: string) {
    this.join(username);
    this.socket.emit('chat:message', { username, message });
  }
}

function normalizeItem(x: any): ChatItem {
  if (!x) return { kind: 'system', text: 'Invalid message', ts: Date.now() };

  // New format
  if (x.kind === 'system' && typeof x.text === 'string') return x as ChatItem;
  if (x.kind === 'chat' && typeof x.text === 'string' && typeof x.username === 'string') return x as ChatItem;

  // Old format: { username, message, ts }
  if (typeof x.username === 'string' && typeof x.message === 'string') {
    return { kind: 'chat', username: x.username, text: x.message, ts: x.ts ?? Date.now() };
  }

  return { kind: 'system', text: String(x.text ?? x.message ?? 'System'), ts: x.ts ?? Date.now() };
}
